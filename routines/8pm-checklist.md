# 8 PM Outreach Send Checklist

This checklist is for the evening outreach window (around 8 PM local time). This is a good time to send or schedule outreach for Orlando-area businesses — emails sent in the evening are often read the following morning.

---

## Before Sending — Final Review

- [ ] All drafts from today's session have been reviewed and approved
- [ ] Each email has been spot-checked for:
  - [ ] Correct recipient name and email (matches pipeline.csv)
  - [ ] Company name spelled correctly in the body
  - [ ] No banned phrases
  - [ ] Portfolio link is correct (https://worldwidewmal.com)
  - [ ] Under 150 words for initial outreach
  - [ ] One CTA only
- [ ] Suppression-list.csv cross-check is complete — no suppressed contacts in the send batch

## Gmail Send Workflow (Manual)

If Gmail MCP is not yet configured (see `docs/mcp-gmail-setup.md`), send manually:

1. Open Gmail
2. For each draft in today's session:
   - Copy subject line exactly as drafted
   - Copy body exactly as drafted (no edits unless flagged)
   - Paste recipient email from pipeline.csv
   - Send
3. After each send, return to pipeline.csv and update:
   - `status`: `sent` (for initial) or `fu1-sent` / `fu2-sent` (for follow-ups)
   - `initial_outreach_date` / `follow_up_1_date` / `follow_up_2_date`: today's date

## Gmail Send Workflow (With Gmail MCP)

If Gmail MCP is configured:
1. Ask Claude to send each approved draft via Gmail MCP
2. Confirm each send individually — do not batch-send without reviewing each
3. Claude will update pipeline.csv after each confirmed send

## After Sending

- [ ] All sent leads have their date fields updated in pipeline.csv
- [ ] Note the count of emails sent tonight in the evening checklist
- [ ] Run `/end-of-day` to generate the final audit log if not already done

---

**Send window recommendation**: 7:30 PM – 9:00 PM local Orlando time (EST/EDT)
**Avoid sending**: After 9 PM, before 7 AM, on Sundays
