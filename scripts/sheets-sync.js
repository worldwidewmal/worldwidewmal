#!/usr/bin/env node
'use strict';

// ─── sheets-sync.js ──────────────────────────────────────────────────────────
// Syncs pipeline.csv and forms-tracker.json to Google Sheets via Apps Script.
// Called automatically by agents after any pipeline update.
// Set SHEETS_WEBHOOK_URL env var to your deployed Apps Script URL.

const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const ROOT          = path.resolve(__dirname, '..');
const PIPELINE_CSV  = path.join(ROOT, 'pipeline.csv');
const FORMS_TRACKER = path.join(ROOT, 'data', 'forms-tracker.json');
const WEBHOOK_URL   = process.env.SHEETS_WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.log('[sheets-sync] SHEETS_WEBHOOK_URL not set — skipping sync.');
  process.exit(0);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function safeRead(file, fallback) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return fallback; }
}

function parseCSVLine(line) {
  const fields = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && !inQ)                     { inQ = true; continue; }
    if (c === '"' && inQ && line[i+1] === '"') { cur += '"'; i++; continue; }
    if (c === '"' && inQ)                      { inQ = false; continue; }
    if (c === ',' && !inQ)                     { fields.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  fields.push(cur.trim());
  return fields;
}

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const lib  = url.startsWith('https') ? https : http;
    const u    = new URL(url);
    const req  = lib.request({
      hostname: u.hostname, port: u.port || (url.startsWith('https') ? 443 : 80),
      path: u.pathname + u.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve({ ok: false, raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Build payloads ──────────────────────────────────────────────────────────
async function main() {
  const today = new Date().toISOString().split('T')[0];

  // ── Outreach tab: all leads with a contact email ──────────────────────────
  const pipeline = parseCSV(safeRead(PIPELINE_CSV, ''));
  const outreachRows = pipeline
    .filter(r => r.contact_email)
    .map(r => ({
      company:      r.company,
      email:        r.contact_email,
      vertical:     r.vertical,
      date_added:   r.date_added || today,
      initial_sent: ['sent','fu1-sent','fu2-sent','replied','booked','closed'].includes(r.status),
      fu1_sent:     ['fu1-sent','fu2-sent','replied','booked','closed'].includes(r.status),
      fu2_sent:     ['fu2-sent','replied','booked','closed'].includes(r.status),
    }));

  // ── Forms tab: all entries from forms-tracker.json ───────────────────────
  let formsRows = [];
  try {
    const tracker = JSON.parse(safeRead(FORMS_TRACKER, '[]'));
    formsRows = tracker.map(f => ({
      company:    f.company,
      form_url:   f.form_url,
      vertical:   f.vertical,
      date_added: f.date_added || today,
      submitted:  f.submitted || false,
    }));
  } catch {}

  // ── Sync both tabs ────────────────────────────────────────────────────────
  console.log(`[sheets-sync] Syncing ${outreachRows.length} outreach rows, ${formsRows.length} form rows…`);

  const [outRes, formRes] = await Promise.all([
    outreachRows.length ? post(WEBHOOK_URL, { tab: 'outreach', rows: outreachRows }) : Promise.resolve({ ok: true, skipped: true }),
    formsRows.length    ? post(WEBHOOK_URL, { tab: 'forms',    rows: formsRows    }) : Promise.resolve({ ok: true, skipped: true }),
  ]);

  console.log('[sheets-sync] Outreach tab:', JSON.stringify(outRes));
  console.log('[sheets-sync] Forms tab:   ', JSON.stringify(formRes));

  if (!outRes.ok || !formRes.ok) process.exit(1);
  console.log('[sheets-sync] Done.');
}

main().catch(err => { console.error('[sheets-sync] Error:', err.message); process.exit(1); });
