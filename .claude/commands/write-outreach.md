Use the outreach-writer agent to draft initial outreach emails for verified leads in pipeline.csv and update pipeline.csv automatically.

Steps:
1. Read pipeline.csv and identify all leads with status: verified and no initial_outreach_date.
2. Check suppression-list.csv to confirm none of those leads are suppressed.
3. For each verified lead, draft an initial email that passes all outreach writing standards: specific observation, tailored concept, single low-friction CTA, under 150 words, no banned phrases, one link max (https://worldwidewmal.com), company-specific personalization confirmed.
4. After drafting, immediately update pipeline.csv: set status to drafted for each lead. No confirmation required.
5. Report all drafts with company name, recipient email, subject line, and full body.

Do not draft for any lead that already has an initial_outreach_date.
Do not draft for any lead with status sent, fu1-sent, fu2-sent, replied, booked, closed, rejected, or suppressed.
