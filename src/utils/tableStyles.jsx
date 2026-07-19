/**
 * Shared table constants for AssigneeView and BugListView.
 */

// Table sort order: work needing attention first, closed-out work last.
export const STATUS_ORDER = [
  'BLOCKED',
  'REOPENED',
  'In Progress',
  'To Do',
  'In Review',
  'WAITING FOR DEMO DEPLOY',
  'WAITING FOR TEST',
  'TESTING',
  'USER TEST',
  'WAITING FOR PROD DEPLOY',
  'Done',
  'CANCELLED',
];
export const PRIORITY_ORDER = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

// Badge tints mirror the chart ramp — in-flow statuses deepen as work advances,
// exceptions break out into their reserved status colors. Every pair below clears
// WCAG 4.5:1 body-text contrast against its own tint.
export const STATUS_BADGE = {
  'To Do': { bg: '#F2F7FE', color: '#1c5cab' },
  'In Progress': { bg: '#E7F0FD', color: '#1c5cab' },
  'In Review': { bg: '#DCE9FC', color: '#184f95' },
  'WAITING FOR DEMO DEPLOY': { bg: '#D1E2FB', color: '#184f95' },
  'WAITING FOR TEST': { bg: '#C6DCFA', color: '#143f7a' },
  TESTING: { bg: '#BBD5F8', color: '#143f7a' },
  'USER TEST': { bg: '#B0CEF7', color: '#0d366b' },
  'WAITING FOR PROD DEPLOY': { bg: '#A5C7F6', color: '#0d366b' },
  Done: { bg: '#9AC0F5', color: '#0d366b' },
  REOPENED: { bg: '#FDEDE4', color: '#A9481A' },
  BLOCKED: { bg: '#FBEAEA', color: '#A32B2B' },
  CANCELLED: { bg: '#F2F1EF', color: '#56544F' },
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
