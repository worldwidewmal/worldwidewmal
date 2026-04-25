# Web Search MCP Setup

This document covers how to connect a web search tool to Claude Code so the lead-researcher agent can search the live web for Orlando leads.

---

## What This Enables

Without a web search MCP, the lead-researcher agent cannot search the live web — it can only work with URLs you provide manually or content already in context. With a web search MCP configured, it can search Google Maps, local directories, and brand websites in real time.

---

## Option A — Brave Search MCP (Recommended)

Brave Search has a free tier, an official MCP package, and does not require a Google account.

### Step 1 — Get a Brave Search API Key

1. Go to https://api.search.brave.com/
2. Create a free account
3. Navigate to API Keys → Create a new key
4. Copy the key — you will use it in the next step

### Step 2 — Install the Brave Search MCP

```bash
npm install -g @modelcontextprotocol/server-brave-search
```

### Step 3 — Add to Claude Code Settings

Edit `~/.claude/settings.json` and add:

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_brave_api_key_here"
      }
    }
  }
}
```

### Step 4 — Test

Ask Claude: "Use Brave Search to search for boutique hotels in Orlando Florida."

Confirm live results are returned.

---

## Option B — Google Custom Search MCP

Use this if you prefer Google results.

### Step 1 — Create a Google Custom Search Engine

1. Go to https://programmablesearchengine.google.com/
2. Create a new search engine — set it to "Search the entire web"
3. Copy the **Search Engine ID** (cx)

### Step 2 — Get a Google API Key

1. Go to https://console.cloud.google.com/
2. Enable the **Custom Search API**
3. Create an API key under Credentials

### Step 3 — Add to Claude Code Settings

```json
{
  "mcpServers": {
    "google-search": {
      "command": "node",
      "args": ["/path/to/google-search-mcp/index.js"],
      "env": {
        "GOOGLE_API_KEY": "your_google_api_key",
        "GOOGLE_SEARCH_ENGINE_ID": "your_cx_value"
      }
    }
  }
}
```

---

## Option C — Built-In Claude Web Search

Claude has a native WebSearch tool that may already be available in your Claude Code session without MCP configuration. Test first:

Ask Claude: "Search the web for boutique hotels in Orlando FL that are active on Instagram."

If Claude returns live results, web search is already working and no MCP setup is needed.

---

## Verifying Lead Research Works

Once web search is configured, run a test research session:

```
Use the lead-researcher agent to find 3 net-new Orlando restaurants that would be a good fit for UGC. Use web search to find them. Return full lead records with contact emails where available.
```

Expected output: 3 structured lead records with company details, verified emails (or fallback routes), and specific UGC fit notes.

---

## Without Web Search

If no web search MCP is available, the lead-researcher agent can still work with:
- URLs you provide manually
- Lists of companies you paste in
- Research you've done outside Claude

In this case, tell the agent: "I will provide the company list manually — do not attempt to search the web."

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "Tool not found" | MCP server is not running — check settings.json and restart Claude Code |
| "API quota exceeded" | Brave free tier: 2,000 queries/month. Upgrade or switch to Google Custom Search |
| "No results returned" | Check your API key is correct and active |
| Search results are outdated | This is normal for some APIs — add "site:google.com/maps" or similar to queries to get fresher local results |
