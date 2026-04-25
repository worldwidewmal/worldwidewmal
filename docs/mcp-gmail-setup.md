# Gmail MCP Setup

This document covers how to connect Gmail to Claude Code so the system can send outreach emails directly from your session.

---

## What This Enables

Once configured, you can ask Claude to send approved email drafts directly from your Gmail account without leaving Claude Code. The system will still present drafts for review before sending — nothing sends automatically.

---

## Prerequisites

- A Google account (the Gmail address you use for outreach)
- Claude Code installed and this project open
- Node.js installed (v18 or later recommended)

---

## Step 1 — Install the Gmail MCP Server

The most widely used Gmail MCP is `mcp-gmail` or the Google Workspace MCP. Use the following approach:

```bash
npm install -g @gptscript-ai/gmail-oauth-mcp
```

Or use the official Google Workspace MCP server if available in your Claude Code MCP registry.

**Check the Claude Code MCP marketplace or docs at https://docs.anthropic.com/claude-code for the current recommended Gmail MCP package**, as package names can change.

---

## Step 2 — Create a Google OAuth App

Gmail MCP requires OAuth credentials. You must create these in Google Cloud Console.

1. Go to https://console.cloud.google.com/
2. Create a new project (or use an existing one)
3. Enable the **Gmail API**: APIs & Services → Enable APIs → search "Gmail API" → Enable
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
5. Choose **Desktop app** as the application type
6. Name it (e.g., "worldwidewmal Claude Code")
7. Download the `credentials.json` file
8. Save it somewhere secure on your machine (NOT in this repo)

---

## Step 3 — Configure Claude Code MCP

Add the Gmail MCP to your Claude Code configuration.

Edit `~/.claude/settings.json` (your global Claude Code settings) and add:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": ["-y", "@your-gmail-mcp-package"],
      "env": {
        "GOOGLE_CREDENTIALS_PATH": "/absolute/path/to/credentials.json",
        "GOOGLE_TOKEN_PATH": "/absolute/path/to/token.json"
      }
    }
  }
}
```

Replace `@your-gmail-mcp-package` with the actual package name and update the credential paths.

---

## Step 4 — Authorize Claude Code

On first run, the MCP will open a browser window for OAuth authorization:

1. Start Claude Code in this project
2. Try sending a test message: "Use Gmail MCP to send a test email to [your own address] with subject 'MCP Test' and body 'Test from Claude Code.'"
3. Complete the OAuth flow in the browser
4. A `token.json` file is saved at the path you configured — keep this secure

---

## Step 5 — Test the Connection

Send a test email to yourself:

```
Use the Gmail MCP to send an email:
- To: [your email]
- Subject: Claude Code Gmail MCP Test
- Body: This is a test of the Gmail MCP connection from worldwidewmal's UGC OS.
```

Confirm it arrives in your inbox.

---

## Step 6 — Outreach Send Workflow

Once connected, the send workflow is:

1. Claude drafts the email and presents it for your review (standard in this system)
2. You approve the draft
3. You say: "Send the approved draft to [Company Name] via Gmail"
4. Claude uses Gmail MCP to send and updates pipeline.csv with the send date and status change

---

## Security Notes

- Never commit `credentials.json` or `token.json` to this repo
- Add both to `.gitignore` if they are anywhere near this project directory
- If you revoke access, delete `token.json` and re-authorize

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "MCP server not found" | Verify the package is installed and the settings.json path is correct |
| "Invalid credentials" | Re-download `credentials.json` from Google Cloud Console |
| "Token expired" | Delete `token.json` and re-authorize |
| "Quota exceeded" | Google free tier has daily send limits — check Gmail API quotas in Console |
