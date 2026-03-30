import { useMemo } from 'react';
import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';

const STATUS_STYLE = {
  Done:          { bg: '#EFF6FF', color: '#1E3A5F', border: '#BFDBFE' },
  'In-Progress': { bg: '#F0FDFA', color: '#0D9488', border: '#99F6E4' },
  'To-Do':       { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
  Confirm:       { bg: '#EEF2FF', color: '#6366F1', border: '#C7D2FE' },
  Pending:       { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  Issue:         { bg: '#FEF2F2', color: '#F43F5E', border: '#FECACA' },
};

const EPIC_ACCENT = [
  '#1E3A5F', '#0D9488', '#6366F1', '#D97706', '#8B5CF6', '#059669', '#F43F5E',
];

function getStatusStyle(status) {
  return STATUS_STYLE[status] || { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' };
}

function buildTree(items) {
  const epics = [];
  const epicMap = {};

  items.forEach((item) => {
    let epic = epicMap[item.epic];
    if (!epic) {
      epic = { name: item.epic, features: [], featureMap: {} };
      epicMap[item.epic] = epic;
      epics.push(epic);
    }
    let feat = epic.featureMap[item.feature];
    if (!feat) {
      feat = { name: item.feature, tasks: [] };
      epic.featureMap[item.feature] = feat;
      epic.features.push(feat);
    }
    feat.tasks.push({ name: item.task, status: item.status });
  });

  return epics;
}

function countEpicLines(epic) {
  let lines = 1;
  epic.features.forEach((feat) => {
    lines += 1;
    lines += feat.tasks.length;
  });
  return lines;
}

const MAX_LINES_SINGLE = 26;

function splitIntoColumns(tree) {
  const totalLines = tree.reduce((sum, e) => sum + countEpicLines(e), 0);

  if (totalLines <= MAX_LINES_SINGLE) {
    return { left: tree, right: [], twoCol: false };
  }

  const half = totalLines / 2;
  let leftLines = 0;
  let splitIdx = 0;

  for (let i = 0; i < tree.length; i++) {
    const lines = countEpicLines(tree[i]);
    if (leftLines + lines > half && leftLines > 0) {
      splitIdx = i;
      break;
    }
    leftLines += lines;
    splitIdx = i + 1;
  }

  return {
    left: tree.slice(0, splitIdx),
    right: tree.slice(splitIdx),
    twoCol: true,
  };
}

export default function SprintGoals({ data, slideRef }) {
  return (
    <SprintGoalsView
      goals={data.sprintGoals}
      title="Sprint Goals"
      slideRef={slideRef}
    />
  );
}

export function SprintGoalsView({ goals: goalsInput, title, slideRef }) {
  const goals = goalsInput || { meta: {}, items: [] };
  const { meta, items } = goals;
  const tree = useMemo(() => buildTree(items), [items]);
  const columns = useMemo(() => splitIntoColumns(tree), [tree]);

  const duration =
    meta.startDate && meta.endDate
      ? `${meta.startDate} - ${meta.endDate}`
      : null;

  const pageTitle = meta.sprint ? `${title} (${meta.sprint})` : title;

  return (
    <SlideLayout title={pageTitle} slideRef={slideRef}>
      <div className="flex flex-col h-full animate-slide-up animate-delay-1" style={{ paddingTop: 2 }}>
        {/* Duration bar */}
        {duration && (
          <div
            className="animate-slide-up animate-delay-1"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #1E3A5F08, #6366F108)',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              marginBottom: 14,
              alignSelf: 'flex-start',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: T.label, fontWeight: 600, color: '#475569' }}>
              {duration}
            </span>
          </div>
        )}

        {/* Tree — single or two columns */}
        {columns.twoCol ? (
          <div className="flex-1 min-h-0 flex gap-5">
            <div style={{ flex: 1 }}>
              <EpicList epics={columns.left} offset={0} />
            </div>
            <div style={{ flex: 1 }}>
              <EpicList epics={columns.right} offset={columns.left.length} />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <EpicList epics={columns.left} offset={0} />
          </div>
        )}
      </div>
    </SlideLayout>
  );
}

function EpicList({ epics, offset = 0 }) {
  return epics.map((epic, ei) => {
    const accent = EPIC_ACCENT[(ei + offset) % EPIC_ACCENT.length];
    return (
      <div
        key={epic.name}
        className="animate-slide-up"
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        {/* Epic header with accent bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderBottom: '1px solid #F1F5F9',
            background: `linear-gradient(135deg, ${accent}08, ${accent}04)`,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: accent,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: T.body, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
            {epic.name}
          </span>
        </div>

        {/* Features */}
        <div style={{ padding: '8px 16px 10px' }}>
          {epic.features.map((feat, fi) => (
            <div key={fi} style={{ marginBottom: fi < epic.features.length - 1 ? 6 : 0 }}>
              {/* Feature name */}
              <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 1.5,
                    background: accent,
                    opacity: 0.5,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: T.label, fontWeight: 600, color: '#334155' }}>
                  {feat.name}
                </span>
              </div>

              {/* Tasks */}
              <div style={{ paddingLeft: 14 }}>
                {feat.tasks.map((task, ti) => {
                  const st = task.status && task.status !== '-' ? getStatusStyle(task.status) : null;
                  return (
                    <div
                      key={ti}
                      className="flex items-center gap-2"
                      style={{ marginBottom: 2 }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: '#CBD5E1',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: T.micro, fontWeight: 500, color: '#64748B', flex: 1 }}>
                        {task.name}
                      </span>
                      {st && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: st.color,
                            background: st.bg,
                            border: `1px solid ${st.border}`,
                            borderRadius: 6,
                            padding: '1px 8px',
                            flexShrink: 0,
                            lineHeight: '18px',
                          }}
                        >
                          {task.status}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  });
}
