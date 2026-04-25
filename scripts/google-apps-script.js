// ─── Google Apps Script — UGC OS Sheets Sync ────────────────────────────────
// Deploy this as a Web App at script.google.com
// Execution: "Me" | Access: "Anyone"
// Copy the deployment URL → set as SHEETS_WEBHOOK_URL env var / GitHub secret

const SHEET_ID = ''; // ← paste your Google Sheet ID here after creating the sheet

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (payload.tab === 'forms') {
      syncForms(ss, payload.rows);
    } else if (payload.tab === 'outreach') {
      syncOutreach(ss, payload.rows);
    } else if (payload.tab === 'update_outreach') {
      updateOutreachStatus(ss, payload.email, payload.field, payload.value);
    } else if (payload.tab === 'update_form') {
      updateFormStatus(ss, payload.form_url, payload.submitted);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── Tab 1: Application Forms ─────────────────────────────────────────────────
function syncForms(ss, rows) {
  let sheet = ss.getSheetByName('Application Forms');
  if (!sheet) {
    sheet = ss.insertSheet('Application Forms');
    const headers = ['Company', 'Form URL', 'Vertical', 'Date Added', 'Submitted ✓'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1a1a1e')
      .setFontColor('#c9a056');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 380);
    sheet.setColumnWidth(3, 140);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(5, 110);
  }

  // Build set of existing URLs to prevent duplicates
  const existing = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const urls = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    urls.forEach(u => existing.add(u));
  }

  rows.forEach(row => {
    if (existing.has(row.form_url)) return; // skip duplicate
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, 4).setValues([[
      row.company, row.form_url, row.vertical, row.date_added
    ]]);
    // Native checkbox in column 5
    sheet.getRange(newRow, 5).insertCheckboxes();
    if (row.submitted) sheet.getRange(newRow, 5).setValue(true);
    existing.add(row.form_url);
  });
}

// ─── Tab 2: Email Outreach ────────────────────────────────────────────────────
function syncOutreach(ss, rows) {
  let sheet = ss.getSheetByName('Email Outreach');
  if (!sheet) {
    sheet = ss.insertSheet('Email Outreach');
    const headers = ['Company', 'Contact Email', 'Vertical', 'Date Added', 'Initial Outreach ✓', 'FU1 ✓', 'FU2 ✓'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1a1a1e')
      .setFontColor('#c9a056');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 240);
    sheet.setColumnWidth(3, 140);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(5, 160);
    sheet.setColumnWidth(6, 80);
    sheet.setColumnWidth(7, 80);
  }

  const existing = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    emails.forEach(e => existing.add(e));
  }

  rows.forEach(row => {
    if (existing.has(row.email)) return;
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, 4).setValues([[
      row.company, row.email, row.vertical, row.date_added
    ]]);
    // Checkboxes for Initial, FU1, FU2
    sheet.getRange(newRow, 5).insertCheckboxes();
    sheet.getRange(newRow, 6).insertCheckboxes();
    sheet.getRange(newRow, 7).insertCheckboxes();
    // Pre-check Initial if already sent
    if (row.initial_sent) sheet.getRange(newRow, 5).setValue(true);
    if (row.fu1_sent)     sheet.getRange(newRow, 6).setValue(true);
    if (row.fu2_sent)     sheet.getRange(newRow, 7).setValue(true);
    existing.add(row.email);
  });
}

// ─── Update outreach checkboxes (called when status changes) ─────────────────
function updateOutreachStatus(ss, email, field, value) {
  const sheet = ss.getSheetByName('Email Outreach');
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
  const idx = emails.indexOf(email);
  if (idx === -1) return;
  const row = idx + 2;
  const colMap = { initial_sent: 5, fu1_sent: 6, fu2_sent: 7 };
  if (colMap[field]) sheet.getRange(row, colMap[field]).setValue(value);
}

// ─── Update form submitted checkbox ──────────────────────────────────────────
function updateFormStatus(ss, form_url, submitted) {
  const sheet = ss.getSheetByName('Application Forms');
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const urls = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
  const idx = urls.indexOf(form_url);
  if (idx === -1) return;
  sheet.getRange(idx + 2, 5).setValue(submitted);
}

// doGet for health check
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'UGC OS Sheets Sync' }))
    .setMimeType(ContentService.MimeType.JSON);
}
