Render the full Orlando UGC OS dashboard as formatted output directly in this conversation. Do this inline — no agents, no file writes, read-only.

Read all data files and output every section below in sequence. Format for clean mobile reading.

---

## SECTION 1 — PIPELINE SUMMARY

Read `pipeline.csv`. Count rows by status. Output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ORLANDO UGC OS  —  DASHBOARD
  [today's date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PIPELINE
─────────────────────────────────────────────────
Total leads:      X
New:              X
No email:         X
Verified:         X  ← ready to draft
Drafted:          X  ← ready to send
Sent:             X
FU1 sent:         X
FU2 sent:         X
Replied:          X  ★
Booked:           X  ★
Closed:           X  ★
Rejected:         X
Suppressed:       X
```

---

## SECTION 2 — FOLLOW-UP QUEUE

Scan `pipeline.csv`:
- status = `sent` AND initial_outreach_date is 48+ hours ago → FU1 eligible
- status = `fu1-sent` AND follow_up_1_date is 48+ hours ago → FU2 eligible

Output:

```
📬 FOLLOW-UPS
─────────────────────────────────────────────────
FU1 eligible (X):
  → Company Name           sent X.X days ago
  → Company Name           sent X.X days ago

FU2 eligible (X):
  → Company Name           FU1 sent X.X days ago
```

If none eligible, say "None eligible right now."

---

## SECTION 3 — OUTREACH QUEUE

Scan `pipeline.csv`:
- status = `verified` → ready to draft initial outreach
- status = `drafted` → ready to send

Output:

```
✍️  OUTREACH QUEUE
─────────────────────────────────────────────────
Ready to draft (X):
  → Company Name           Vertical      email@domain.com
  → Company Name           Vertical      email@domain.com

Drafted / ready to send (X):
  ✔ Company Name           email@domain.com
```

---

## SECTION 4 — AGENT STATUS

Read each file in `data/agent_state/`:
- lead-conductor.json
- lead-researcher.json
- outreach-writer.json
- follow-up-manager.json
- qa-crm-operator.json
- proof-portfolio-manager.json
- expansion-retainer-manager.json
- daily-audit-reporter.json

Output:

```
🤖 AGENTS
─────────────────────────────────────────────────
◎ Lead Conductor          idle
◉ Lead Researcher         idle
◈ Outreach Writer         idle
◆ Follow-Up Manager       idle
◇ QA / CRM Operator       idle
▣ Proof & Portfolio       idle
▤ Expansion & Retainer    idle
▦ Daily Audit Reporter    idle
```

Status icons: idle=○  running=● [RUNNING]  blocked=✖ [BLOCKED]  error=✖ [ERROR]  completed=✔

If any agent has a current_task, show it on the next line indented: `   → current task text`
If any agent has blockers, show them flagged.

---

## SECTION 5 — BLOCKERS & WARNINGS

Collect all non-empty `blockers` and `warnings` arrays from all agent state files.

```
🚨 BLOCKERS
─────────────────────────────────────────────────
No blockers ✔

⚠️  WARNINGS
─────────────────────────────────────────────────
No warnings ✔
```

If there are blockers or warnings, list each one with the agent name.

---

## SECTION 6 — AUDIT LOG

Read the most recent file matching `reports/audit-log-YYYY-MM-DD.md`.
Show the full content of that file.

Then read `reports/session-log.txt` and show the last 5 lines.

```
📋 AUDIT LOG  —  [filename]
─────────────────────────────────────────────────
[full log content]

🕐 RECENT SESSIONS
─────────────────────────────────────────────────
[last 5 lines of session-log.txt]
```

---

## SECTION 7 — COMMANDS & FILE STATUS

```
⚙️  COMMANDS  (type in Claude Code)
─────────────────────────────────────────────────
/research-leads    Source 5–10 new verified Orlando leads
/write-outreach    Draft emails for all verified leads
/send-followups    Draft FU1/FU2 for eligible leads
/audit-pipeline    Full pipeline integrity check
/end-of-day        Generate today's audit log
/status            Quick status panel (overview only)
/daily-run         Complete daily session end-to-end

📁 FILE CHECKS
─────────────────────────────────────────────────
✔/✖  pipeline.csv
✔/✖  suppression-list.csv
✔/✖  CLAUDE.md
✔/✖  data/agent_state/  (8 files)
✔/✖  reports/
✔/✖  .claude/agents/    (8 agents)
✔/✖  .claude/commands/  (7 commands)
```

Check each path actually exists and use ✔ or ✖ accordingly.

---

After all 7 sections, end with one line:

```
─────────────────────────────────────────────────
Dashboard rendered at [time]. Type /dashboard to refresh.
```

Do not modify any files. This command is fully read-only.
