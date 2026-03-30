import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';

const COL_COLORS = {
  issue:    { accent: '#F43F5E', bg: '#FEF2F2', border: '#FECACA', icon: '#F43F5E' },
  impact:   { accent: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: '#D97706' },
  solution: { accent: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', icon: '#0D9488' },
};

/** Split multiline text (with \n and - bullets) into lines */
function parseLines(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

export default function IssuesEncountered({ data, slideRef }) {
  const issues = data.issues || [];

  return (
    <SlideLayout title="Issues Encountered" slideRef={slideRef}>
      <div className="flex flex-col h-full animate-slide-up animate-delay-1" style={{ paddingTop: 4 }}>
        {/* Table header */}
        <div
          className="flex gap-4 animate-slide-up animate-delay-1"
          style={{ marginBottom: 10, flexShrink: 0 }}
        >
          <HeaderCell label="Issues" color={COL_COLORS.issue} icon={<IssueIcon />} />
          <HeaderCell label="Impacts" color={COL_COLORS.impact} icon={<ImpactIcon />} />
          <HeaderCell label="Solutions" color={COL_COLORS.solution} icon={<SolutionIcon />} />
        </div>

        {/* Rows */}
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          {issues.map((row, i) => (
            <div
              key={i}
              className="flex gap-4 animate-slide-up"
              style={{ flex: 1, minHeight: 0, animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <Cell lines={parseLines(row.issue)} color={COL_COLORS.issue} />
              <Cell lines={parseLines(row.impacts)} color={COL_COLORS.impact} />
              <Cell lines={parseLines(row.solutions)} color={COL_COLORS.solution} />
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}

function HeaderCell({ label, color, icon }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: 10,
        borderLeft: `4px solid ${color.accent}`,
      }}
    >
      {icon}
      <span style={{ fontSize: T.body, fontWeight: 700, color: color.icon }}>
        {label}
      </span>
    </div>
  );
}

function Cell({ lines, color }) {
  return (
    <div
      style={{
        flex: 1,
        background: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        borderLeft: `4px solid ${color.accent}20`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '12px 16px',
        overflow: 'hidden',
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className="flex items-start gap-2"
          style={{ marginBottom: i < lines.length - 1 ? 6 : 0 }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: color.accent,
              opacity: 0.45,
              flexShrink: 0,
              marginTop: 7,
            }}
          />
          <span style={{ fontSize: T.label, fontWeight: 500, color: '#334155', lineHeight: '20px' }}>
            {line}
          </span>
        </div>
      ))}
    </div>
  );
}

function IssueIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ImpactIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SolutionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
