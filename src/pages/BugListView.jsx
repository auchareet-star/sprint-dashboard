import { useMemo } from 'react';
import SlideLayout from '../components/SlideLayout';
import { STATUS_BADGE, PRIORITY_BADGE, Badge, TH, TD, sortItems } from '../utils/tableStyles';

export default function BugListView({ bugs, slideRef }) {
  const sorted = useMemo(() => sortItems(bugs), [bugs]);

  const statusCounts = useMemo(() => {
    const counts = {};
    bugs.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return counts;
  }, [bugs]);

  return (
    <SlideLayout
      title={`Card in Sprint : *Bug (${bugs.length} Issues)`}
      subtitle={null}
      slideRef={slideRef}
    >
      <div className="flex flex-col h-full gap-3">
        {/* Status badges */}
        <div className="flex items-center gap-3 flex-none animate-slide-up animate-delay-1" style={{ marginTop: -4 }}>
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
                {['#', 'Key', 'Parent', 'Summary', 'Assignee', 'Priority', 'Status'].map((h) => (
                  <th key={h} style={{ ...TH, textAlign: h === '#' ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={7} style={{ ...TD, padding: 32, textAlign: 'center', color: '#94A3B8' }}>No bugs.</td></tr>
              )}
              {sorted.map((bug, idx) => (
                <tr key={bug.bug_id + idx} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ ...TD, textAlign: 'center', color: '#CBD5E1', fontWeight: 500 }}>{idx + 1}</td>
                  <td style={{ ...TD, fontWeight: 600, color: '#F43F5E', whiteSpace: 'nowrap' }}>{bug.bug_id}</td>
                  <td style={{ ...TD, color: '#64748B', whiteSpace: 'nowrap' }}>{bug.parent || '—'}</td>
                  <td style={{ ...TD, color: '#334155', maxWidth: 450, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bug.summary || '—'}</td>
                  <td style={{ ...TD, color: '#1E3A5F', fontWeight: 500, whiteSpace: 'nowrap' }}>{bug.assignee || '—'}</td>
                  <td style={TD}><Badge value={bug.priority} colorMap={PRIORITY_BADGE} /></td>
                  <td style={TD}><Badge value={bug.status} colorMap={STATUS_BADGE} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SlideLayout>
  );
}
