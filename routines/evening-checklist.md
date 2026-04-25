# Evening Post-Session Checklist

Complete this after the daily outreach session and before closing Claude Code.

---

## 1. Confirm Audit Log Written
- [ ] Check that `reports/audit-log-[TODAY'S DATE].md` exists and has been written
- [ ] If missing: run `/end-of-day` before closing

## 2. Confirm Pipeline Updates Are Saved
- [ ] Review pipeline.csv to confirm all status changes from today's session are reflected
- [ ] Confirm all sends from today have the correct `initial_outreach_date`, `follow_up_1_date`, or `follow_up_2_date`

## 3. Confirm Suppression List Is Current
- [ ] Any opt-outs from today have been added to suppression-list.csv
- [ ] Corresponding pipeline.csv rows are marked `suppressed`

## 4. Git Commit (optional but recommended)
- [ ] `git add pipeline.csv suppression-list.csv reports/`
- [ ] `git commit -m "Daily session [DATE] — [n] leads added, [n] outreach drafted"`
- [ ] Push to branch

## 5. Tomorrow Prep
- [ ] Review the "Tomorrow's Top 3 Priorities" from today's audit log
- [ ] Note any leads that will become FU-eligible tomorrow (check initial_outreach_date + 48h)
- [ ] Flag any blocked leads that need manual research tomorrow

## 6. Close Session
- [ ] Close Claude Code (the Stop hook will append a session-end timestamp to reports/session-log.txt)

---

**Session is complete when:**
- Audit log is written
- Pipeline reflects today's actual activity
- Suppression list is current
- No unresolved opt-out requests remain
