// Premium color palette — refined, muted, enterprise-grade

// Canonical status vocabulary. These 12 values are the only ones the dashboard
// renders; anything coming off the sheet is folded onto them by normalizeStatus.
//
// Status is ordered, not nominal: a card walks To Do -> ... -> Done, so the nine
// in-flow states take one blue ramp, light -> dark, and the reader sees progress
// as darkness rather than having to decode nine unrelated hues. The three
// out-of-flow states are exceptions, not stages, so they leave the ramp entirely
// and wear reserved status colors that pop against the blue field.
//
// Nine ramp steps sit closer than the 0.06 lightness gap an ordinal ramp wants
// (five steps is the most that clears it on a white surface). That is a deliberate
// trade for keeping all twelve statuses visible: neighbouring steps are adjacent
// workflow stages, so reading one as its neighbour costs little, and the bar
// labels carry exact identity. The pairs that must never be confused — BLOCKED vs
// REOPENED vs the flow — are the ones held far apart (normal-vision dE 15.7).
export const STATUS_COLORS = {
  // In-flow — blue ramp, light (not started) to dark (shipped)
  'To Do': '#86b6ef',
  'In Progress': '#6da7ec',
  'In Review': '#5598e7',
  'WAITING FOR DEMO DEPLOY': '#3987e5',
  'WAITING FOR TEST': '#2a78d6',
  TESTING: '#256abf',
  'USER TEST': '#1c5cab',
  'WAITING FOR PROD DEPLOY': '#184f95',
  Done: '#0d366b',
  // Out-of-flow — reserved status colors, always shown with their text label
  REOPENED: '#ec835a',
  BLOCKED: '#d03b3b',
  CANCELLED: '#898781',
};

// Legacy / variant spellings kept so older sheets keep rendering. Keys are
// pre-normalized (lowercased, separators collapsed) — see normalizeStatus.
const STATUS_ALIASES = {
  cancel: 'CANCELLED',
  canceled: 'CANCELLED',
  'wait for deploy': 'WAITING FOR DEMO DEPLOY',
  'waiting for deploy': 'WAITING FOR DEMO DEPLOY',
  'test failed': 'REOPENED',
  'waiting for demo': 'WAITING FOR DEMO DEPLOY',
  'user testing': 'USER TEST',
  uat: 'USER TEST',
};

// Canonical lookup by normalized key, so 'WAITING FOR TEST', 'Waiting for Test'
// and 'waiting-for-test' all land on the same bucket.
const CANONICAL_BY_KEY = Object.fromEntries(
  Object.keys(STATUS_COLORS).map((s) => [s.toLowerCase(), s])
);

/**
 * Fold a raw sheet status onto the canonical vocabulary.
 * Case-insensitive and tolerant of hyphen/underscore/extra-space separators.
 * Unknown values pass through trimmed rather than being dropped.
 */
export const normalizeStatus = (raw) => {
  if (!raw) return '';
  const key = String(raw).trim().replace(/[-_\s]+/g, ' ').toLowerCase();
  return CANONICAL_BY_KEY[key] || STATUS_ALIASES[key] || String(raw).trim();
};

export const TYPE_COLORS = {
  Planned: '#1E3A5F',
  Unplanned: '#F59E0B',
};

export const EFFORT_COLORS = {
  Estimate: '#1E3A5F',
  Actual: '#F59E0B',
};

// Chart stacking order. The nine in-flow statuses stay contiguous and run dark to
// light from the baseline up, so a stack reads as a gradient with shipped work at
// the bottom; the three exceptions sit on top where they break the gradient and
// catch the eye. Reordering these would scramble the gradient — keep flow together.
export const STATUS_ORDER = [
  'Done',
  'WAITING FOR PROD DEPLOY',
  'USER TEST',
  'TESTING',
  'WAITING FOR TEST',
  'WAITING FOR DEMO DEPLOY',
  'In Review',
  'In Progress',
  'To Do',
  'REOPENED',
  'BLOCKED',
  'CANCELLED',
];

// Statuses where development work is handed off — counted as completed effort.
export const COMPLETED_STATUSES = [
  'Done',
  'CANCELLED',
  'In Review',
  'WAITING FOR DEMO DEPLOY',
  'WAITING FOR TEST',
  'TESTING',
  'USER TEST',
  'WAITING FOR PROD DEPLOY',
];

// A bug stops counting against the team once it is closed out either way.
export const RESOLVED_STATUSES = ['Done', 'CANCELLED'];

export const getStatusColor = (status) => STATUS_COLORS[normalizeStatus(status)] || '#94A3B8';
