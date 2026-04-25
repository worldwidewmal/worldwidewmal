# Orlando UGC OS Dashboard

A local web dashboard for operating the worldwidewmal Orlando UGC outreach system.

---

## What Was Built

A lightweight Node.js + Express server with a vanilla HTML/CSS/JS frontend. No build step, no framework — just `npm install` and `npm start`.

**Stack:** Node 18+, Express 4, vanilla JS frontend.

**File structure:**
```
dashboard/
  server.js          Express API server
  package.json       Dependencies (express only)
  public/
    index.html       Dashboard UI
    style.css        Dark premium styles
    app.js           Frontend logic (vanilla JS)

data/
  agent_state/       One JSON file per agent — read/written by server and Claude
    lead-conductor.json
    lead-researcher.json
    outreach-writer.json
    follow-up-manager.json
    qa-crm-operator.json
    proof-portfolio-manager.json
    expansion-retainer-manager.json
    daily-audit-reporter.json
  task_queue/        Task queue JSON files (future use)
  run_history/       Run history logs (future use)
  manual_actions/    Trigger request files written when you click a trigger button
```

**Source of truth files the dashboard reads:**
- `pipeline.csv` — all lead data, statuses, dates
- `suppression-list.csv` — do-not-contact list
- `reports/audit-log-*.md` — daily audit logs
- `reports/session-log.txt` — hook-generated session timestamps
- `data/agent_state/*.json` — agent status and task tracking

---

## How to Start

```bash
cd dashboard
npm install      # first time only
npm start        # starts on http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

For development with auto-restart:
```bash
npm run dev
```

To use a different port:
```bash
PORT=8080 npm start
```

---

## Dashboard Tabs

| Tab | What it shows |
|---|---|
| **Overview** | All 8 agent cards + connection status |
| **Pipeline** | Full pipeline.csv with filters by status and vertical |
| **Follow-Ups** | FU1 and FU2 eligible leads with hours-since-contact |
| **Outreach** | Verified leads ready for initial outreach + drafted queue |
| **Audit** | Audit log file viewer + session log |
| **Errors** | Agent blockers, warnings, failed tasks, pending triggers |
| **Settings** | Env checks, operating rules, all manual trigger buttons |

---

## Agent Cards

Each card shows:
- Status: `idle / running / blocked / error / completed`
- Current task
- Last completed task
- Next queued task
- Tasks completed today / pending / failed / blockers
- Last updated time

Click any card to open the detail drawer with full task history and trigger buttons.

---

## Manual Triggers

Triggers are **always safe** — clicking any trigger button writes a JSON file to `data/manual_actions/`. No outreach is sent, no API is called. The trigger file is a logged request.

To actually execute a trigger, open Claude Code and run the corresponding slash command:

| Dashboard trigger | Claude Code command |
|---|---|
| Fresh Orlando Lead Hunt | `/research-leads` |
| Lead QA / Scoring | `/audit-pipeline` |
| Initial Outreach Draft | `/write-outreach` |
| Follow-Up Queue Generation | `/send-followups` |
| Pipeline QA Review | `/audit-pipeline` |
| Daily Audit Generation | `/end-of-day` |
| 8 PM End-of-Day Checklist | `/end-of-day` |
| Portfolio / Proof Refresh | Ask `proof-portfolio-manager` agent |
| Retainer Expansion Review | Ask `expansion-retainer-manager` agent |

---

## Updating Agent Status

Agents can write their own status to the JSON files at `data/agent_state/<agent-id>.json`. The dashboard reads these files on every refresh (every 30 seconds or manual).

**To update an agent's status from Claude Code:**
```
POST /api/agents/lead-researcher/state
{
  "status": "running",
  "current_task": "Researching boutique hotels in Orlando",
  "last_updated": "2026-04-25T14:30:00Z"
}
```

Or write the JSON file directly.

**Schema for each agent state file:**
```json
{
  "agent_id": "lead-researcher",
  "status": "idle | running | blocked | error | completed",
  "current_task": "string or null",
  "pending_tasks": ["task1", "task2"],
  "completed_tasks": ["task1"],
  "failed_tasks": [],
  "last_updated": "ISO 8601 timestamp",
  "last_run_summary": "string or null",
  "blockers": ["description of blocker"],
  "warnings": ["description of warning"],
  "files_touched": ["pipeline.csv"],
  "leads_touched": ["Company Name"],
  "tasks_completed_today": 3,
  "tasks_pending": 1,
  "enabled": true
}
```

---

## Operating Rules Display

The Settings tab shows all 12 operating rules from CLAUDE.md in a readable format. These are read-only in the dashboard — rules are only changed by editing CLAUDE.md and the agent files.

---

## What Requires External Setup

| Feature | Status | Setup |
|---|---|---|
| Pipeline data | Works immediately | No setup — reads pipeline.csv |
| Audit logs | Works immediately | No setup — reads reports/*.md |
| Agent status | Works immediately | No setup — reads data/agent_state/*.json |
| Gmail MCP | Not connected | See docs/mcp-gmail-setup.md |
| Web search | Not connected | See docs/mcp-web-search-setup.md |
| Live agent execution | Not connected | Use Claude Code to run agents |

---

## Testing

To verify the dashboard is working:

1. Start the server: `cd dashboard && npm start`
2. Open http://localhost:3000
3. The status bar should show pipeline counts (all 0 if pipeline.csv is empty)
4. Click each agent card — the detail drawer should open
5. Go to Settings → click any trigger button → confirm a file appears in `data/manual_actions/`
6. Go to Errors tab — confirm it shows "No blockers"
7. Go to Settings → confirm all file checks show green

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot find module 'express'" | Run `npm install` inside the `dashboard/` directory |
| Port 3000 already in use | Run `PORT=3001 npm start` |
| Pipeline shows 0 leads | pipeline.csv is empty — add leads via Claude Code |
| Agent states all show "idle" | Normal on first run — states update as Claude Code sessions run |
| Audit logs not showing | Run `/end-of-day` in Claude Code to generate the first report |
