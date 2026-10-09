import { useState, useEffect, useMemo } from 'react';
import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';

const COL_COLORS = {
  wentWell: { accent: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', icon: '#0D9488' },
  notWell:  { accent: '#F43F5E', bg: '#FEF2F2', border: '#FECACA', icon: '#F43F5E' },
  improve:  { accent: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: '#D97706' },
  action:   { accent: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', icon: '#2563EB' },
};

const COLUMN_KEYS = ['wentWell', 'notWell', 'improve', 'action'];

// Only used if the sheet's own header row is missing for some reason.
const FALLBACK_LABELS = {
  wentWell: 'What went well',
  notWell: "What didn't go well",
  improve: 'What should we improve',
  action: 'Action Item',
};

/** The sheet's header cell is "Question\nThai prompt" — split it for two-line display. */
function headerLines(raw) {
  const [main = '', sub = ''] = (raw || '').split('\n');
  return { main: main.trim(), sub: sub.trim() };
}

/** Build the column list with labels read straight from the sheet's header row. */
function buildColumns(headers) {
  return COLUMN_KEYS.map((key) => ({
    key,
    ...headerLines((headers && headers[key]) || FALLBACK_LABELS[key]),
    color: COL_COLORS[key],
  }));
}

/** Split multiline text (with \n and - bullets) into lines, same convention as Issues Encountered. */
function parseLines(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

// ---------- per-member table pagination ----------

/** Table is 1824px wide inside the slide padding; the member column takes 140. */
const QUESTION_AREA_PX = 1824 - 140;
const COL_WIDTH_PX = QUESTION_AREA_PX / 4;

/** Roughly how wide a Thai/Latin glyph renders at the 14px cell text size. */
const GLYPH_PX = 7.6;
const LINE_PX = 19;
const BULLET_GAP_PX = 6;
const CELL_PADDING_PX = 16;
const MIN_ROW_PX = 48;

/** Height a single cell needs once its bullets wrap inside one question column. */
function estimateCellHeight(text) {
  const lines = parseLines(text);
  if (!lines.length) return 0;
  const perLine = Math.max(Math.floor((COL_WIDTH_PX - 28) / GLYPH_PX), 10);
  const wrapped = lines.reduce((sum, l) => sum + (Math.ceil(l.length / perLine) || 1), 0);
  return CELL_PADDING_PX + wrapped * LINE_PX + (lines.length - 1) * BULLET_GAP_PX;
}

/** A row is as tall as its tallest cell — one member's long answer shouldn't clip the rest. */
function estimateRowHeight(row) {
  const heights = COLUMN_KEYS.map((key) => estimateCellHeight(row[key]));
  return Math.max(MIN_ROW_PX, ...heights);
}

/** Height of the table body on a 1080px slide, after the page header and table header. */
const BODY_BUDGET_PX = 850;

/** Fill each page up to the height budget instead of a fixed row count. */
function paginateRows(rows) {
  const pages = [];
  let page = [];
  let used = 0;

  rows.forEach((row) => {
    const h = estimateRowHeight(row);
    if (page.length && used + h > BODY_BUDGET_PX) {
      pages.push(page);
      page = [];
      used = 0;
    }
    page.push(row);
    used += h;
  });

  if (page.length) pages.push(page);
  return pages;
}

// ---------- team-summary pagination (one full-width block per question) ----------

const SUMMARY_WIDTH_PX = 1750;
const SUMMARY_GLYPH_PX = 8.2;
const SUMMARY_LINE_PX = 22;
const SUMMARY_LINE_GAP_PX = 4;
const SUMMARY_INDENT_PX = 22;
const SUMMARY_BODY_BUDGET_PX = 780;

/** A numbered heading ("1. ...") reads as a section title; everything else is body text. */
function isSummaryHeading(text) {
  return /^\d+[.)]\s/.test(text);
}

/** Break a summary answer into indent-aware lines (tabs in the sheet mark sub-bullets). */
function summaryLines(text) {
  return (text || '')
    .split('\n')
    .map((l) => {
      const indent = (l.match(/^\t+/) || [''])[0].length;
      return { text: l.replace(/^\t+/, '').trimEnd(), indent };
    })
    .filter((l) => l.text !== '');
}

function estimateSummaryLineHeight(line) {
  const availPx = SUMMARY_WIDTH_PX - line.indent * SUMMARY_INDENT_PX;
  const perLine = Math.max(Math.floor(availPx / SUMMARY_GLYPH_PX), 10);
  const wrapped = Math.ceil(line.text.length / perLine) || 1;
  return wrapped * SUMMARY_LINE_PX + SUMMARY_LINE_GAP_PX;
}

/** Paginate one question's summary text into height-budgeted chunks. */
function paginateSummaryText(text) {
  const lines = summaryLines(text);
  if (!lines.length) return [];

  const pages = [];
  let page = [];
  let used = 0;

  lines.forEach((line) => {
    const h = estimateSummaryLineHeight(line);
    if (page.length && used + h > SUMMARY_BODY_BUDGET_PX) {
      pages.push(page);
      page = [];
      used = 0;
    }
    page.push(line);
    used += h;
  });

  if (page.length) pages.push(page);
  return pages;
}

/** Flatten all four questions into "summary" page descriptors, in column order. */
function buildSummaryPages(summary, columns) {
  if (!summary) return [];
  const out = [];
  columns.forEach((col) => {
    const chunks = paginateSummaryText(summary[col.key]);
    chunks.forEach((lines, i) => {
      out.push({ type: 'summary', col, lines, part: i + 1, parts: chunks.length });
    });
  });
  return out;
}

const EmptyState = ({ slideRef }) => (
  <SlideLayout title="Retrospective" slideRef={slideRef}>
    <div className="flex items-center justify-center h-full">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '40px 60px',
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        <span style={{ fontSize: T.section, fontWeight: 600, color: '#64748B' }}>
          Coming Soon
        </span>
        <span style={{ fontSize: T.label, color: '#94A3B8', fontWeight: 400 }}>
          ยังไม่มีข้อมูล Retrospective สำหรับ Sprint นี้
        </span>
      </div>
    </div>
  </SlideLayout>
);

/** Compute total page count without rendering — used by PresentMode to step through slides. */
export function computeRetrospectivePageCount(data) {
  const rows = data.retrospective?.items || [];
  const summary = data.retrospective?.summary || null;
  const headers = data.retrospective?.headers || null;
  const columns = buildColumns(headers);
  const total = paginateRows(rows).length + buildSummaryPages(summary, columns).length;
  return Math.max(total, 1);
}

export default function Retrospective({ data, slideRef, forcePage }) {
  const rows = data.retrospective?.items || [];
  const summary = data.retrospective?.summary || null;
  const headers = data.retrospective?.headers || null;
  const [page, setPage] = useState(forcePage ?? 0);

  useEffect(() => {
    if (forcePage != null) setPage(forcePage);
  }, [forcePage]);

  const columns = useMemo(() => buildColumns(headers), [headers]);

  const pages = useMemo(() => {
    const tablePages = paginateRows(rows).map((tableRows) => ({ type: 'table', rows: tableRows }));
    return [...tablePages, ...buildSummaryPages(summary, columns)];
  }, [rows, summary, columns]);

  const totalPages = pages.length;

  if (totalPages === 0) {
    return <EmptyState slideRef={slideRef} />;
  }

  const current = pages[Math.min(page, totalPages - 1)];
  const titleBase = current.type === 'summary' ? 'Retrospective Summary' : 'Retrospective';
  const pageTitle = totalPages > 1 ? `${titleBase} — ${page + 1}/${totalPages}` : titleBase;

  return (
    <SlideLayout title={pageTitle} slideRef={slideRef}>
      <div className="flex flex-col h-full animate-slide-up animate-delay-1" style={{ paddingTop: 2 }}>
        {/* Page nav */}
        {totalPages > 1 && (
          <div className="export-hide flex items-center gap-2 mb-2 flex-none">
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

        {current.type === 'table' ? (
          <MemberTable rows={current.rows} columns={columns} />
        ) : (
          <SummaryPanel current={current} />
        )}
      </div>
    </SlideLayout>
  );
}

function MemberTable({ rows, columns }) {
  return (
    <div className="flex-1 min-h-0" style={{ overflow: 'hidden', borderRadius: 10, border: '1px solid #E2E8F0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', height: '100%' }}>
        <colgroup>
          <col style={{ width: 140 }} />
          {columns.map((c) => <col key={c.key} />)}
        </colgroup>

        <thead>
          <tr>
            <th style={thMemberStyle}>Team Member</th>
            {columns.map((c) => (
              <th key={c.key} style={{ ...thQuestionStyle, background: c.color.accent }}>
                <div>{c.main}</div>
                {c.sub && <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>{c.sub}</div>}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, ri) => {
            const isEven = ri % 2 === 0;
            return (
              <tr key={ri}>
                <td style={{ ...tdMemberStyle, background: isEven ? '#FFFFFF' : '#F8FAFC' }}>
                  {row.member}
                </td>
                {columns.map((c) => {
                  const lines = parseLines(row[c.key]);
                  return (
                    <td
                      key={c.key}
                      style={{
                        ...tdCellStyle,
                        background: isEven ? '#FFFFFF' : '#F8FAFC',
                      }}
                    >
                      {lines.length === 0 ? (
                        <span style={{ fontSize: T.micro, color: '#CBD5E1', fontStyle: 'italic' }}>—</span>
                      ) : (
                        lines.map((line, li) => (
                          <div
                            key={li}
                            className="flex items-start gap-1.5"
                            style={{ marginBottom: li < lines.length - 1 ? BULLET_GAP_PX : 0 }}
                          >
                            <div
                              style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: c.color.accent, opacity: 0.5,
                                flexShrink: 0, marginTop: 7,
                              }}
                            />
                            <span style={{ fontSize: T.micro, fontWeight: 500, color: '#334155', lineHeight: `${LINE_PX}px`, wordBreak: 'break-word' }}>
                              {line}
                            </span>
                          </div>
                        ))
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SummaryPanel({ current }) {
  const { col, lines, part, parts } = current;
  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ overflow: 'hidden' }}>
      <div
        style={{
          padding: '10px 18px',
          marginBottom: 12,
          background: col.color.bg,
          border: `1px solid ${col.color.border}`,
          borderRadius: 10,
          borderLeft: `4px solid ${col.color.accent}`,
          flexShrink: 0,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div style={{ fontSize: T.caption, fontWeight: 700, color: col.color.icon, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              สรุปภาพรวมทีม
            </div>
            <div style={{ fontSize: T.section, fontWeight: 700, color: col.color.icon, marginTop: 2 }}>
              {col.main}
            </div>
            {col.sub && (
              <div style={{ fontSize: T.label, fontWeight: 500, color: col.color.icon, opacity: 0.85, marginTop: 2 }}>
                {col.sub}
              </div>
            )}
          </div>
          {parts > 1 && (
            <span style={{ fontSize: T.caption, fontWeight: 600, color: '#94A3B8', flexShrink: 0 }}>
              {part > 1 ? '(ต่อ) ' : ''}{part}/{parts}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex-1 min-h-0"
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '18px 22px',
          overflow: 'hidden',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              marginLeft: line.indent * SUMMARY_INDENT_PX,
              marginBottom: SUMMARY_LINE_GAP_PX,
              fontSize: T.label,
              fontWeight: isSummaryHeading(line.text) ? 700 : 500,
              color: isSummaryHeading(line.text) ? '#0F172A' : '#334155',
              lineHeight: `${SUMMARY_LINE_PX}px`,
              wordBreak: 'break-word',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

const thMemberStyle = {
  padding: '8px 10px',
  background: '#1E3A5F',
  color: '#FFFFFF',
  fontSize: T.tableHead,
  fontWeight: 700,
  textAlign: 'left',
  borderRight: '1px solid #2D4A6F',
  borderBottom: '1px solid #2D4A6F',
};

const thQuestionStyle = {
  padding: '8px 12px',
  color: '#FFFFFF',
  fontSize: T.caption,
  fontWeight: 700,
  textAlign: 'left',
  borderRight: '1px solid rgba(255,255,255,0.15)',
  borderBottom: '1px solid rgba(255,255,255,0.15)',
};

const tdMemberStyle = {
  padding: '8px 10px',
  fontSize: T.tableHead,
  fontWeight: 700,
  color: '#0F172A',
  verticalAlign: 'top',
  borderRight: '1px solid #E2E8F0',
  borderBottom: '1px solid #E2E8F0',
};

const tdCellStyle = {
  padding: '8px 12px',
  verticalAlign: 'top',
  borderRight: '1px solid #E2E8F0',
  borderBottom: '1px solid #E2E8F0',
};
