// Premium color palette — refined, muted, enterprise-grade

// Canonical status vocabulary. These 12 values are the only ones the dashboard
// renders; anything coming off the sheet is folded onto them by normalizeStatus.
export const STATUS_COLORS = {
  'To Do': '#94A3B8',
  'In Progress': '#0D9488',
  'In Review': '#F59E0B',
  'WAITING FOR DEMO DEPLOY': '#0EA5E9',
  'WAITING FOR TEST': '#8B5CF6',
  TESTING: '#EC4899',
  'USER TEST': '#059669',
  'WAITING FOR PROD DEPLOY': '#6366F1',
  REOPENED: '#EA580C',
  BLOCKED: '#DC2626',
  CANCELLED: '#475569',
  Done: '#1E3A5F',
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

// Chart stacking order: finished work at the base, blocked/cancelled on top.
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
