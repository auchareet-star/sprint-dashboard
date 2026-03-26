/**
 * Shared table constants for AssigneeView and BugListView.
 */

export const STATUS_ORDER = ['In Progress', 'To Do', 'Test Failed', 'Waiting for Test', 'Waiting for test', 'Wait for Deploy', 'Done', 'Cancel'];
export const PRIORITY_ORDER = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

export const STATUS_BADGE = {
  'To Do': { bg: '#F1F5F9', color: '#64748B' },
  'In Progress': { bg: '#ECFDF5', color: '#059669' },
  'Waiting for Test': { bg: '#FFF7ED', color: '#D97706' },
  'Waiting for test': { bg: '#FFF7ED', color: '#D97706' },
  'Test Failed': { bg: '#FEF2F2', color: '#F43F5E' },
  'Wait for Deploy': { bg: '#EEF2FF', color: '#6366F1' },
  Done: { bg: '#ECFDF5', color: '#0D9488' },
  Cancel: { bg: '#FEF2F2', color: '#F43F5E' },
};

export const PRIORITY_BADGE = {
  Highest: { bg: '#FEF2F2', color: '#991B1B' },
  High: { bg: '#FEF2F2', color: '#F43F5E' },
  Medium: { bg: '#FFF7ED', color: '#D97706' },
  Low: { bg: '#EEF2FF', color: '#6366F1' },
  Lowest: { bg: '#F1F5F9', color: '#94A3B8' },
};

export const TYPE_BADGE = {
  Story: { bg: '#EEF2FF', color: '#1E3A5F' },
  Task: { bg: '#FFF7ED', color: '#D97706' },
  Bug: { bg: '#FEF2F2', color: '#F43F5E' },
};

export const TH = {
  fontWeight: 700, fontSize: 15, color: '#0F172A',
  padding: '10px 12px 8px', borderBottom: '2px solid #E2E8F0',
  position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1,
  letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
};

export const TD = { padding: '7px 12px', borderBottom: '1px solid #F1F5F9' };

export function Badge({ value, colorMap }) {
  const style = colorMap[value] || { bg: '#F1F5F9', color: '#64748B' };
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: 15, fontWeight: 600, padding: '2px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>
      {value || '—'}
    </span>
  );
}

export function sortItems(items) {
  return [...items].sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(a.status);
    const sb = STATUS_ORDER.indexOf(b.status);
    if ((sa >= 0 ? sa : 99) !== (sb >= 0 ? sb : 99)) return (sa >= 0 ? sa : 99) - (sb >= 0 ? sb : 99);
    const pa = PRIORITY_ORDER.indexOf(a.priority);
    const pb = PRIORITY_ORDER.indexOf(b.priority);
    return (pa >= 0 ? pa : 99) - (pb >= 0 ? pb : 99);
  });
}
