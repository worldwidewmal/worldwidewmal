Print a live status panel for the Orlando UGC OS. Do this inline — no agents, no file writes.

Read the following files directly and output a formatted terminal summary:

1. **Pipeline counts** — read `pipeline.csv` and count rows by status:
   - new, no-email, verified, drafted, sent, fu1-sent, fu2-sent, replied, booked, closed, rejected, suppressed
   - Also show total lead count

2. **Agent status** — read each of these files and extract `status`, `current_task`, `tasks_completed_today`, `blockers`, `warnings`:
   - data/agent_state/lead-conductor.json
   - data/agent_state/lead-researcher.json
   - data/agent_state/outreach-writer.json
   - data/agent_state/follow-up-manager.json
   - data/agent_state/qa-crm-operator.json
   - data/agent_state/proof-portfolio-manager.json
   - data/agent_state/expansion-retainer-manager.json
   - data/agent_state/daily-audit-reporter.json

3. **Follow-up queue** — read `pipeline.csv` and find all rows where:
   - status is `sent` and `initial_outreach_date` is 48+ hours ago with no reply → FU1 eligible
   - status is `fu1-sent` and `follow_up_1_date` is 48+ hours ago with no reply → FU2 eligible
   - Count each category

4. **Active blockers** — collect all non-empty `blockers` arrays across all agent state files

5. **Recent session** — read `reports/session-log.txt` and show the last 3 lines

Output the panel in this exact format using plain text with unicode box characters. Use today's date (read from system via the date command if needed):

```
╔══════════════════════════════════════════════════════╗
║         ORLANDO UGC OS — LIVE STATUS                ║
║         2026-04-25  [time from last session log]    ║
╠══════════════════════════════════════════════════════╣
║  PIPELINE                                           ║
║  Total: X   Verified: X   Drafted: X   Sent: X     ║
║  FU1-Sent: X   FU2-Sent: X   Replied: X            ║
║  Follow-up eligible → FU1: X   FU2: X              ║
╠══════════════════════════════════════════════════════╣
║  AGENTS                                             ║
║  [icon] Lead Conductor         idle / running / blocked  ║
║  [icon] Lead Researcher        idle                      ║
║  [icon] Outreach Writer        idle                      ║
║  [icon] Follow-Up Manager      idle                      ║
║  [icon] QA / CRM Operator      idle                      ║
║  [icon] Proof & Portfolio      idle                      ║
║  [icon] Expansion & Retainer   idle                      ║
║  [icon] Daily Audit Reporter   idle                      ║
╠══════════════════════════════════════════════════════╣
║  BLOCKERS                                           ║
║  None                                               ║
╠══════════════════════════════════════════════════════╣
║  LAST SESSION                                       ║
║  [last line from session-log.txt]                   ║
╚══════════════════════════════════════════════════════╝
```

Status icons: idle=⬜  running=🟢  blocked=🔴  error=🔴  completed=✅

After the panel, if there are any FU1 or FU2 eligible leads, list them by company name and days since contact.

If any agent has blockers, list each blocker on its own line after the panel.

Do not modify any files. This command is read-only.
