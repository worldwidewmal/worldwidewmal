#!/usr/bin/env node
'use strict';

// ─── daily-runner.js ─────────────────────────────────────────────────────────
// Runs the full daily UGC OS session via Anthropic API.
// Called by GitHub Actions at 7 AM ET every day.
// Requires: ANTHROPIC_API_KEY env var
// Optional: SHEETS_WEBHOOK_URL env var (for Google Sheets sync)

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// ─── Anthropic SDK ────────────────────────────────────────────────────────────
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function safeRead(file, fallback = '') {
  try { return fs.readFileSync(file, 'utf8'); } catch { return fallback; }
}

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

// ─── Load context ─────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  const claudeMd  = safeRead(path.join(ROOT, 'CLAUDE.md'));
  const pipeline  = safeRead(path.join(ROOT, 'pipeline.csv'));
  const suppress  = safeRead(path.join(ROOT, 'suppression-list.csv'));
  const tracker   = safeRead(path.join(ROOT, 'data', 'forms-tracker.json'), '[]');
  const today     = new Date().toISOString().split('T')[0];

  return `${claudeMd}

---
## Current Date
${today}

## Current pipeline.csv
${pipeline || '(empty — headers only)'}

## Current suppression-list.csv
${suppress || '(empty)'}

## Current forms-tracker.json
${tracker}

---

You have full read/write access to the repository files. The pipeline runs fully automated — no confirmation steps. Execute all phases in order and write results directly.

After completing all phases, output a JSON block wrapped in <PIPELINE_UPDATES> tags containing:
{
  "new_pipeline_rows": [...],   // array of full CSV row objects to append
  "updated_rows": [...],        // array of {id, field, value} updates
  "new_form_entries": [...],    // array of form tracker entries
  "audit_log": "...",           // full audit log markdown text
  "summary": "..."              // one-paragraph plain-text summary
}
`;
}

// ─── Parse output ─────────────────────────────────────────────────────────────
function extractUpdates(text) {
  const match = text.match(/<PIPELINE_UPDATES>([\s\S]*?)<\/PIPELINE_UPDATES>/);
  if (!match) return null;
  try { return JSON.parse(match[1].trim()); } catch { return null; }
}

// ─── Apply updates ────────────────────────────────────────────────────────────
function applyPipelineUpdates(updates) {
  if (!updates) { log('No structured updates found in response.'); return; }

  const pipelinePath = path.join(ROOT, 'pipeline.csv');
  const raw = safeRead(pipelinePath);
  const lines = raw.trim().split('\n');
  const headers = lines[0];

  // Append new rows
  if (updates.new_pipeline_rows?.length) {
    const newLines = updates.new_pipeline_rows.map(row => {
      const cols = headers.split(',').map(h => h.trim());
      return cols.map(h => {
        const val = row[h] || '';
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',');
    });
    fs.writeFileSync(pipelinePath, lines.join('\n') + '\n' + newLines.join('\n') + '\n');
    log(`Appended ${newLines.length} new pipeline rows.`);
  }

  // Update existing rows
  if (updates.updated_rows?.length) {
    const raw2 = safeRead(pipelinePath);
    const rows = raw2.trim().split('\n');
    const headerCols = rows[0].split(',').map(h => h.trim());
    updates.updated_rows.forEach(({ id, field, value }) => {
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',');
        if (cols[0] === String(id)) {
          const idx = headerCols.indexOf(field);
          if (idx !== -1) cols[idx] = value;
          rows[i] = cols.join(',');
        }
      }
    });
    fs.writeFileSync(pipelinePath, rows.join('\n') + '\n');
    log(`Applied ${updates.updated_rows.length} field updates.`);
  }

  // Append form tracker entries
  if (updates.new_form_entries?.length) {
    const trackerPath = path.join(ROOT, 'data', 'forms-tracker.json');
    let tracker = [];
    try { tracker = JSON.parse(safeRead(trackerPath, '[]')); } catch {}
    const existingUrls = new Set(tracker.map(e => e.form_url));
    updates.new_form_entries.forEach(entry => {
      if (!existingUrls.has(entry.form_url)) {
        tracker.push(entry);
        existingUrls.add(entry.form_url);
      }
    });
    fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));
    log(`Appended ${updates.new_form_entries.length} form tracker entries.`);
  }

  // Write audit log
  if (updates.audit_log) {
    const today = new Date().toISOString().split('T')[0];
    const logPath = path.join(ROOT, 'reports', `audit-log-${today}.md`);
    fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
    fs.writeFileSync(logPath, updates.audit_log);
    log(`Audit log written to reports/audit-log-${today}.md`);
  }

  if (updates.summary) {
    log('─── SESSION SUMMARY ───────────────────────────────────');
    log(updates.summary);
    log('───────────────────────────────────────────────────────');
  }
}

// ─── Sync to sheets ───────────────────────────────────────────────────────────
function syncSheets() {
  if (!process.env.SHEETS_WEBHOOK_URL) {
    log('SHEETS_WEBHOOK_URL not set — skipping Sheets sync.');
    return;
  }
  try {
    execSync('node scripts/sheets-sync.js', { cwd: ROOT, stdio: 'inherit' });
  } catch (err) {
    log(`Sheets sync failed: ${err.message}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log('=== UGC OS Daily Runner starting ===');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[runner] ANTHROPIC_API_KEY not set. Exiting.');
    process.exit(1);
  }

  const systemPrompt = buildSystemPrompt();

  const userPrompt = `Run today's complete daily session for the Orlando UGC OS:

1. Pre-flight: read pipeline.csv and suppression-list.csv, note current state
2. Form finder: find 5 net-new Orlando influencer/creator application forms. Check forms-tracker.json for dedup. Submit any forms that don't require video uploads using worldwidewmal info. Add each to the new_form_entries array.
3. Lead research: find 3–5 net-new verified Orlando leads (email confirmed from official source only). Add to new_pipeline_rows.
4. Outreach drafting: draft initial emails for all verified leads that have no initial_outreach_date. Include full email text in the audit log. Mark each as drafted in updated_rows.
5. Follow-up check: check sent/fu1-sent leads for 48h+ eligibility. Draft FU1/FU2 if due.
6. Pipeline QA: validate all statuses and dates.
7. Audit log: write a complete markdown audit log for today.

Output the full <PIPELINE_UPDATES> JSON block at the end with all changes.`;

  log('Calling Claude API…');
  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 8096,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: userPrompt }],
  });

  const text = response.content[0].text;
  log(`Response received (${text.length} chars).`);

  const updates = extractUpdates(text);
  applyPipelineUpdates(updates);
  syncSheets();

  // Append session log
  const sessionLogPath = path.join(ROOT, 'reports', 'session-log.txt');
  fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
  const ts = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false });
  fs.appendFileSync(sessionLogPath, `[${ts}] Daily runner completed\n`);

  log('=== Daily runner complete ===');
}

main().catch(err => {
  console.error('[runner] Fatal error:', err);
  process.exit(1);
});
