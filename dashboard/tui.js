#!/usr/bin/env node
'use strict';

const blessed = require('blessed');
const fs      = require('fs');
const path    = require('path');

// ─── Paths ──────────────────────────────────────────────────────────────────
const ROOT          = path.resolve(__dirname, '..');
const AGENT_DIR     = path.join(ROOT, 'data', 'agent_state');
const PIPELINE_CSV  = path.join(ROOT, 'pipeline.csv');
const REPORTS_DIR   = path.join(ROOT, 'reports');

const AGENT_IDS = [
  'lead-conductor','lead-researcher','outreach-writer','follow-up-manager',
  'qa-crm-operator','proof-portfolio-manager','expansion-retainer-manager','daily-audit-reporter',
];
const AGENT_META = {
  'lead-conductor':             { display: 'Lead Conductor',          icon: '◎' },
  'lead-researcher':            { display: 'Lead Researcher',         icon: '◉' },
  'outreach-writer':            { display: 'Outreach Writer',         icon: '◈' },
  'follow-up-manager':          { display: 'Follow-Up Manager',       icon: '◆' },
  'qa-crm-operator':            { display: 'QA / CRM Operator',       icon: '◇' },
  'proof-portfolio-manager':    { display: 'Proof & Portfolio',       icon: '▣' },
  'expansion-retainer-manager': { display: 'Expansion & Retainer',   icon: '▤' },
  'daily-audit-reporter':       { display: 'Daily Audit Reporter',    icon: '▦' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function safeRead(file, fallback = '') {
  try { return fs.readFileSync(file, 'utf8'); } catch { return fallback; }
}

function parseCSVLine(line) {
  const fields = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && !inQ)                          { inQ = true; continue; }
    if (c === '"' && inQ && line[i+1] === '"')      { cur += '"'; i++; continue; }
    if (c === '"' && inQ)                           { inQ = false; continue; }
    if (c === ',' && !inQ)                          { fields.push(cur.trim()); cur = ''; continue; }
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

function getAgent(id) {
  try { return JSON.parse(fs.readFileSync(path.join(AGENT_DIR, `${id}.json`), 'utf8')); }
  catch { return { agent_id: id, status: 'idle', current_task: null, blockers: [], warnings: [], failed_tasks: [], tasks_completed_today: 0 }; }
}

function hoursSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d) ? null : (Date.now() - d.getTime()) / 3_600_000;
}

function fmt(dateStr) { return dateStr ? dateStr.substring(0, 10) : '—'; }

function statusTag(s) {
  const map = { running: '{green-fg}', blocked: '{red-fg}', error: '{red-fg}', completed: '{cyan-fg}' };
  const close = { running: '{/green-fg}', blocked: '{/red-fg}', error: '{/red-fg}', completed: '{/cyan-fg}' };
  return (map[s] || '') + s + (close[s] || '');
}

function statusDot(s) {
  if (s === 'running')               return '{green-fg}●{/green-fg}';
  if (s === 'blocked' || s === 'error') return '{red-fg}✖{/red-fg}';
  if (s === 'completed')             return '{cyan-fg}✔{/cyan-fg}';
  return '{#555-fg}○{/#555-fg}';
}

// ─── Screen ──────────────────────────────────────────────────────────────────
const screen = blessed.screen({ smartCSR: true, mouse: true, fullUnicode: true, title: 'Orlando UGC OS' });

const TABS = ['Overview', 'Pipeline', 'Follow-Ups', 'Outreach', 'Audit', 'Errors', 'Settings'];
let activeTab = 0;
let refreshTimer = null;

// Header
const header = blessed.box({
  top: 0, left: 0, width: '100%', height: 3,
  tags: true,
  content: '{center}{yellow-fg}{bold}  ORLANDO UGC OS  —  DASHBOARD{/bold}{/yellow-fg}{/center}',
  style: { bg: '#111111' },
  border: { type: 'line', fg: '#333333' },
});

// Tab bar
const tabBar = blessed.box({
  top: 3, left: 0, width: '100%', height: 1,
  tags: true,
  style: { bg: '#111111', fg: '#888888' },
});

// Scroll hint
const scrollHint = blessed.box({
  top: 4, right: 0, width: 22, height: 1,
  tags: true,
  content: '{#444-fg}↑↓ or mouse to scroll{/#444-fg}',
  style: { bg: '#0a0a0c' },
});

// Main content
const content = blessed.box({
  top: 4, left: 0, width: '100%', height: '100%-6',
  tags: true,
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  vi: true,
  mouse: true,
  style: { bg: '#0a0a0c', fg: '#cccccc' },
  scrollbar: { ch: '│', style: { fg: '#444444' } },
});

// Status bar
const statusBar = blessed.box({
  bottom: 0, left: 0, width: '100%', height: 2,
  tags: true,
  style: { bg: '#111111', fg: '#666666' },
  border: { type: 'line', fg: '#333333' },
});

screen.append(header);
screen.append(tabBar);
screen.append(scrollHint);
screen.append(content);
screen.append(statusBar);
content.focus();

// ─── Tab bar ─────────────────────────────────────────────────────────────────
function renderTabBar() {
  let out = '  ';
  TABS.forEach((name, i) => {
    if (i === activeTab) out += `{black-fg}{yellow-bg} ${i+1}:${name} {/yellow-bg}{/black-fg} `;
    else                 out += `{#555-fg} ${i+1}:${name} {/#555-fg} `;
  });
  tabBar.setContent(out);
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────
function renderOverview() {
  const agents   = AGENT_IDS.map(id => Object.assign({ id }, getAgent(id)));
  const pipeline = parseCSV(safeRead(PIPELINE_CSV));
  const counts   = {};
  pipeline.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
  const c = k => counts[k] || 0;

  let o = '\n';
  o += ' {yellow-fg}{bold}PIPELINE  SUMMARY{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  o += `  Total {bold}${pipeline.length}{/bold}   `;
  o += `New {white-fg}${c('new')}{/white-fg}   `;
  o += `No-Email {white-fg}${c('no-email')}{/white-fg}   `;
  o += `Verified {yellow-fg}${c('verified')}{/yellow-fg}   `;
  o += `Drafted {cyan-fg}${c('drafted')}{/cyan-fg}\n`;
  o += `  Sent {green-fg}${c('sent')}{/green-fg}   `;
  o += `FU1 {green-fg}${c('fu1-sent')}{/green-fg}   `;
  o += `FU2 {green-fg}${c('fu2-sent')}{/green-fg}   `;
  o += `Replied {green-fg}{bold}${c('replied')}{/bold}{/green-fg}   `;
  o += `Booked {green-fg}{bold}${c('booked')}{/bold}{/green-fg}   `;
  o += `Closed {green-fg}{bold}${c('closed')}{/bold}{/green-fg}   `;
  o += `Suppressed {red-fg}${c('suppressed')}{/red-fg}\n\n`;

  o += ' {yellow-fg}{bold}AGENTS{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  agents.forEach(a => {
    const meta  = AGENT_META[a.id] || { display: a.id };
    const dot   = statusDot(a.status);
    const task  = a.current_task ? `  {#888-fg}→ ${a.current_task.substring(0, 50)}{/#888-fg}` : '';
    const blk   = (a.blockers && a.blockers.length) ? ' {red-fg}[BLOCKED]{/red-fg}' : '';
    const today = a.tasks_completed_today ? ` {#555-fg}(${a.tasks_completed_today} done today){/#555-fg}` : '';
    o += `  ${dot}  ${meta.display.padEnd(30)} ${statusTag(a.status)}${blk}${today}${task}\n`;
  });

  const blockers = agents.flatMap(a =>
    (a.blockers || []).map(b => ({ name: (AGENT_META[a.id]||{display:a.id}).display, msg: b }))
  );
  o += '\n {yellow-fg}{bold}BLOCKERS{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!blockers.length) {
    o += '  {green-fg}No blockers  ✔{/green-fg}\n';
  } else {
    blockers.forEach(b => { o += `  {red-fg}✖ ${b.name}:{/red-fg}  ${b.msg}\n`; });
  }

  const sessionLines = safeRead(path.join(REPORTS_DIR, 'session-log.txt')).trim().split('\n').filter(Boolean);
  const lastSession  = sessionLines.slice(-1)[0] || 'No sessions logged yet';
  o += '\n {yellow-fg}{bold}LAST SESSION{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  o += `  {#888-fg}${lastSession}{/#888-fg}\n`;

  content.setContent(o);
  content.scrollTo(0);
}

// ─── Tab: Pipeline ───────────────────────────────────────────────────────────
function renderPipeline() {
  const pipeline = parseCSV(safeRead(PIPELINE_CSV));
  let o = '\n';
  o += ` {yellow-fg}{bold}PIPELINE  (${pipeline.length} leads){/bold}{/yellow-fg}\n`;
  o += ' {#333-fg}' + '─'.repeat(90) + '{/#333-fg}\n';

  if (!pipeline.length) {
    o += '  {#888-fg}Empty. Run /research-leads to add leads.{/#888-fg}\n';
  } else {
    const W = [4, 30, 18, 14, 12, 22];
    const hdr = [
      '#'.padEnd(W[0]), 'Company'.padEnd(W[1]), 'Vertical'.padEnd(W[2]),
      'Status'.padEnd(W[3]), 'Added'.padEnd(W[4]), 'Contact Email'.padEnd(W[5]),
    ].join('  ');
    o += `  {bold}${hdr}{/bold}\n`;
    o += '  {#333-fg}' + '─'.repeat(hdr.length) + '{/#333-fg}\n';

    pipeline.forEach((r, i) => {
      const s = r.status || '';
      let col = '', end = '';
      if (['replied','booked','closed'].includes(s))   { col = '{green-fg}';  end = '{/green-fg}'; }
      else if (['sent','fu1-sent','fu2-sent'].includes(s)) { col = '{cyan-fg}'; end = '{/cyan-fg}'; }
      else if (s === 'suppressed')                     { col = '{red-fg}';    end = '{/red-fg}'; }
      else if (s === 'verified')                       { col = '{yellow-fg}'; end = '{/yellow-fg}'; }

      o += '  ' + [
        String(i+1).padEnd(W[0]),
        (r.company||'').substring(0,W[1]-1).padEnd(W[1]),
        (r.vertical||'').substring(0,W[2]-1).padEnd(W[2]),
        col + s.padEnd(W[3]) + end,
        fmt(r.date_added).padEnd(W[4]),
        (r.contact_email||'—').substring(0,W[5]-1),
      ].join('  ') + '\n';
    });
  }
  content.setContent(o);
  content.scrollTo(0);
}

// ─── Tab: Follow-Ups ─────────────────────────────────────────────────────────
function renderFollowUps() {
  const pipeline = parseCSV(safeRead(PIPELINE_CSV));
  const fu1 = pipeline.filter(r => r.status === 'sent'     && (hoursSince(r.initial_outreach_date)||0) >= 48);
  const fu2 = pipeline.filter(r => r.status === 'fu1-sent' && (hoursSince(r.follow_up_1_date)||0)    >= 48);

  let o = '\n';
  o += ' {yellow-fg}{bold}FOLLOW-UP QUEUE{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n\n';

  o += ` {cyan-fg}{bold}FU1 ELIGIBLE  (${fu1.length}){/bold}{/cyan-fg}   48+ hours since initial outreach\n`;
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!fu1.length) {
    o += '  {#555-fg}None eligible right now.{/#555-fg}\n';
  } else {
    fu1.forEach(r => {
      const days = ((hoursSince(r.initial_outreach_date)||0)/24).toFixed(1);
      o += `  {yellow-fg}→{/yellow-fg}  ${r.company.padEnd(34)} {#888-fg}sent ${days}d ago  ${r.contact_email||''}{/#888-fg}\n`;
    });
  }

  o += `\n {cyan-fg}{bold}FU2 ELIGIBLE  (${fu2.length}){/bold}{/cyan-fg}   48+ hours since FU1\n`;
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!fu2.length) {
    o += '  {#555-fg}None eligible right now.{/#555-fg}\n';
  } else {
    fu2.forEach(r => {
      const days = ((hoursSince(r.follow_up_1_date)||0)/24).toFixed(1);
      o += `  {yellow-fg}→{/yellow-fg}  ${r.company.padEnd(34)} {#888-fg}FU1 sent ${days}d ago  ${r.contact_email||''}{/#888-fg}\n`;
    });
  }

  o += '\n  {#555-fg}Run /send-followups in Claude Code to draft follow-ups for eligible leads.{/#555-fg}\n';
  content.setContent(o);
  content.scrollTo(0);
}

// ─── Tab: Outreach ───────────────────────────────────────────────────────────
function renderOutreach() {
  const pipeline = parseCSV(safeRead(PIPELINE_CSV));
  const verified = pipeline.filter(r => r.status === 'verified');
  const drafted  = pipeline.filter(r => r.status === 'drafted');

  let o = '\n';
  o += ' {yellow-fg}{bold}OUTREACH QUEUE{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n\n';

  o += ` {cyan-fg}{bold}READY TO DRAFT  (${verified.length}){/bold}{/cyan-fg}   verified leads, no prior outreach\n`;
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!verified.length) {
    o += '  {#555-fg}No verified leads waiting. Run /research-leads to add more.{/#555-fg}\n';
  } else {
    verified.forEach(r => {
      o += `  {yellow-fg}→{/yellow-fg}  ${r.company.padEnd(32)} ${(r.vertical||'').padEnd(18)} {#888-fg}${r.contact_email||'no email'}{/#888-fg}\n`;
    });
  }

  o += `\n {cyan-fg}{bold}DRAFTED  (${drafted.length}){/bold}{/cyan-fg}   ready to send\n`;
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!drafted.length) {
    o += '  {#555-fg}No drafted emails pending.{/#555-fg}\n';
  } else {
    drafted.forEach(r => {
      o += `  {green-fg}✔{/green-fg}  ${r.company.padEnd(32)} {#888-fg}${r.contact_email||'—'}{/#888-fg}\n`;
    });
  }

  o += '\n  {#555-fg}Run /write-outreach in Claude Code to draft emails for verified leads.{/#555-fg}\n';
  content.setContent(o);
  content.scrollTo(0);
}

// ─── Tab: Audit ──────────────────────────────────────────────────────────────
function renderAudit() {
  let o = '\n';
  o += ' {yellow-fg}{bold}AUDIT LOGS{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n\n';

  let files = [];
  try { files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('audit-log-') && f.endsWith('.md')).sort().reverse(); }
  catch {}

  if (!files.length) {
    o += '  {#555-fg}No audit logs yet. Run /end-of-day to generate the first one.{/#555-fg}\n';
  } else {
    o += ` {cyan-fg}{bold}${files[0]}{/bold}{/cyan-fg}  {#555-fg}(most recent){/#555-fg}\n\n`;
    const body = safeRead(path.join(REPORTS_DIR, files[0]));
    o += body.split('\n').map(l => '  ' + l).join('\n') + '\n';
    if (files.length > 1) {
      o += `\n  {#555-fg}Older logs: ${files.slice(1).join(', ')}{/#555-fg}\n`;
    }
  }

  const sessions = safeRead(path.join(REPORTS_DIR, 'session-log.txt')).trim().split('\n').filter(Boolean);
  o += '\n {yellow-fg}{bold}SESSION LOG  (last 10){/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!sessions.length) {
    o += '  {#555-fg}No sessions logged yet.{/#555-fg}\n';
  } else {
    sessions.slice(-10).forEach(s => { o += `  {#888-fg}${s}{/#888-fg}\n`; });
  }

  content.setContent(o);
  content.scrollTo(0);
}

// ─── Tab: Errors ─────────────────────────────────────────────────────────────
function renderErrors() {
  const agents   = AGENT_IDS.map(id => Object.assign({ id }, getAgent(id)));
  const blockers = agents.flatMap(a => (a.blockers||[]).map(b => ({ name: (AGENT_META[a.id]||{display:a.id}).display, msg: b })));
  const warnings = agents.flatMap(a => (a.warnings||[]).map(w => ({ name: (AGENT_META[a.id]||{display:a.id}).display, msg: w })));
  const failedAll= agents.flatMap(a => (a.failed_tasks||[]).map(t => ({ name: (AGENT_META[a.id]||{display:a.id}).display, task: t })));

  let o = '\n';

  o += ` {red-fg}{bold}BLOCKERS  (${blockers.length}){/bold}{/red-fg}\n`;
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!blockers.length) o += '  {green-fg}No blockers  ✔{/green-fg}\n';
  else blockers.forEach(b => { o += `  {red-fg}✖{/red-fg}  {bold}${b.name}:{/bold}  ${b.msg}\n`; });

  o += `\n {yellow-fg}{bold}WARNINGS  (${warnings.length}){/bold}{/yellow-fg}\n`;
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!warnings.length) o += '  {green-fg}No warnings  ✔{/green-fg}\n';
  else warnings.forEach(w => { o += `  {yellow-fg}⚠{/yellow-fg}  {bold}${w.name}:{/bold}  ${w.msg}\n`; });

  o += `\n {red-fg}{bold}FAILED TASKS  (${failedAll.length}){/bold}{/red-fg}\n`;
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  if (!failedAll.length) o += '  {green-fg}No failed tasks  ✔{/green-fg}\n';
  else failedAll.forEach(f => { o += `  {red-fg}✖{/red-fg}  {bold}${f.name}:{/bold}  ${f.task}\n`; });

  content.setContent(o);
  content.scrollTo(0);
}

// ─── Tab: Settings ───────────────────────────────────────────────────────────
function renderSettings() {
  let o = '\n';
  o += ' {yellow-fg}{bold}COMMANDS{/bold}{/yellow-fg}   type these in Claude Code\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  const cmds = [
    ['/research-leads',  'Source 5–10 new verified Orlando leads'],
    ['/write-outreach',  'Draft initial emails for all verified leads'],
    ['/send-followups',  'Draft FU1/FU2 for eligible leads (48h window)'],
    ['/audit-pipeline',  'Full pipeline integrity check'],
    ['/end-of-day',      'Generate today\'s audit log'],
    ['/status',          'Print live status panel inline'],
    ['/daily-run',       'Run the complete daily session end-to-end'],
  ];
  cmds.forEach(([cmd, desc]) => {
    o += `  {yellow-fg}${cmd.padEnd(22)}{/yellow-fg}  {#888-fg}${desc}{/#888-fg}\n`;
  });

  o += '\n {yellow-fg}{bold}OPERATING RULES{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  [
    'Orlando web leads are the primary source — no databases',
    'No duplicate companies in pipeline',
    'No duplicate contact layers per role at same company',
    'Initial outreach to net-new companies only',
    'FU1 and FU2 only — no FU3 without explicit override',
    'Follow-ups require 48–72 hour no-response window',
    'No FU3 under any circumstance',
    'Only use confirmed emails — no guessing or construction',
    'Never guess email formats (firstname@company.com)',
    'Fall back to public routes when no verified email exists',
  ].forEach((r, i) => { o += `  {#555-fg}${String(i+1).padStart(2)}.{/#555-fg}  ${r}\n`; });

  o += '\n {yellow-fg}{bold}FILE STATUS{/bold}{/yellow-fg}\n';
  o += ' {#333-fg}' + '─'.repeat(64) + '{/#333-fg}\n';
  [
    [PIPELINE_CSV,                              'pipeline.csv'],
    [path.join(ROOT,'suppression-list.csv'),    'suppression-list.csv'],
    [path.join(ROOT,'CLAUDE.md'),               'CLAUDE.md'],
    [AGENT_DIR,                                 'data/agent_state/'],
    [REPORTS_DIR,                               'reports/'],
    [path.join(ROOT,'.claude','agents'),        '.claude/agents/'],
    [path.join(ROOT,'.claude','commands'),      '.claude/commands/'],
  ].forEach(([p, label]) => {
    const ok = fs.existsSync(p);
    o += `  ${ok ? '{green-fg}✔{/green-fg}' : '{red-fg}✖{/red-fg}'}  ${label}\n`;
  });

  content.setContent(o);
  content.scrollTo(0);
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────
const RENDERERS = [renderOverview, renderPipeline, renderFollowUps, renderOutreach, renderAudit, renderErrors, renderSettings];

function render() {
  renderTabBar();
  RENDERERS[activeTab]();
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  statusBar.setContent(
    `  {bold}Keys:{/bold} {yellow-fg}1-7{/yellow-fg} tabs  {yellow-fg}Tab{/yellow-fg} next  {yellow-fg}r{/yellow-fg} refresh  {yellow-fg}↑↓ / scroll{/yellow-fg} scroll  {yellow-fg}q{/yellow-fg} quit` +
    `{right}  Auto-refresh every 30s   Last: ${now}  `
  );
  screen.render();
}

function switchTab(i) { activeTab = i; content.scrollTo(0); render(); }

// ─── Key bindings ────────────────────────────────────────────────────────────
screen.key(['q','C-c'], () => { if (refreshTimer) clearInterval(refreshTimer); screen.destroy(); process.exit(0); });
screen.key('r', () => render());
screen.key('tab', () => switchTab((activeTab + 1) % TABS.length));
TABS.forEach((_, i) => screen.key(String(i + 1), () => switchTab(i)));

// Click tab bar to switch tabs
tabBar.on('click', data => {
  let pos = 2;
  for (let i = 0; i < TABS.length; i++) {
    const len = TABS[i].length + 4;
    if (data.x >= pos && data.x < pos + len) { switchTab(i); return; }
    pos += len + 1;
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
render();
refreshTimer = setInterval(render, 30_000);
screen.render();
