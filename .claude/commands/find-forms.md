Use the form-finder agent to find 5 net-new Orlando influencer/creator application forms for today.

Steps:
1. Read data/forms-tracker.json to get all previously tracked form URLs (dedup source).
2. Read pipeline.csv for company names and domains already in the pipeline.
3. Read suppression-list.csv.
4. Search for 5 Orlando hospitality brands with live influencer/creator/ambassador/partnership application forms. Prioritize hotels, restaurants, spas, attractions with strong visual brand identity and active Instagram.
5. For each form found:
   - Confirm it is live and does not require video example uploads.
   - If no video required → submit immediately using worldwidewmal info (portfolio: https://worldwidewmal.com, location: Orlando FL, content: UGC photo/video for hospitality).
   - If video required → log as pending with note "requires video upload".
6. Append all 5 entries to data/forms-tracker.json.
7. Append each as a new row in pipeline.csv (status: sent if submitted, no-email if pending).
8. Run node scripts/sheets-sync.js to push the Forms tab and Email Outreach tab to Google Sheets.
9. Report: how many found, submitted, pending, and what the Sheets sync returned.
