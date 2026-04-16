import { useMemo, useState } from 'react';
import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';

const STATUS_STYLE = {
  Done:          { bg: '#3B82F6', color: '#FFFFFF' },
  Completed:     { bg: '#3B82F6', color: '#FFFFFF' },
  Testing:       { bg: '#22C55E', color: '#FFFFFF' },
  'In-Progress': { bg: '#0D9488', color: '#FFFFFF' },
  'Not Start':   { bg: '#9CA3AF', color: '#FFFFFF' },
  Planned:       { bg: '#9CA3AF', color: '#FFFFFF' },
  Pending:       { bg: '#F59E0B', color: '#FFFFFF' },
  Delay:         { bg: '#EF4444', color: '#FFFFFF' },
};

const LEGEND = [
  { label: 'Completed', bg: '#3B82F6' },
  { label: 'Testing', bg: '#22C55E' },
  { label: 'In-progress', bg: '#0D9488' },
  { label: 'Potential Delay', bg: '#F59E0B' },
  { label: 'Delay', bg: '#EF4444' },
  { label: 'Not Start', bg: '#9CA3AF' },
];

function getStyle(status) {
  return STATUS_STYLE[status] || { bg: '#9CA3AF', color: '#FFFFFF' };
}

function sprintNum(name) {
  return parseInt(name.replace(/\D/g, '')) || 0;
}

function shortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(parseInt(parts[0])).padStart(2, '0')} ${months[parseInt(parts[1]) - 1] || ''}`;
  }
  return dateStr;
}

function buildSprints(rows, sprintList) {
  const usedSprints = new Set();
  rows.forEach((r) => {
    const s = sprintNum(r.startSprint);
    const e = sprintNum(r.endSprint || r.startSprint);
    for (let i = s; i <= e; i++) usedSprints.add(i);
  });

  const sprints = sprintList
    .filter((s) => usedSprints.has(sprintNum(s.name)))
    .sort((a, b) => sprintNum(a.name) - sprintNum(b.name));

  if (sprints.length === 0) return { sprints: [], sprintIndex: {}, currentSprint: '' };

  const sprintIndex = {};
  sprints.forEach((s, i) => { sprintIndex[s.name] = i; });

  const currentSprints = new Set(
    sprintList.filter((s) => s.active === 'Now').map((s) => s.name)
  );

  return { sprints, sprintIndex, currentSprints };
}

function buildLanes(tasks, sprintIndex) {
  const items = tasks
    .map((t) => {
      const si = sprintIndex[t.startSprint];
      const ei = sprintIndex[t.endSprint || t.startSprint];
      if (si == null) return null;
      return { ...t, startIdx: si, endIdx: ei != null ? ei : si };
    })
    .filter(Boolean)
    .sort((a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx);

  const lanes = [];
  items.forEach((item) => {
    let placed = false;
    for (const lane of lanes) {
      const lastEnd = lane[lane.length - 1].endIdx;
      if (item.startIdx > lastEnd) {
        lane.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) lanes.push([item]);
  });

  return lanes;
}

function laneToCells(lane, sprintCount) {
  const cells = [];
  let pos = 0;

  lane.forEach((item) => {
    if (item.startIdx > pos) {
      cells.push({ type: 'empty', colSpan: item.startIdx - pos });
    }
    const span = item.endIdx - item.startIdx + 1;
    cells.push({ type: 'task', colSpan: span, ...item });
    pos = item.endIdx + 1;
  });

  if (pos < sprintCount) {
    cells.push({ type: 'empty', colSpan: sprintCount - pos });
  }

  return cells;
}

function getCellSprintIdx(cells, cellIdx, subIdx) {
  let pos = 0;
  for (let i = 0; i < cellIdx; i++) {
    pos += cells[i].colSpan;
  }
  return pos + subIdx;
}

/** Max table body rows per page */
const MAX_ROWS = 28;

/**
 * Split modules into pages so each page has ≤ MAX_ROWS lanes total.
 */
function paginateModules(moduleOrder, moduleLanes) {
  const pages = [];
  let currentPage = [];
  let currentRows = 0;

  moduleOrder.forEach((mod) => {
    const laneCount = Math.max(moduleLanes[mod]?.length || 0, 1);
    if (currentRows + laneCount > MAX_ROWS && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentRows = 0;
    }
    currentPage.push(mod);
    currentRows += laneCount;
  });

  if (currentPage.length > 0) pages.push(currentPage);
  return pages.length > 0 ? pages : [[]];
}

export default function OverviewUpdate({ data, slideRef }) {
  const rows = data.overviewUpdate || [];
  const sprintListRaw = data.sprintList || [];
  const [page, setPage] = useState(0);

  const { sprints, sprintIndex, currentSprints } = useMemo(
    () => buildSprints(rows, sprintListRaw),
    [rows, sprintListRaw],
  );

  // Group by module; separate task rows from remark-only rows
  const { moduleOrder, moduleMap, moduleRemarks } = useMemo(() => {
    const order = [];
    const map = {};
    const remarks = {};
    rows.forEach((r) => {
      if (!map[r.module]) { map[r.module] = []; order.push(r.module); remarks[r.module] = []; }
      if (r.startSprint) {
        map[r.module].push(r);
      } else if (r.notes) {
        // Remark-only row (no task/sprint, only module + remark)
        remarks[r.module].push(r.notes);
      }
    });
    return { moduleOrder: order, moduleMap: map, moduleRemarks: remarks };
  }, [rows]);

  const moduleLanes = useMemo(() => {
    const result = {};
    moduleOrder.forEach((mod) => {
      result[mod] = buildLanes(moduleMap[mod], sprintIndex);
    });
    return result;
  }, [moduleOrder, moduleMap, sprintIndex]);

  const pages = useMemo(
    () => paginateModules(moduleOrder, moduleLanes),
    [moduleOrder, moduleLanes],
  );

  const totalPages = pages.length;
  const currentPageModules = pages[Math.min(page, totalPages - 1)] || [];

  if (sprints.length === 0) {
    return (
      <SlideLayout title="Overview Update" slideRef={slideRef}>
        <div className="flex items-center justify-center h-full">
          <span style={{ fontSize: T.body, color: '#94A3B8' }}>No data available</span>
        </div>
      </SlideLayout>
    );
  }

  const pageTitle = totalPages > 1
    ? `Overview Update — ${page + 1}/${totalPages}`
    : 'Overview Update ';

  let globalRowIdx = 0;

  return (
    <SlideLayout title={pageTitle} slideRef={slideRef}>
      <div className="flex flex-col h-full animate-slide-up animate-delay-1" style={{ paddingTop: 2 }}>
        {/* Legend + Page nav */}
        <div className="flex items-center mb-3 flex-none">
          {/* Page nav (left) */}
          {totalPages > 1 && (
            <div className="export-hide flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="cursor-pointer flex items-center justify-center"
                style={{
                  width: 26, height: 26, borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  background: page === 0 ? '#F8FAFC' : '#FFFFFF',
                  color: page === 0 ? '#CBD5E1' : '#334155',
                  fontSize: 14,
                }}
              >
                &#8249;
              </button>
              <span style={{ fontSize: T.caption, fontWeight: 600, color: '#94A3B8' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="cursor-pointer flex items-center justify-center"
                style={{
                  width: 26, height: 26, borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  background: page === totalPages - 1 ? '#F8FAFC' : '#FFFFFF',
                  color: page === totalPages - 1 ? '#CBD5E1' : '#334155',
                  fontSize: 14,
                }}
              >
                &#8250;
              </button>
            </div>
          )}
          {/* Legend (right) */}
          <div className="flex items-center gap-4 ml-auto">
            {LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.bg }} />
                <span style={{ fontSize: T.caption, fontWeight: 600, color: '#64748B' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0" style={{ overflow: 'hidden', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', height: '100%' }}>
            <colgroup>
              <col style={{ width: 130 }} />
              {sprints.map((sp) => <col key={sp.name} />)}
            </colgroup>

            <thead>
              <tr>
                <th style={thModuleStyle}>
                  Modules /<br />Features
                </th>
                {sprints.map((sp) => {
                  const isCurrent = currentSprints.has(sp.name);
                  const isNext = sp.active === 'Next';
                  return (
                    <th
                      key={sp.name}
                      style={{
                        ...thSprintStyle,
                        background: isCurrent ? '#D97706' : isNext ? '#94A3B8' : '#1E3A5F',
                      }}
                    >
                      <div>{sp.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>
                        {shortDate(sp.startDate)} - {shortDate(sp.endDate)}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {currentPageModules.map((mod) => {
                const lanes = moduleLanes[mod] || [];
                const remarks = moduleRemarks[mod] || [];
                const isRemarkOnly = lanes.length === 0 && remarks.length > 0;
                const laneCount = Math.max(lanes.length, 1);
                const modRowIdx = globalRowIdx;
                globalRowIdx += laneCount;
                const isEven = modRowIdx % 2 === 0;

                // Remark-only module: show remark spanning all sprint columns
                if (isRemarkOnly) {
                  return (
                    <tr key={mod}>
                      <td style={{ ...tdModuleStyle, background: isEven ? '#FFFFFF' : '#F8FAFC' }}>
                        {mod}
                      </td>
                      <td
                        colSpan={sprints.length}
                        style={{
                          ...tdCellStyle,
                          padding: '4px 12px',
                          background: isEven ? '#FFFFFF' : '#F8FAFC',
                          verticalAlign: 'middle',
                        }}
                      >
                        <span style={{ fontSize: T.micro, fontWeight: 500, color: '#F59E0B', fontStyle: 'italic' }}>
                          {remarks.join(' / ')}
                        </span>
                      </td>
                    </tr>
                  );
                }

                // Empty module (no tasks, no remarks)
                if (lanes.length === 0) {
                  return (
                    <tr key={mod}>
                      <td style={{ ...tdModuleStyle, background: isEven ? '#FFFFFF' : '#F8FAFC' }}>
                        {mod}
                      </td>
                      {sprints.map((sp) => (
                        <td key={sp.name} style={{
                          ...tdCellStyle,
                          background: isEven ? '#FFFFFF' : '#F8FAFC',
                        }} />
                      ))}
                    </tr>
                  );
                }

                return lanes.map((lane, li) => {
                  const cells = laneToCells(lane, sprints.length);
                  return (
                    <tr key={`${mod}-${li}`}>
                      {li === 0 && (
                        <td
                          rowSpan={laneCount}
                          style={{ ...tdModuleStyle, background: isEven ? '#FFFFFF' : '#F8FAFC', verticalAlign: 'middle' }}
                        >
                          {mod}
                        </td>
                      )}
                      {cells.map((cell, ci) => {
                        if (cell.type === 'empty') {
                          return Array.from({ length: cell.colSpan }, (_, j) => {
                            const idx = getCellSprintIdx(cells, ci, j);
                            const spObj = sprints[idx];
                            const isCur = currentSprints.has(spObj?.name);
                            return (
                              <td
                                key={`e-${ci}-${j}`}
                                style={{
                                  ...tdCellStyle,
                                  background: isEven ? '#FFFFFF' : '#F8FAFC',
                                }}
                              />
                            );
                          });
                        }
                        const st = getStyle(cell.status);
                        return (
                          <td
                            key={`t-${ci}`}
                            colSpan={cell.colSpan}
                            style={{
                              ...tdCellStyle,
                              padding: '2px 3px',
                              background: isEven ? '#FFFFFF' : '#F8FAFC',
                              verticalAlign: 'middle',
                            }}
                          >
                            <div
                              style={{
                                background: st.bg,
                                color: st.color,
                                fontSize: T.caption,
                                fontWeight: 600,
                                padding: '3px 6px',
                                borderRadius: 4,
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: '18px',
                              }}
                              title={`${cell.task}${cell.notes ? ` — ${cell.notes}` : ''}`}
                            >
                              {cell.task}
                            </div>
                            {cell.notes && (
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: '#F43F5E',
                                  textAlign: 'center',
                                  marginTop: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  lineHeight: '13px',
                                }}
                              >
                                {cell.notes}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SlideLayout>
  );
}

const thModuleStyle = {
  padding: '8px 10px',
  background: '#1E3A5F',
  color: '#FFFFFF',
  fontSize: T.tableHead,
  fontWeight: 700,
  textAlign: 'left',
  borderRight: '1px solid #2D4A6F',
  borderBottom: '1px solid #2D4A6F',
};

const thSprintStyle = {
  padding: '6px 4px',
  color: '#FFFFFF',
  fontSize: T.micro,
  fontWeight: 700,
  textAlign: 'center',
  borderRight: '1px solid rgba(255,255,255,0.15)',
  borderBottom: '1px solid #2D4A6F',
  lineHeight: '18px',
};

const tdModuleStyle = {
  padding: '6px 10px',
  fontSize: T.tableHead,
  fontWeight: 700,
  color: '#0F172A',
  borderRight: '1px solid #E2E8F0',
  borderBottom: '1px solid #E2E8F0',
};

const tdCellStyle = {
  borderRight: '1px solid #E2E8F0',
  borderBottom: '1px solid #E2E8F0',
};
