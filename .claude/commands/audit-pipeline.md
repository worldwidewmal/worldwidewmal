Use the qa-crm-operator agent to run a full integrity check on pipeline.csv and suppression-list.csv.

Steps:
1. Read pipeline.csv in full.
2. Validate every row:
   - Status is from the approved list
   - date_added is populated
   - company and website are non-empty
   - Status progression is logical (e.g., fu1-sent must have an initial_outreach_date)
   - Leads marked suppressed appear in suppression-list.csv
3. Check for duplicate companies: same company name or same website domain appearing more than once.
4. Check for duplicate contact layers: same company + same role receiving outreach more than once.
5. Cross-reference all emails against suppression-list.csv.
6. Report every issue found with the row number, field name, and specific problem.
7. Recommend specific corrections for each issue found.

Also read suppression-list.csv and verify:
- All required fields are populated (company, email, date_suppressed, reason)
- Any company suppressed here also has status: suppressed in pipeline.csv

Output a full QA report in the standard format. Do not modify pipeline.csv unless I confirm the corrections.
