Run my complete daily UGC outreach session for Orlando.

Use the lead-conductor agent to run the full sequence in order:

1. Pre-flight: read pipeline.csv and suppression-list.csv, report current counts by status, note any verified leads waiting for outreach, note any sent/fu1-sent leads that may be eligible for follow-up today.

2. Research: use the lead-researcher agent to source 5–10 net-new Orlando leads. Focus on verticals underrepresented in the current pipeline.

3. Duplicate check: use the qa-crm-operator agent to verify all new leads before adding them to pipeline.csv. Report any duplicates found.

4. Outreach drafting: use the outreach-writer agent to draft initial emails for all verified leads that have no initial_outreach_date. Present all drafts for my review before marking anything as drafted.

5. Follow-up check: use the follow-up-manager agent to identify any leads eligible for FU1 or FU2 (48–72+ hours with no response). Draft all eligible follow-ups and present for my review.

6. Pipeline QA: use the qa-crm-operator agent to validate all status fields, date columns, and flag any data errors.

7. Audit log: use the daily-audit-reporter agent to generate today's audit log and write it to reports/audit-log-YYYY-MM-DD.md. Output the end-of-day console summary.

Do not skip any phase. Do not send anything without my explicit confirmation. Present all drafts clearly labeled by company and contact.
