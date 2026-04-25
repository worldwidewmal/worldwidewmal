# Morning Pre-Session Checklist

Complete this before starting the daily outreach session.

---

## 1. Gmail Check (2 min)
- [ ] Check inbox for any responses to sent outreach
- [ ] For each reply: note the company name, response type (positive / negative / neutral / opt-out)
- [ ] For any opt-out: add to suppression-list.csv and update pipeline.csv status to `suppressed` before doing anything else

## 2. Pipeline Quick Review (2 min)
- [ ] Open pipeline.csv
- [ ] Note any leads with status `sent` that are now 48–72+ hours old → eligible for FU1
- [ ] Note any leads with status `fu1-sent` that are now 48–72+ hours old → eligible for FU2
- [ ] Note any leads with status `verified` waiting for initial outreach

## 3. Portfolio Check (1 min)
- [ ] Confirm https://worldwidewmal.com loads correctly
- [ ] If broken: do not send outreach until resolved

## 4. Date Confirmation
- [ ] Confirm today's date before starting — all pipeline date entries depend on this being accurate

## 5. Session Start
- [ ] Open Claude Code in this project directory
- [ ] Run `/daily-run` or paste the prompt from `routines/daily-prompt.md` with today's date filled in

---

**Do not start outreach if:**
- There are unprocessed opt-out replies in inbox
- The portfolio URL is broken
- You have not checked pipeline.csv for reply updates
