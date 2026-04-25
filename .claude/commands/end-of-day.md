Use the daily-audit-reporter agent to close out today's session.

Steps:
1. Re-read pipeline.csv fresh. Do not use cached counts from earlier in the session.
2. Count leads by status. Calculate today's activity: new leads added, outreach drafted, follow-ups drafted, suppression events.
3. Identify any quality flags or anomalies from today's session.
4. Identify the top 3 priorities for tomorrow based on current pipeline state.
5. Write the full audit log to reports/audit-log-YYYY-MM-DD.md (use today's actual date).
   - If the file already exists, append — do not overwrite.
6. Output the end-of-day console summary.

Also:
- Confirm the session-log.txt entry was appended by the Stop hook (or append it manually if not).
- Confirm all pipeline.csv updates from today's session are saved correctly.

This step is mandatory. Do not close the session without completing it.
