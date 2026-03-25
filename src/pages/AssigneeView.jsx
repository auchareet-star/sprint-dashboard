import { useState, useMemo, useRef } from 'react';
import { CopyImageButton } from '../components/SlideLayout';

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

const LOGO_URL = import.meta.env.BASE_URL + 'ayodia-logo.png';

function sortCards(cards) {
  return [...cards].sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(a.status);
    const sb = STATUS_ORDER.indexOf(b.status);
    const statusA = sa >= 0 ? sa : 99;
    const statusB = sb >= 0 ? sb : 99;
    if (statusA !== statusB) return statusA - statusB;
    const pa = PRIORITY_ORDER.indexOf(a.priority);
    const pb = PRIORITY_ORDER.indexOf(b.priority);
    return (pa >= 0 ? pa : 99) - (pb >= 0 ? pb : 99);
  });
}

function Badge({ value, colorMap }) {
  const style = colorMap[value] || { bg: '#F1F5F9', color: '#64748B' };
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}
    >
      {value || '—'}
    </span>
  );
}

export default function AssigneeView({ cards, assigneeName, onBack }) {
  const [search, setSearch] = useState('');
  const pageRef = useRef(null);

  const filtered = useMemo(() => {
    const assigneeCards = cards.filter((c) => c.assignee === assigneeName);
    const sorted = sortCards(assigneeCards);
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (c) =>
        (c.card_id || '').toLowerCase().includes(q) ||
        (c.summary || '').toLowerCase().includes(q) ||
        (c.parent || '').toLowerCase().includes(q)
    );
  }, [cards, assigneeName, search]);

  const statusCounts = useMemo(() => {
    const counts = {};
    cards.filter((c) => c.assignee === assigneeName).forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [cards, assigneeName]);

  const totalCards = cards.filter((c) => c.assignee === assigneeName).length;

  return (
    <div ref={pageRef} style={{ width: '100%', height: '100%', background: '#F8FAFC', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header — branded like slide layout */}
      <div style={{ display: 'flex', flexShrink: 0 }}>
        {/* Left black bar */}
        <div style={{ width: 8, background: '#0F172A', flexShrink: 0 }} />

        <div style={{ flex: 1, padding: '20px 32px 14px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}>
                <button
                  onClick={onBack}
                  className="cursor-pointer flex items-center justify-center"
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#334155', fontSize: 16,
                  }}
                >
                  &#8249;
                </button>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Card in Sprint : {assigneeName} ({totalCards} Cards)
                </h1>
              </div>
              {/* Yellow-red underline */}
              <div style={{ height: 5, width: 120, background: 'linear-gradient(90deg, #FACC15 20%, #EF4444 20%)', borderRadius: 3, boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)', marginLeft: 44, marginTop: 4 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 44, marginTop: 8 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                  Status breakdown
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <span key={status} style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: (STATUS_BADGE[status] || {}).bg || '#F1F5F9',
                      color: (STATUS_BADGE[status] || {}).color || '#64748B',
                    }}>
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <img src={LOGO_URL} alt="Ayodia" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          </div>

          {/* Search */}
          <div style={{ marginTop: 12, marginLeft: 44, maxWidth: 360 }}>
            <input
              type="text"
              placeholder="Search by Key, Summary, or Parent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 14px', fontSize: 13,
                border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none',
                background: '#F8FAFC', color: '#334155',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#6366F1'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 32px 20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 0 }}>
          <thead>
            <tr>
              {['#', 'Parent', 'Key', 'Summary', 'Priority', 'Status', 'Est', 'Act'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: h === '#' ? 'center' : 'left',
                    fontWeight: 600, fontSize: 11, color: '#94A3B8',
                    padding: '12px 10px 8px', borderBottom: '2px solid #E2E8F0',
                    position: 'sticky', top: 0, background: '#F8FAFC', zIndex: 1,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                  {search ? 'No matching cards found.' : 'No cards for this assignee.'}
                </td>
              </tr>
            )}
            {filtered.map((card, idx) => (
              <tr
                key={card.card_id + idx}
                style={{ transition: 'background 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', textAlign: 'center', color: '#CBD5E1', fontSize: 12, fontWeight: 500 }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {card.parent || '—'}
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', fontWeight: 600, color: '#1E3A5F', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {card.card_id}
                </td>
                <td style={{
                  padding: '8px 10px', borderBottom: '1px solid #F1F5F9', color: '#334155',
                  maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {card.summary || '—'}
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}>
                  <Badge value={card.priority} colorMap={PRIORITY_BADGE} />
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}>
                  <Badge value={card.status} colorMap={STATUS_BADGE} />
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', color: '#1E3A5F', fontWeight: 600, fontSize: 12, textAlign: 'right' }}>
                  {card.estimate > 0 ? card.estimate.toFixed(2) : '—'}
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', color: '#F59E0B', fontWeight: 600, fontSize: 12, textAlign: 'right' }}>
                  {card.actual > 0 ? card.actual.toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Copy Image — bottom right */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 50 }}>
        <CopyImageButton slideRef={pageRef} />
      </div>
    </div>
  );
}
