import { useMemo } from 'react';
import SlideLayout from '../components/SlideLayout';

const STATUS_ORDER = ['In Progress', 'To Do', 'Test Failed', 'Waiting for Test', 'Waiting for test', 'Wait for Deploy', 'Done', 'Cancel'];
const PRIORITY_ORDER = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

const STATUS_BADGE = {
  'To Do': { bg: '#F1F5F9', color: '#64748B' },
  'In Progress': { bg: '#ECFDF5', color: '#059669' },
  'Waiting for Test': { bg: '#FFF7ED', color: '#D97706' },
  'Waiting for test': { bg: '#FFF7ED', color: '#D97706' },
  'Test Failed': { bg: '#FEF2F2', color: '#F43F5E' },
  'Wait for Deploy': { bg: '#EEF2FF', color: '#6366F1' },
  Done: { bg: '#ECFDF5', color: '#0D9488' },
  Cancel: { bg: '#FEF2F2', color: '#F43F5E' },
};

const PRIORITY_BADGE = {
  Highest: { bg: '#FEF2F2', color: '#991B1B' },
  High: { bg: '#FEF2F2', color: '#F43F5E' },
  Medium: { bg: '#FFF7ED', color: '#D97706' },
  Low: { bg: '#EEF2FF', color: '#6366F1' },
  Lowest: { bg: '#F1F5F9', color: '#94A3B8' },
};

const TYPE_BADGE = {
  Story: { bg: '#EEF2FF', color: '#1E3A5F' },
  Task: { bg: '#FFF7ED', color: '#D97706' },
  Bug: { bg: '#FEF2F2', color: '#F43F5E' },
};

function sortItems(items) {
  return [...items].sort((a, b) => {
    // Sort by Issue Type: Bug first, then Story, then Task
    const typeOrder = { Story: 0, Task: 1, Bug: 2 };
    const ta = typeOrder[a.issueType] ?? 99;
    const tb = typeOrder[b.issueType] ?? 99;
    if (ta !== tb) return ta - tb;
    const sa = STATUS_ORDER.indexOf(a.status);
    const sb = STATUS_ORDER.indexOf(b.status);
    if ((sa >= 0 ? sa : 99) !== (sb >= 0 ? sb : 99)) return (sa >= 0 ? sa : 99) - (sb >= 0 ? sb : 99);
    const pa = PRIORITY_ORDER.indexOf(a.priority);
    const pb = PRIORITY_ORDER.indexOf(b.priority);
    return (pa >= 0 ? pa : 99) - (pb >= 0 ? pb : 99);
  });
}

function Badge({ value, colorMap }) {
  const style = colorMap[value] || { bg: '#F1F5F9', color: '#64748B' };
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: 15, fontWeight: 600, padding: '2px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>
      {value || '—'}
    </span>
  );
}

const TH = {
  fontWeight: 700, fontSize: 15, color: '#0F172A',
  padding: '10px 12px 8px', borderBottom: '2px solid #E2E8F0',
  position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1,
  letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
};
const TD = { padding: '7px 12px', borderBottom: '1px solid #F1F5F9' };

export default function AssigneeView({ cards, bugs = [], assigneeName, slideRef }) {
  // Merge cards + bugs into one list with issueType
  const allItems = useMemo(() => {
    const cardItems = cards
      .filter((c) => c.assignee === assigneeName)
      .map((c) => ({
        key: c.card_id,
        parent: c.parent,
        summary: c.summary,
        issueType: c.type === 'Planned' ? 'Story' : 'Task',
        priority: c.priority,
        status: c.status,
        estimate: c.estimate,
        actual: c.actual,
      }));

    const bugItems = bugs
      .filter((b) => b.assignee === assigneeName)
      .map((b) => ({
        key: b.bug_id,
        parent: b.parent,
        summary: b.summary,
        issueType: 'Bug',
        priority: b.priority,
        status: b.status,
        estimate: 0,
        actual: 0,
      }));

    return sortItems([...cardItems, ...bugItems]);
  }, [cards, bugs, assigneeName]);

  const cardCount = allItems.filter((i) => i.issueType !== 'Bug').length;
  const bugCount = allItems.filter((i) => i.issueType === 'Bug').length;

  const statusCounts = useMemo(() => {
    const counts = {};
    allItems.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [allItems]);

  return (
    <SlideLayout
      title={`Card in Sprint : ${assigneeName} (${cardCount} Cards, ${bugCount} Bugs)`}
      subtitle={null}
      slideRef={slideRef}
    >
      <div className="flex flex-col h-full gap-3">
        {/* Status badges */}
        <div className="flex items-center gap-3 flex-none animate-slide-up animate-delay-1" style={{ marginTop: -4 }}>
          <span style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>Status</span>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status} style={{
                fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 5,
                background: (STATUS_BADGE[status] || {}).bg || '#F1F5F9',
                color: (STATUS_BADGE[status] || {}).color || '#64748B',
              }}>
                {status}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card flex-1 min-h-0 animate-slide-up animate-delay-2" style={{ overflow: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr>
                {['#', 'Issue Type', 'Parent', 'Key', 'Summary', 'Priority', 'Status', 'Est', 'Act'].map((h) => (
                  <th key={h} style={{ ...TH, textAlign: h === '#' || h === 'Est' || h === 'Act' ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allItems.length === 0 && (
                <tr><td colSpan={9} style={{ ...TD, padding: 32, textAlign: 'center', color: '#94A3B8' }}>No items.</td></tr>
              )}
              {allItems.map((item, idx) => (
                <tr key={item.key + idx} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = item.issueType === 'Bug' ? '#FEF2F2' : '#F8FAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ ...TD, textAlign: 'center', color: '#CBD5E1', fontWeight: 500 }}>{idx + 1}</td>
                  <td style={TD}><Badge value={item.issueType} colorMap={TYPE_BADGE} /></td>
                  <td style={{ ...TD, color: '#64748B', whiteSpace: 'nowrap' }}>{item.parent || '—'}</td>
                  <td style={{ ...TD, fontWeight: 600, color: item.issueType === 'Bug' ? '#F43F5E' : '#1E3A5F', whiteSpace: 'nowrap' }}>{item.key}</td>
                  <td style={{ ...TD, color: '#334155', maxWidth: 450, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.summary || '—'}</td>
                  <td style={TD}><Badge value={item.priority} colorMap={PRIORITY_BADGE} /></td>
                  <td style={TD}><Badge value={item.status} colorMap={STATUS_BADGE} /></td>
                  <td style={{ ...TD, color: '#1E3A5F', fontWeight: 600, textAlign: 'center' }}>{item.estimate > 0 ? item.estimate.toFixed(2) : '—'}</td>
                  <td style={{ ...TD, color: '#F59E0B', fontWeight: 600, textAlign: 'center' }}>{item.actual > 0 ? item.actual.toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SlideLayout>
  );
}
