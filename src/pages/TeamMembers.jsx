import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';

const METRIC_STYLES = {
  work: { color: '#1E3A5F', background: '#DBEAFE', border: '#93C5FD' },
  actual: { color: '#B45309', background: '#FEF3C7', border: '#FCD34D' },
  ot: { color: '#7C3AED', background: '#EDE9FE', border: '#C4B5FD' },
  leave: { color: '#0F766E', background: '#CCFBF1', border: '#5EEAD4' },
  members: { color: '#475569', background: '#E2E8F0', border: '#CBD5E1' },
};

const ROLE_COLORS = {
  'Project Manager': '#1E3A5F',
  'Project-Co': '#6366F1',
  'Product Owner': '#D97706',
  'SS Programmer': '#0D9488',
  Programmer: '#059669',
  Designer: '#8B5CF6',
  Tester: '#F59E0B',
  'Application Support': '#64748B',
  'Software Implementer': '#1E3A5F',
};

function getInitials(name) {
  const parts = name.replace(/\(.*\)/, '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function TeamMembers({ data, slideRef }) {
  const team = data.team || [];
  const totalEst = team.reduce((s, m) => s + m.estimate, 0);
  const totalAct = team.reduce((s, m) => s + m.actual, 0);
  const totalOt = team.reduce((s, m) => s + (m.ot || 0), 0);
  const totalLeave = team.reduce((s, m) => s + (m.leave || 0), 0);

  const subtitle = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', maxWidth: 1320 }}>
      <MetricBadge label="Members" value={`${team.length}`} tone="members" compact />
      <MetricBadge label="Work" value={`${totalEst} MD`} tone="work" compact />
      <MetricBadge label="Actual" value={`${totalAct.toFixed(2)} MD`} tone="actual" compact />
      <MetricBadge label="OT" value={`${totalOt.toFixed(2)} MD`} tone="ot" compact />
      <MetricBadge label="Leave" value={`${totalLeave.toFixed(2)} MD`} tone="leave" compact />
    </div>
  );

  return (
    <SlideLayout title="Team Members" subtitle={subtitle} slideRef={slideRef}>
      <div className="flex flex-wrap gap-4 h-full content-start overflow-auto animate-slide-up animate-delay-1" style={{ paddingBottom: 8 }}>
        {team.map((m) => (
          <MemberCard key={m.name} member={m} />
        ))}
      </div>
    </SlideLayout>
  );
}

function MemberCard({ member }) {
  const { name, role, estimate, actual, ot = 0, leave = 0 } = member;
  const initials = getInitials(name);
  const roleColor = ROLE_COLORS[role] || '#64748B';

  return (
    <div
      className="card flex gap-4"
      style={{
        padding: '14px 18px',
        width: 'calc(33.333% - 11px)',
        minWidth: 320,
        transition: 'box-shadow 0.2s ease',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${roleColor}22, ${roleColor}44)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: T.section, fontWeight: 700, color: roleColor }}>{initials}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: T.bodyLg,
            fontWeight: 700,
            color: '#0F172A',
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          Name: {name}
        </div>
        <div style={{ fontSize: T.body, color: '#64748B', fontWeight: 500, marginTop: 2 }}>
          Role: {role}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 8,
            marginTop: 10,
          }}
        >
          <MetricBadge label="Work" value={estimate > 0 ? `${estimate} MD` : '(Consult)'} tone="work" />
          <MetricBadge label="Actual" value={`${actual} MD`} tone="actual" />
          <MetricBadge label="OT" value={`${ot} MD`} tone="ot" />
          <MetricBadge label="Leave" value={`${leave} MD`} tone="leave" />
        </div>
      </div>
    </div>
  );
}

function MetricBadge({ label, value, tone, compact = false }) {
  const style = METRIC_STYLES[tone] || METRIC_STYLES.work;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: compact ? 8 : 10,
        width: compact ? 'auto' : '100%',
        padding: compact ? '7px 12px' : '4px 10px',
        borderRadius: 999,
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        boxShadow: compact ? '0 4px 10px rgba(15, 23, 42, 0.06)' : 'none',
        fontSize: compact ? T.body : T.bodySm,
        fontWeight: 700,
        lineHeight: 1.2,
      }}
    >
      <span style={{ opacity: 0.78, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}
