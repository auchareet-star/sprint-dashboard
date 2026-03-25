// Google Sheets integration
// Supports two modes:
//   1. Public sheet (no API key needed) — sheet must be shared with "Anyone with the link"
//   2. API key mode — set VITE_GOOGLE_API_KEY for private sheets
//
// Set VITE_GOOGLE_SHEET_ID in .env (or it defaults to the project sheet).

const SHEET_ID =
  import.meta.env.VITE_GOOGLE_SHEET_ID ||
  '1QugPau4j0C-0UrIczOpzmUSLYsnwViZRMy03ZeiUgfk';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// ---------- helpers ----------

/**
 * Fetch via Google Sheets API v4 (requires API key).
 */
async function fetchSheetApi(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API error "${sheetName}": ${res.statusText}`);
  const data = await res.json();
  return parseRows(data.values);
}

/**
 * Fetch via the public Google Visualization API (JSON, no key needed, sheet must be public).
 * Returns the same row-of-objects format as fetchSheetApi.
 */
async function fetchSheetPublic(sheetName) {
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Public fetch error "${sheetName}": ${res.statusText}`);
  const text = await res.text();
  // Response is JSONP: google.visualization.Query.setResponse({...})
  const jsonStr = text.replace(/^[^(]*\(/, '').replace(/\);?\s*$/, '');
  const json = JSON.parse(jsonStr);
  return parseGvizJson(json);
}

/** Parse a 2-D values array (first row = headers) into objects. */
function parseRows(values) {
  if (!values || values.length < 2) return [];
  const [headers, ...rows] = values;
  return rows.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = row[i]?.trim() ?? '';
    });
    return obj;
  });
}

/** Parse Google Visualization JSON response into row-of-objects. */
function parseGvizJson(json) {
  const table = json.table;
  if (!table || !table.rows || !table.cols) return [];
  const headers = table.cols.map((c) => (c.label || c.id || '').trim());
  return table.rows
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        const cell = row.c?.[i];
        const val = cell?.f ?? cell?.v ?? '';
        obj[h] = typeof val === 'string' ? val.trim() : val;
      });
      return obj;
    })
    .filter((obj) => Object.values(obj).some((v) => v !== '' && v != null));
}

/** Pick the right fetcher based on whether an API key is available. */
function fetchSheet(sheetName) {
  return API_KEY ? fetchSheetApi(sheetName) : fetchSheetPublic(sheetName);
}

// ---------- public API ----------

const ISSUE_TYPE_MAP = {
  Story: 'Planned',
  Task: 'Unplanned',
};

export async function fetchAllCards() {
  const rows = await fetchSheet('Raw : All');
  return rows.map((r) => ({
    card_id: r['Key'] ?? r.card_id ?? '',
    parent: r['parent'] ?? r.parent ?? '',
    summary: r['Summary'] ?? r.summary ?? '',
    type: ISSUE_TYPE_MAP[r['Issue Type']] ?? r.type ?? 'Unplanned',
    status: r['Status'] ?? r.status ?? '',
    priority: r['Priority'] ?? r.priority ?? '',
    assignee: r['Assignee'] ?? r.assignee ?? '',
    estimate: parseFloat(r['Estimate Man-Days'] ?? r.estimate) || 0,
    actual: parseFloat(r['Actual Man-Days'] ?? r.actual) || 0,
  }));
}

export async function fetchBugs() {
  const rows = await fetchSheet('Raw : Bug');
  return rows.map((r) => ({
    bug_id: r['Key'] ?? r.bug_id ?? '',
    parent: r['parent'] ?? r.parent ?? '',
    summary: r['Summary'] ?? r.summary ?? '',
    status: r['Status'] ?? r.status ?? '',
    priority: r['Priority'] ?? r.priority ?? '',
    assignee: r['Assignee'] ?? r.assignee ?? '',
  }));
}

export function isGoogleSheetsConfigured() {
  return Boolean(SHEET_ID);
}
