# Go-Live Guide — Orlando UGC OS v6

This document explains what is ready, what still needs manual setup, and the exact steps to launch the system.

---

## What Is Already Ready

These files exist and are fully configured in this repo:

| File / Directory | Status | Notes |
|---|---|---|
| `CLAUDE.md` | Ready | All operating rules, outreach standards, pipeline stages, agent roster |
| `.claude/settings.json` | Ready | Stop hook for session logging, read/write permissions |
| `.claude/agents/lead-conductor.md` | Ready | Full daily session orchestration |
| `.claude/agents/lead-researcher.md` | Ready | Lead sourcing and email verification logic |
| `.claude/agents/outreach-writer.md` | Ready | Draft standards and output format |
| `.claude/agents/follow-up-manager.md` | Ready | FU1/FU2 eligibility rules and draft templates |
| `.claude/agents/qa-crm-operator.md` | Ready | Duplicate checks, status validation, suppression handling |
| `.claude/agents/proof-portfolio-manager.md` | Ready | Portfolio tracking and pre-outreach proof checks |
| `.claude/agents/expansion-retainer-manager.md` | Ready | Warm lead and retainer management |
| `.claude/agents/daily-audit-reporter.md` | Ready | Audit log generation and end-of-day summary |
| `.claude/commands/daily-run.md` | Ready | `/daily-run` slash command |
| `.claude/commands/research-leads.md` | Ready | `/research-leads` slash command |
| `.claude/commands/write-outreach.md` | Ready | `/write-outreach` slash command |
| `.claude/commands/send-followups.md` | Ready | `/send-followups` slash command |
| `.claude/commands/audit-pipeline.md` | Ready | `/audit-pipeline` slash command |
| `.claude/commands/end-of-day.md` | Ready | `/end-of-day` slash command |
| `pipeline.csv` | Ready | Correct headers, empty and ready for first leads |
| `suppression-list.csv` | Ready | Correct headers, empty |
| `reports/` | Ready | Directory exists, session-log.txt will be created on first session close |
| `routines/daily-prompt.md` | Ready | Full daily session prompt template |
| `routines/morning-checklist.md` | Ready | Pre-session checklist |
| `routines/evening-checklist.md` | Ready | Post-session checklist |
| `routines/8pm-checklist.md` | Ready | Evening send workflow |

---

## What Still Requires Manual Setup

These cannot be configured automatically — you must complete them before the system is fully live.

### 1. Gmail MCP (for in-session sending)
**Status**: Not configured  
**Blocking**: Outreach can still be drafted and sent manually via Gmail. Not required to start.  
**Setup**: See `docs/mcp-gmail-setup.md`  
**Estimated time**: 20–30 minutes

### 2. Web Search MCP (for live lead research)
**Status**: Not configured — check if Claude's native WebSearch tool is available first  
**Blocking**: Without this, lead-researcher agent cannot search the web. You can manually provide company lists instead.  
**Setup**: See `docs/mcp-web-search-setup.md`  
**Estimated time**: 10–15 minutes (Brave Search option is fastest)

### 3. Google OAuth Credentials
**Status**: Required for Gmail MCP  
**Blocking**: Blocks Gmail MCP only  
**Setup**: Step 2 in `docs/mcp-gmail-setup.md`

### 4. Portfolio Content Verification
**Status**: Requires manual review  
**Blocking**: Outreach should not go out until you confirm https://worldwidewmal.com loads and has relevant Orlando/hospitality content visible  
**Action**: Visit the URL, confirm it loads, confirm it represents your work correctly

### 5. Your Outreach Email Identity
**Status**: Not specified in this system  
**Action**: Confirm which Gmail address you will send from. That address should match your portfolio domain if possible (e.g., yourname@worldwidewmal.com) for credibility. Update the sign-off in outreach drafts accordingly.

---

## Setup Steps — In Order

### Step 1 — Verify Portfolio Is Live
1. Open https://worldwidewmal.com in a browser
2. Confirm it loads and shows relevant UGC/travel content
3. If broken or outdated: fix the website before sending any outreach

### Step 2 — Test the System Without MCPs
1. Open Claude Code in this project directory
2. Confirm you are on branch `main` (or the correct working branch)
3. Ask Claude: "Read CLAUDE.md and summarize the operating rules."
4. Confirm Claude has access to the rules — this verifies CLAUDE.md is loaded

### Step 3 — Test Web Search
1. Ask Claude: "Search the web for boutique hotels in Orlando FL that are active on Instagram."
2. If live results come back: web search is working, proceed
3. If no results: complete web search MCP setup from `docs/mcp-web-search-setup.md`

### Step 4 — Run First Research Test
1. Ask Claude: "Use the lead-researcher agent to find 3 net-new Orlando leads for UGC outreach. Return full lead records."
2. Review the output. Each lead should have a company, website, contact info (or fallback), and a specific UGC fit note.
3. Do not add anything to pipeline.csv yet.

### Step 5 — Run First QA Check
1. Take one of the returned leads and ask: "Use the qa-crm-operator agent to run a duplicate check on [company name] before I add it to the pipeline."
2. Confirm the agent checks both pipeline.csv and suppression-list.csv.

### Step 6 — Run First Outreach Draft
1. Add one confirmed lead to pipeline.csv manually with `status: verified`
2. Ask Claude: "Use the outreach-writer agent to draft initial outreach for [company name]."
3. Review the draft carefully against the outreach standards in CLAUDE.md
4. If it passes all standards: you are ready to begin live sessions

### Step 7 — Configure Gmail MCP (Optional but Recommended)
1. Follow `docs/mcp-gmail-setup.md`
2. Test by sending a test email to yourself
3. After confirmation: future outreach can be sent directly from Claude Code

---

## First Manual Test — Exact Prompt to Run

Copy and paste this prompt to run your first complete dry-run test:

```
Today is [INSERT TODAY'S DATE].

Use the lead-conductor agent to run a dry-run daily session. Do not add anything to pipeline.csv or send any emails during this test — just show me what you would do at each phase.

Phase 1: Read pipeline.csv and suppression-list.csv. Report current state.
Phase 2: Use the lead-researcher agent to find 3 net-new Orlando hospitality leads. Return full lead records but do NOT add them to pipeline.csv.
Phase 3: Run a duplicate check on those 3 leads using the qa-crm-operator agent.
Phase 4: Draft 1 sample initial outreach email for the strongest lead. Show the full draft with standards check.
Phase 5: Check if any existing pipeline leads are eligible for follow-up (there are none yet, but confirm the check runs).
Phase 6: Run a pipeline QA check on the current (empty) pipeline.csv.
Phase 7: Generate a dry-run audit log entry. Do NOT write it to a file — just show me what it would look like.

After each phase, confirm what passed and what would need manual action before going live.
```

---

## Launch Checklist — In Order

- [ ] Portfolio URL (https://worldwidewmal.com) loads and is current
- [ ] Claude Code is running in this project directory
- [ ] CLAUDE.md is being read by Claude (verify with a quick test)
- [ ] Web search is working (native or MCP)
- [ ] Outreach Gmail address is confirmed
- [ ] Dry-run test (above) completed and reviewed
- [ ] pipeline.csv is empty and has correct headers
- [ ] suppression-list.csv is empty and has correct headers
- [ ] Gmail MCP configured (or manual send workflow understood)
- [ ] Morning checklist reviewed (`routines/morning-checklist.md`)
- [ ] **First live session started**

---

## Daily Operating Rhythm

| Time | Action |
|---|---|
| Morning | Run morning checklist. Check Gmail for replies. Update pipeline for any responses. |
| Session | Run `/daily-run` or paste `routines/daily-prompt.md` |
| Afternoon | Review and approve drafted outreach |
| ~8 PM | Send approved outreach via `routines/8pm-checklist.md` |
| Evening | Run `/end-of-day`. Commit pipeline changes. |
