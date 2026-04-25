# Daily Session Prompt

Copy and paste this prompt to start a full daily Orlando UGC outreach session.

---

Run my full daily UGC outreach session for Orlando using the lead-conductor agent.

Today's date is [INSERT DATE].

Run the complete 7-phase sequence:

**Phase 1 — Pre-Flight**: Read pipeline.csv and suppression-list.csv. Report all current status counts and identify any leads waiting for outreach or follow-up today.

**Phase 2 — Lead Research**: Use the lead-researcher agent to source 5–10 net-new Orlando leads. Prioritize hotels, restaurants, and attractions. Focus on verticals with fewer pipeline entries. Every lead must have a specific UGC fit note.

**Phase 3 — Duplicate Check**: Use the qa-crm-operator agent to verify all new leads against pipeline.csv and suppression-list.csv before I add them. Report every flag.

**Phase 4 — Initial Outreach Drafts**: Use the outreach-writer agent to draft initial emails for all verified leads with no initial_outreach_date. Present all drafts for my review. Each draft must include a specific observation, tailored concept, single CTA, under 150 words, and the portfolio link once.

**Phase 5 — Follow-Up Check**: Use the follow-up-manager agent to check all sent and fu1-sent leads. Draft FU1 for any lead 48–72+ hours old with no response. Draft FU2 for any fu1-sent lead 48–72+ hours old with no response. No FU3.

**Phase 6 — Pipeline QA**: Use the qa-crm-operator agent to validate all pipeline data. Flag any status errors, missing fields, or logical inconsistencies.

**Phase 7 — Audit Log**: Use the daily-audit-reporter agent to generate today's audit log and write it to reports/audit-log-[DATE].md. Output the end-of-day summary.

Present all drafts for my review before marking anything as drafted or updating any status. Do not send anything without my confirmation.
