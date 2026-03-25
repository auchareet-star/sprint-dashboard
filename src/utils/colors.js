// Premium color palette — refined, muted, enterprise-grade
export const STATUS_COLORS = {
  Done: '#1E3A5F',
  'In Progress': '#0D9488',
  'To Do': '#94A3B8',
  'Wait for Deploy': '#6366F1',
  'Waiting for Test': '#8B5CF6',
  'Waiting for test': '#8B5CF6',
  'Test Failed': '#F59E0B',
  Cancel: '#F43F5E',
};

export const TYPE_COLORS = {
  Planned: '#1E3A5F',
  Unplanned: '#F59E0B',
};

export const EFFORT_COLORS = {
  Estimate: '#1E3A5F',
  Actual: '#F59E0B',
};

export const STATUS_ORDER = [
  'Done',
  'In Progress',
  'To Do',
  'Wait for Deploy',
  'Waiting for Test',
  'Waiting for test',
  'Test Failed',
  'Cancel',
];

export const getStatusColor = (status) => STATUS_COLORS[status] || '#94A3B8';
