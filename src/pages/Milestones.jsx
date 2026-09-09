import { useState, useEffect, useMemo } from 'react';
import SlideLayout from '../components/SlideLayout';
import { T } from '../utils/typography';

// Same palette as Overview Update so a status reads the same on both slides.
const STATUS_STYLE = {
  Done: { bg: '#3B82F6', color: '#FFFFFF' },
  Completed: { bg: '#3B82F6', color: '#FFFFFF' },
  Testing: { bg: '#22C55E', color: '#FFFFFF' },
  'In-Progress': { bg: '#0D9488', color: '#FFFFFF' },
  'Not Start': { bg: '#9CA3AF', color: '#FFFFFF' },
  Pending: { bg: '#F59E0B', color: '#FFFFFF' },
  Delay: { bg: '#EF4444', color: '#FFFFFF' },
};

// A deliverable that is under way should not read as 0%. When the team fills the
// sheet's Progress column that number wins; otherwise the status implies one.
const STATUS_WEIGHT = {
  'Not Start': 0,
  Pending: 0,
  'In-Progress': 50,
  Delay: 50,
  Testing: 80,
  Completed: 100,
  Done: 100,
};

/**
 * Explicit Progress from the sheet, else the weight implied by Status.
 * A leftover 0% on a row that has since started is stale, not a real reading —
 * the status wins there, so moving a row to In-Progress shows movement without
 * anyone having to retype the percentage.
 */
function rowProgress(item) {
  const weight = STATUS_WEIGHT[item.status] ?? 0;
  const explicit = parsePercent(item.progress);
  if (explicit == null) return weight;
  if (explicit === 0 && weight > 0) return weight;
  return explicit;
}

const OVERDUE = '#EF4444';
const DUE_SOON = '#F59E0B';

// A contract deliverable is one the client pays against — the sheet says so in
// its Contract column. Sheets written before that column existed fall back to
// the old rule: a Source naming the TOR or the contract itself.
const CONTRACT_SOURCES = ['TOR', 'สัญญา'];

function isContractRow(item) {
  const flag = String(item.contract ?? '').trim().toLowerCase();
  if (flag) return flag === 'yes' || flag === 'y' || flag === 'true' || flag === 'ใช่';
  const source = String(item.source ?? '').trim();
  return CONTRACT_SOURCES.some((s) => source.startsWith(s));
}

/** dd/mm/yyyy (sheet format) or ISO. Returns null when unparseable. */
function parseDate(str) {
  if (!str) return null;
  if (str instanceof Date) return str;
  const s = String(str).trim();
  const parts = s.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts.map((p) => parseInt(p, 10));
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  }
  const iso = new Date(s);
  return isNaN(iso.getTime()) ? null : iso;
}

const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

/** 07/11/2026 -> "7 พ.ย. 69" (Buddhist era, matching the plan documents) */
function thaiDate(str) {
  const d = parseDate(str);
  if (!d) return str || '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear() + 543).slice(-2)}`;
}

function daysBetween(from, to) {
  return Math.round((to - from) / 86400000);
}

/** Percentages arrive as "20%" (formatted) or 0.2 (raw) depending on fetch mode. */
function parsePercent(val) {
  if (val === '' || val == null) return null;
  if (typeof val === 'number') return val <= 1 ? val * 100 : val;
  const n = parseFloat(String(val).replace('%', ''));
  return isNaN(n) ? null : (String(val).includes('%') || n > 1 ? n : n * 100);
}

/**
 * Which sprint a plan date lands in. Dates that fall in the gap between two
 * sprints (a weekend) round forward to the sprint that starts next.
 */
function sprintOf(date, sprintList) {
  if (!date || !sprintList?.length) return '';
  const ranges = sprintList
    .map((sp) => ({ name: sp.name, start: parseDate(sp.startDate), end: parseDate(sp.endDate) }))
    .filter((sp) => sp.start && sp.end);
  const inside = ranges.find((sp) => date >= sp.start && date <= sp.end);
  if (inside) return inside.name;
  const next = ranges.find((sp) => date < sp.start);
  if (next) return next.name;
  const last = ranges[ranges.length - 1];
  return last ? `หลัง ${last.name}` : '';
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Group rows into projects -> phases, keeping sheet order.
 * Each phase carries its own due date, payment share and deliverable counts.
 */
function buildProjects(rows, phaseRows, sprintList) {
  const today = startOfToday();
  // ข้อมูลระดับงวดอยู่คนละชีต — คีย์ด้วย "โครงการ|งวด"
  const meta = {};
  (phaseRows || []).forEach((p) => {
    meta[`${p.project}|${p.phase}`] = p;
  });
  const projectOrder = [];
  const byProject = {};

  rows.forEach((r) => {
    if (!byProject[r.project]) {
      byProject[r.project] = { name: r.project, phaseOrder: [], phases: {} };
      projectOrder.push(r.project);
    }
    const proj = byProject[r.project];
    if (!proj.phases[r.phase]) {
      const m = meta[`${r.project}|${r.phase}`] || {};
      proj.phases[r.phase] = {
        phase: r.phase,
        name: m.phaseName || '',
        due: m.milestoneDue || '',
        dueDate: parseDate(m.milestoneDue),
        payment: parsePercent(m.payment),
        dueBasis: m.dueBasis || '',
        caution: m.caution || '',
        items: [],
      };
      proj.phaseOrder.push(r.phase);
    }
    const ph = proj.phases[r.phase];
    const finishDate = parseDate(r.planFinish);
    ph.items.push({ ...r, finishDate, sprint: sprintOf(finishDate, sprintList) });
  });

  return projectOrder.map((name) => {
    const proj = byProject[name];
    const phases = proj.phaseOrder.map((key) => {
      const ph = proj.phases[key];
      const contract = ph.items.filter(isContractRow);
      const done = ph.items.filter((it) => it.status === 'Completed').length;
      // "เริ่มแล้ว" นับสะสม — รวมรายการที่ปิดไปแล้วด้วย เส้นจึงไม่สั้นลงเมื่องานเสร็จ
      const inFlight = ph.items.filter(
        (it) => it.status !== 'Completed' && rowProgress(it) > 0,
      ).length;
      const started = done + inFlight;
      const overdue = ph.items.filter(
        (it) => it.status !== 'Completed' && it.finishDate && it.finishDate < today,
      ).length;
      const progressSum = ph.items.reduce((sum, it) => sum + rowProgress(it), 0);
      return {
        ...ph,
        contractCount: contract.length,
        total: ph.items.length,
        done,
        inFlight,
        overdue,
        // Solid part of the bar = signed off; the rest of `percent` is work in flight.
        donePercent: ph.items.length ? Math.round((done / ph.items.length) * 100) : 0,
        started,
        startedPercent: ph.items.length ? Math.round((started / ph.items.length) * 100) : 0,
        percent: ph.items.length ? Math.round(progressSum / ph.items.length) : 0,
        daysLeft: ph.dueDate ? daysBetween(today, ph.dueDate) : null,
        closed: done === ph.items.length,
      };
    });

    // "Now" = the earliest phase still carrying unfinished work.
    const active = phases.find((p) => !p.closed) || phases[phases.length - 1];
    return { name, phases, active };
  });
}

/** Page count without rendering — PresentMode needs it to lay out slides. */
export function computeMilestonePageCount(data) {
  const rows = data.milestones || [];
  if (!rows.length) return 1;
  return buildProjects(rows, data.milestonePhases, data.sprintList).length;
}

/** One labelled progress track inside a phase card. */
function MiniBar({ label, count, total, percent, color }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div className="flex items-baseline justify-between" style={{ gap: 6 }}>
        <span style={{ fontSize: T.caption, color: '#64748B', fontWeight: 600 }}>
          {label} <span style={{ color: '#94A3B8' }}>{count}/{total}</span>
        </span>
        <span style={{ fontSize: T.caption, fontWeight: 800, color: percent > 0 ? color : '#CBD5E1' }}>
          {percent}%
        </span>
      </div>
      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', borderRadius: 3, background: color }} />
      </div>
    </div>
  );
}

function PhaseCard({ phase, isActive, isCurrent, onSelect }) {
  const { daysLeft } = phase;
  let badge;
  if (phase.closed) {
    badge = { text: 'ส่งครบแล้ว', bg: '#DBEAFE', color: '#1D4ED8' };
  } else if (daysLeft == null) {
    badge = { text: '—', bg: '#F1F5F9', color: '#64748B' };
  } else if (daysLeft < 0) {
    badge = { text: `เลย ${Math.abs(daysLeft)} วัน`, bg: '#FEE2E2', color: '#B91C1C' };
  } else if (daysLeft <= 30) {
    badge = { text: `เหลือ ${daysLeft} วัน`, bg: '#FEF3C7', color: '#B45309' };
  } else {
    badge = { text: `เหลือ ${daysLeft} วัน`, bg: '#F1F5F9', color: '#475569' };
  }

  return (
    <div
      className="flex-1 flex flex-col cursor-pointer"
      onClick={onSelect}
      title="กดเพื่อดูรายการที่ต้องส่งของงวดนี้"
      style={{
        background: isActive ? '#FFFFFF' : '#F8FAFC',
        border: isActive ? '2px solid #D97706' : '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '12px 14px',
        minWidth: 0,
        boxShadow: isActive ? '0 4px 14px rgba(217, 119, 6, 0.18)' : 'none',
      }}
    >
      <div className="flex items-baseline justify-between" style={{ gap: 8 }}>
        <span className="flex items-baseline" style={{ gap: 6 }}>
          <span style={{ fontSize: T.section, fontWeight: 800, color: '#0F172A' }}>{phase.phase}</span>
          {isCurrent && (
            <span
              style={{
                fontSize: T.caption, fontWeight: 700, color: '#B45309',
                background: '#FEF3C7', borderRadius: 5, padding: '1px 6px',
              }}
            >
              ปัจจุบัน
            </span>
          )}
        </span>
        {phase.payment != null && (
          <span style={{ fontSize: T.label, fontWeight: 800, color: '#6366F1' }}>
            {phase.payment}%
          </span>
        )}
      </div>

      <div
        className="truncate"
        style={{ fontSize: T.caption, color: '#64748B', fontWeight: 500, marginTop: 2 }}
        title={phase.name}
      >
        {phase.name}
      </div>

      <div style={{ fontSize: T.label, fontWeight: 700, color: '#0F172A', marginTop: 6 }}>
        {thaiDate(phase.due)}
      </div>

      {/* Two separate tracks — signed off, and work in flight */}
      <MiniBar
        label="Started"
        count={phase.started}
        total={phase.total}
        percent={phase.startedPercent}
        color={phase.overdue > 0 ? OVERDUE : '#0D9488'}
      />
      <MiniBar
        label="Completed"
        count={phase.done}
        total={phase.total}
        percent={phase.donePercent}
        color="#3B82F6"
      />

      <div className="flex items-center justify-end" style={{ marginTop: 6, gap: 6 }}>
        <span
          style={{
            fontSize: T.caption,
            fontWeight: 700,
            background: badge.bg,
            color: badge.color,
            padding: '2px 8px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
          }}
        >
          {badge.text}
        </span>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, color = '#0F172A' }) {
  return (
    <div
      className="flex-1"
      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 16px' }}
    >
      <div style={{ fontSize: T.caption, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.03em' }}>
        {label}
      </div>
      <div style={{ fontSize: T.metricValue, fontWeight: 800, color, lineHeight: 1.15, marginTop: 2 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: T.caption, color: '#64748B', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

export default function Milestones({ data, slideRef, forcePage }) {
  const rows = data.milestones || [];
  const [page, setPage] = useState(forcePage ?? 0);
  // null = ยึดงวดปัจจุบันที่คำนวณเอง · ตั้งค่าเมื่อผู้ใช้กดการ์ดงวดอื่นเพื่อดูล่วงหน้า/ย้อนหลัง
  const [pickedPhase, setPickedPhase] = useState(null);

  useEffect(() => {
    if (forcePage != null) setPage(forcePage);
  }, [forcePage]);

  // เปลี่ยนโครงการ = เริ่มดูที่งวดปัจจุบันของโครงการนั้นเสมอ
  useEffect(() => {
    setPickedPhase(null);
  }, [page]);

  const phaseRows = data.milestonePhases || [];
  const sprintList = data.sprintList || [];
  const projects = useMemo(
    () => buildProjects(rows, phaseRows, sprintList),
    [rows, phaseRows, sprintList],
  );
  const today = startOfToday();

  if (!projects.length) {
    return (
      <SlideLayout title="Milestone Tracking" slideRef={slideRef}>
        <div className="flex items-center justify-center h-full">
          <span style={{ fontSize: T.body, color: '#94A3B8' }}>No data available</span>
        </div>
      </SlideLayout>
    );
  }

  const totalPages = projects.length;
  const project = projects[Math.min(page, totalPages - 1)];
  const current = project.active;
  const active = (pickedPhase && project.phases.find((p) => p.phase === pickedPhase)) || current;
  const isViewingOther = active.phase !== current.phase;

  // Deliverables of the phase in flight, nearest deadline first.
  const items = [...active.items].sort((a, b) => {
    if (!a.finishDate) return 1;
    if (!b.finishDate) return -1;
    return a.finishDate - b.finishDate;
  });

  // Rows must fit the fixed 1080px slide — tighten the padding as the list grows,
  // and never render more than the table area can hold.
  const MAX_TABLE_ROWS = 18;
  const shown = items.slice(0, MAX_TABLE_ROWS);
  const hiddenCount = items.length - shown.length;
  const cellPad =
    items.length <= 12 ? '4px 12px' : items.length <= 15 ? '2px 12px' : '1px 12px';

  const overdueAll = project.phases.reduce((sum, p) => sum + p.overdue, 0);
  const contractLeft = active.items.filter(
    (it) => isContractRow(it) && it.status !== 'Completed',
  ).length;

  const title = totalPages > 1
    ? `Milestone Tracking — ${project.name} (${page + 1}/${totalPages})`
    : 'Milestone Tracking';

  return (
    <SlideLayout
      title={title}
      subtitle={`งวดงานตามสัญญา · ${active.phase} ${active.name} — ครบกำหนด ${thaiDate(active.due)}`}
      slideRef={slideRef}
    >
      <div className="flex flex-col h-full animate-slide-up animate-delay-1" style={{ gap: 12 }}>
        {/* KPI strip */}
        <div className="flex flex-none" style={{ gap: 12 }}>
          <KPI
            label="งวดปัจจุบัน"
            value={`${active.phase} · ${active.percent}%`}
            sub={`${active.payment != null ? `${active.payment}% ของค่าจ้าง · ` : ''}${active.done} เสร็จ · ${active.inFlight} กำลังทำ · ${active.total - active.started} ยังไม่เริ่ม`}
          />
          <KPI
            label="ครบกำหนด"
            value={thaiDate(active.due)}
            sub={
              // A delivered phase is done with its deadline — counting days past it
              // reads as a breach when there is none.
              active.closed ? 'ส่งครบแล้ว'
                : active.daysLeft == null ? '—'
                : active.daysLeft < 0 ? `เลยกำหนด ${Math.abs(active.daysLeft)} วัน`
                : `อีก ${active.daysLeft} วัน`
            }
            color={
              active.closed ? '#1D4ED8'
                : active.daysLeft == null ? '#0F172A'
                : active.daysLeft < 0 ? OVERDUE
                : active.daysLeft <= 30 ? DUE_SOON
                : '#0F172A'
            }
          />
          <KPI
            label="สิ่งส่งมอบตามสัญญา"
            value={`${active.contractCount - contractLeft}/${active.contractCount}`}
            sub="ที่ต้องส่งในงวดนี้"
          />
          <KPI
            label="เลยกำหนดแผน"
            value={overdueAll}
            sub={overdueAll ? 'รายการต้องเร่ง' : 'ไม่มีงานค้าง'}
            color={overdueAll ? OVERDUE : '#16A34A'}
          />
        </div>

        {/* Phase timeline */}
        <div className="flex flex-none" style={{ gap: 10 }}>
          {project.phases.map((p) => (
            <PhaseCard
              key={p.phase}
              phase={p}
              isActive={p.phase === active.phase}
              isCurrent={p.phase === current.phase}
              onSelect={() => setPickedPhase(p.phase === current.phase ? null : p.phase)}
            />
          ))}
        </div>

        {/* Deliverables of the active phase */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center flex-none" style={{ gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: T.section, fontWeight: 800, color: '#0F172A' }}>
              ต้องส่งใน {active.phase}
              {isViewingOther && (
                <span style={{ fontSize: T.caption, fontWeight: 700, color: '#B45309' }}> (ดูล่วงหน้า)</span>
              )}
            </span>
            <span style={{ fontSize: T.caption, color: '#64748B', fontWeight: 600 }}>
              เรียงตามกำหนดเสร็จ · แถบส้ม = สิ่งส่งมอบตามสัญญา · Started = In-Progress + Completed · % สีเทา = ประเมินจากสถานะ, สีเข้ม = ทีมกรอกเอง
            </span>
            {isViewingOther && (
              <button
                onClick={() => setPickedPhase(null)}
                className="export-hide cursor-pointer"
                style={{
                  fontSize: T.caption, fontWeight: 700, padding: '2px 10px', borderRadius: 8,
                  border: '1px solid #FCD34D', background: '#FEF3C7', color: '#B45309',
                  whiteSpace: 'nowrap',
                }}
              >
                ← กลับไป {current.phase} (งวดปัจจุบัน)
              </button>
            )}
            {totalPages > 1 && (
              <div className="export-hide flex items-center" style={{ gap: 6, marginLeft: 'auto' }}>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="cursor-pointer"
                  style={{
                    fontSize: T.nav, fontWeight: 700, padding: '1px 10px', borderRadius: 8,
                    border: '1px solid #E2E8F0', background: '#FFFFFF',
                    color: page === 0 ? '#CBD5E1' : '#475569',
                  }}
                >&#8249;</button>
                <span style={{ fontSize: T.caption, color: '#64748B', fontWeight: 700 }}>
                  {page + 1}/{totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="cursor-pointer"
                  style={{
                    fontSize: T.nav, fontWeight: 700, padding: '1px 10px', borderRadius: 8,
                    border: '1px solid #E2E8F0', background: '#FFFFFF',
                    color: page === totalPages - 1 ? '#CBD5E1' : '#475569',
                  }}
                >&#8250;</button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: '#1E3A5F' }}>
                  {[
                    ['สิ่งที่ต้องทำ', '34%'],
                    ['รูปแบบข้อมูลที่ต้องส่ง', '18%'],
                    ['ผู้รับผิดชอบ', '13%'],
                    ['เสร็จเมื่อไหร่', '10%'],
                    ['Sprint', '8%'],
                    ['คืบหน้า', '9%'],
                    ['Status', '8%'],
                  ].map(([label, width]) => (
                    <th
                      key={label}
                      style={{
                        width,
                        fontSize: T.tableHead,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        textAlign: 'left',
                        padding: '10px 12px',
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((it, i) => {
                  const late = it.status !== 'Completed' && it.finishDate && it.finishDate < today;
                  const style = STATUS_STYLE[it.status] || STATUS_STYLE['Not Start'];
                  return (
                    <tr
                      key={i}
                      style={{
                        background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      <td style={{ padding: cellPad, fontSize: T.tableCell, color: '#0F172A', fontWeight: 600 }}>
                        <div className="flex items-center" style={{ gap: 8 }}>
                          <span
                            style={{
                              width: 4,
                              height: 18,
                              borderRadius: 2,
                              background: isContractRow(it) ? '#D97706' : '#CBD5E1',
                              flexShrink: 0,
                            }}
                          />
                          <span
                            className="truncate"
                            title={
                              it.acceptance
                                ? `${it.deliverable}

เกณฑ์ตรวจรับ: ${it.acceptance}`
                                : it.deliverable
                            }
                          >
                            {it.deliverable}
                          </span>
                        </div>
                      </td>
                      <td className="truncate" style={{ padding: cellPad, fontSize: T.micro, color: '#475569' }} title={it.format}>
                        {it.format}
                      </td>
                      <td className="truncate" style={{ padding: cellPad, fontSize: T.micro, color: '#475569' }} title={it.owner}>
                        {it.owner}
                      </td>
                      <td
                        style={{
                          padding: cellPad,
                          fontSize: T.micro,
                          fontWeight: 700,
                          color: late ? OVERDUE : '#0F172A',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {thaiDate(it.planFinish)}
                        {late && ' ⚠'}
                      </td>
                      <td style={{ padding: cellPad, fontSize: T.micro, color: '#64748B' }}>
                        {it.sprint}
                      </td>
                      <td style={{ padding: cellPad }}>
                        <div className="flex items-center" style={{ gap: 6 }}>
                          <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, minWidth: 30 }}>
                            <div
                              style={{
                                width: `${rowProgress(it)}%`,
                                height: '100%',
                                borderRadius: 3,
                                background: it.status === 'Completed' ? '#3B82F6' : late ? '#EF4444' : '#0D9488',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: T.caption,
                              fontWeight: 700,
                              color: parsePercent(it.progress) ? '#0F172A' : '#94A3B8',
                              whiteSpace: 'nowrap',
                            }}
                            title={parsePercent(it.progress) ? 'กรอกเองใน sheet' : 'ประเมินจากสถานะ'}
                          >
                            {rowProgress(it)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: cellPad }}>
                        <span
                          style={{
                            fontSize: T.caption,
                            fontWeight: 700,
                            background: style.bg,
                            color: style.color,
                            padding: '2px 8px',
                            borderRadius: 6,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {it.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {hiddenCount > 0 && (
              <div style={{ fontSize: T.caption, color: '#94A3B8', fontWeight: 600, padding: '6px 12px' }}>
                + อีก {hiddenCount} รายการ (ดูใน sheet Milestones)
              </div>
            )}
          </div>

          {/* Why this date, and what to watch out for — per phase, straight from the sheet */}
          {(active.dueBasis || active.caution) && (
            <div
              className="flex-none"
              style={{
                marginTop: 8,
                display: 'flex',
                gap: 10,
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '8px 12px',
              }}
            >
              {active.dueBasis && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.caption, fontWeight: 800, color: '#1E3A5F', marginBottom: 1 }}>
                    ที่มาของกำหนดส่ง
                  </div>
                  <div style={{ fontSize: T.caption, color: '#475569', lineHeight: 1.45 }}>
                    {active.dueBasis}
                  </div>
                </div>
              )}
              {active.caution && (
                <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid #CBD5E1', paddingLeft: 10 }}>
                  <div style={{ fontSize: T.caption, fontWeight: 800, color: '#B45309', marginBottom: 1 }}>
                    ข้อควรระวัง
                  </div>
                  <div style={{ fontSize: T.caption, color: '#475569', lineHeight: 1.45 }}>
                    {active.caution}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SlideLayout>
  );
}
