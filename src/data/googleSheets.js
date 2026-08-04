// Google Sheets integration
// Supports two modes:
//   1. Public sheet (no API key needed) — sheet must be shared with "Anyone with the link"
//   2. API key mode — set VITE_GOOGLE_API_KEY for private sheets
//
// Sheet ID resolution order: user override (saved in this browser) > VITE_GOOGLE_SHEET_ID env var > built-in default.

import { normalizeStatus } from '../utils/colors';

const DEFAULT_SHEET_ID =
  import.meta.env.VITE_GOOGLE_SHEET_ID ||
  '1QugPau4j0C-0UrIczOpzmUSLYsnwViZRMy03ZeiUgfk';

const SHEET_ID_STORAGE_KEY = 'agile-dashboard:sheetId';

/** Pull the sheet ID out of a pasted URL, or pass a raw ID through unchanged. */
export function extractSheetId(input) {
  const trimmed = (input || '').trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

export function getSheetId() {
  return localStorage.getItem(SHEET_ID_STORAGE_KEY) || DEFAULT_SHEET_ID;
}

/** Save a user-chosen sheet (ID or full URL) as an override, or clear it if empty. */
export function setSheetId(input) {
  const id = extractSheetId(input);
  if (id) {
    localStorage.setItem(SHEET_ID_STORAGE_KEY, id);
  } else {
    localStorage.removeItem(SHEET_ID_STORAGE_KEY);
  }
}

export function isCustomSheetId() {
  return Boolean(localStorage.getItem(SHEET_ID_STORAGE_KEY));
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// ---------- helpers ----------

/**
 * Fetch via Google Sheets API v4 (requires API key).
 */
async function fetchSheetApi(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${getSheetId()}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
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
    `https://docs.google.com/spreadsheets/d/${getSheetId()}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
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
    status: normalizeStatus(r['Status'] ?? r.status ?? ''),
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
    status: normalizeStatus(r['Status'] ?? r.status ?? ''),
    priority: r['Priority'] ?? r.priority ?? '',
    assignee: r['Assignee'] ?? r.assignee ?? '',
  }));
}

export async function fetchMAIssues() {
  const rows = await fetchSheet('Raw : MA');
  return rows.map((r) => ({
    bug_id: r['Key'] ?? r.bug_id ?? '',
    parent: r['parent'] ?? r.parent ?? '',
    summary: r['Summary'] ?? r.summary ?? '',
    status: normalizeStatus(r['Status'] ?? r.status ?? ''),
    priority: r['Priority'] ?? r.priority ?? '',
    assignee: r['Assignee'] ?? r.assignee ?? '',
    issueType: r['Issue Type'] ?? r['Type'] ?? r.issueType ?? '',
    created: r['Created'] ?? r.created ?? '',
  }));
}

export async function fetchTeamMembers() {
  const rows = await fetchSheet('Team members');
  return rows.map((r) => ({
    name: r['Name'] ?? r.name ?? '',
    role: r['Role'] ?? r.role ?? '',
    estimate: parseFloat(r['Effort (Est)'] ?? r.estimate) || 0,
    actual: parseFloat(r['Effort (Act)'] ?? r.actual) || 0,
    ot: parseFloat(r['Effort (OT)'] ?? r.ot) || 0,
    leave: parseFloat(r.Leave ?? r.leave) || 0,
    remark: r['Remark'] ?? r.remark ?? '',
  })).filter((m) => m.name);
}

/**
 * Parse sprint goals from flat table format.
 * Columns: No, Sprint, Epic, Feature, Task, Status, Remark
 * Dates come from Sprint sheet (sprintList).
 */
/**
 * Parse sprint goals from flat table format.
 * Columns: No, Sprint, Epic, Feature, Task, Status, Remark
 * Dates are resolved later from Sprint sheet via resolveSprintDates().
 */
function parseSprintGoalsSheet(rows) {
  const meta = {};
  const items = [];

  rows.forEach((r) => {
    if (!meta.sprint && r['Sprint']) meta.sprint = r['Sprint'];

    const epic = r['Epic'] ?? '';
    if (epic) {
      items.push({
        epic,
        feature: r['Feature'] ?? '',
        task: r['Task'] ?? '',
        status: r['Status'] ?? '',
        remark: r['Remark'] ?? '',
      });
    }
  });

  return { meta, items };
}

/** Enrich sprint goals meta with dates from Sprint sheet */
export function resolveSprintDates(goals, sprintList) {
  if (!goals?.meta?.sprint || !sprintList?.length) return goals;
  const sp = sprintList.find((s) => s.name === goals.meta.sprint);
  if (sp) {
    return {
      ...goals,
      meta: { ...goals.meta, startDate: sp.startDate, endDate: sp.endDate },
    };
  }
  return goals;
}

export async function fetchSprintGoals() {
  const rows = await fetchSheet('Sprint Goals');
  return parseSprintGoalsSheet(rows);
}

export async function fetchNextSprintGoals() {
  const rows = await fetchSheet('Next Sprint Goals');
  return parseSprintGoalsSheet(rows);
}

export async function fetchOverviewUpdate() {
  const rows = await fetchSheet('Overview Update');
  return rows.map((r) => ({
    module: r['Module'] ?? '',
    task: r['Task'] ?? '',
    startSprint: r['Start Sprint'] ?? '',
    endSprint: r['End Sprint'] ?? '',
    status: r['Status'] ?? '',
    notes: r['Remark'] ?? '',
  })).filter((r) => r.module);
}

export async function fetchSprintList() {
  const rows = await fetchSheet('Sprint');
  return rows.map((r) => ({
    name: r['Sprint'] ?? '',
    startDate: r['Start Date'] ?? '',
    endDate: r['End Date'] ?? '',
    active: r['Active'] ?? '',
  })).filter((r) => r.name);
}

/**
 * Project sheet holds a single row describing the project shown on the cover.
 * Columns: Name
 */
export async function fetchProject() {
  const rows = await fetchSheet('Project');
  const row = rows.find((r) => (r['Name'] ?? r.name ?? '').trim());
  return { name: (row?.['Name'] ?? row?.name ?? '').trim() };
}

export async function fetchIssuesEncountered() {
  const rows = await fetchSheet('Issues Encountered');
  return rows.map((r) => ({
    issue: r['Issues'] ?? '',
    impacts: r['Impacts'] ?? '',
    solutions: r['Solutions'] ?? '',
  })).filter((r) => r.issue);
}

export function isGoogleSheetsConfigured() {
  return Boolean(getSheetId());
}
