import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';

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

  return (
    <SlideLayout title="Team Members" subtitle={`${team.length} members · Total Work: ${totalEst} MD (Actual ${totalAct.toFixed(2)} MD)`} slideRef={slideRef}>
      <div className="flex flex-wrap gap-4 h-full content-start overflow-auto animate-slide-up animate-delay-1" style={{ paddingBottom: 8 }}>
        {team.map((m) => (
          <MemberCard key={m.name} member={m} />
        ))}
      </div>
    </SlideLayout>
  );
}

function MemberCard({ member }) {
  const { name, role, estimate, actual } = member;
  const initials = getInitials(name);
  const roleColor = ROLE_COLORS[role] || '#64748B';
  const estLabel = estimate > 0 ? `${estimate} MD` : '(Consult)';
  const actLabel = actual > 0 ? `Actual ${actual} MD` : 'Actual 0 MD';

  return (
    <div
      className="card flex items-center gap-4"
      style={{
        padding: '14px 18px',
        width: 'calc(33.333% - 11px)',
        minWidth: 320,
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Avatar */}
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

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: T.bodyLg, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Name: {name}
        </div>
        <div style={{ fontSize: T.body, color: '#64748B', fontWeight: 500, marginTop: 2 }}>
          Role: {role}
        </div>
        <div style={{ fontSize: T.body, color: '#334155', fontWeight: 600, marginTop: 3 }}>
          Effort: {estLabel} ({actLabel})
        </div>
      </div>
    </div>
  );
}
