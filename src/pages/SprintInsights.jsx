import { T, tooltipStyle } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, CartesianGrid, Cell, LabelList,
} from 'recharts';
import { WrapTick } from '../charts/chartUtils';

const PRIORITY_COLORS = {
  Highest: '#991B1B',
  High: '#F43F5E',
  Medium: '#F59E0B',
  Low: '#6366F1',
  Lowest: '#94A3B8',
};

function riskColor(score) {
  if (score >= 60) return { bg: '#FEF2F2', color: '#F43F5E', border: '#FECACA', label: 'High' };
  if (score >= 30) return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: 'Med' };
  return { bg: '#F0FDF4', color: '#059669', border: '#BBF7D0', label: 'Low' };
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: T.section, fontWeight: 700, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  );
}

function SectionSub({ children }) {
  return <p style={{ fontSize: T.body, color: '#94A3B8', margin: '0 0 10px 4px', fontWeight: 500 }}>{children}</p>;
}

export default function SprintInsights({ data, slideRef }) {
  const {
    completionByType = { planned: {}, unplanned: {} },
    completionByPriority = [],
    estimateAccuracy = [],
    assigneeRisk = [],
  } = data;

  return (
    <SlideLayout title="Sprint Insights" slideRef={slideRef}>
      <div className="flex gap-4 h-full animate-slide-up animate-delay-1">

        {/* ── Panel 1: Completion Rate ── */}
        <div className="card flex flex-col animate-slide-up animate-delay-2" style={{ flex: 1, padding: '16px 20px 10px' }}>
          <SectionTitle>Completion Rate</SectionTitle>
          <SectionSub>Planned vs Unplanned + by Priority</SectionSub>

          {/* Planned vs Unplanned */}
          <div className="flex gap-3 mb-4">
            {[
              { label: 'Planned', data: completionByType.planned, color: '#1E3A5F' },
              { label: 'Unplanned', data: completionByType.unplanned, color: '#F59E0B' },
            ].map(({ label, data: d, color }) => (
              <div key={label} style={{ flex: 1, background: '#F8FAFC', borderRadius: 10, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: T.label, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: T.metricLg, fontWeight: 800, color, lineHeight: 1, marginBottom: 6 }}>
                  {d?.pct ?? 0}%
                </div>
                <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3 }}>
                  <div style={{ width: `${d?.pct ?? 0}%`, height: '100%', background: color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: T.micro, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
                  {d?.done ?? 0} / {d?.total ?? 0} Done
                </div>
              </div>
            ))}
          </div>

          {/* Priority vs Completion */}
          <div className="flex-1 min-h-0">
            {completionByPriority.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: T.body, textAlign: 'center', paddingTop: 24 }}>No data</div>
            ) : (
              completionByPriority.map((p) => (
                <div key={p.priority} style={{ marginBottom: 10 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
                    <span style={{ fontSize: T.label, fontWeight: 600, color: PRIORITY_COLORS[p.priority] || '#64748B' }}>
                      {p.priority}
                    </span>
                    <span style={{ fontSize: T.label, fontWeight: 700, color: '#334155' }}>
                      {p.pct}% <span style={{ fontWeight: 400, color: '#94A3B8' }}>({p.done}/{p.total})</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 4 }}>
                    <div style={{
                      width: `${p.pct}%`, height: '100%', borderRadius: 4,
                      background: PRIORITY_COLORS[p.priority] || '#64748B',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Panel 2: Estimate Accuracy ── */}
        <div className="card flex flex-col animate-slide-up animate-delay-3" style={{ flex: 1.3, padding: '16px 20px 10px' }}>
          <SectionTitle>Estimate Accuracy</SectionTitle>
          <SectionSub>Actual − Estimate per person (MD) · negative = under budget</SectionSub>
          <div className="flex-1 min-h-0">
            {estimateAccuracy.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: T.body, textAlign: 'center', paddingTop: 24 }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={estimateAccuracy}
                  layout="vertical"
                  margin={{ top: 4, right: 52, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
                  <YAxis
                    dataKey="assignee"
                    type="category"
                    tick={<WrapTick />}
                    width={130}
                    axisLine={false}
                    tickLine={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: T.chartAxis, fill: '#94A3B8', fontWeight: 500 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                    allowDecimals={true}
                    tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`${v > 0 ? '+' : ''}${v} MD`, 'Variance']}
                  />
                  <ReferenceLine x={0} stroke="#CBD5E1" strokeWidth={1.5} />
                  <Bar dataKey="variance" radius={[0, 4, 4, 0]} barSize={22}>
                    {estimateAccuracy.map((entry) => (
                      <Cell key={entry.assignee} fill={entry.variance > 0 ? '#F43F5E' : '#10B981'} />
                    ))}
                    <LabelList
                      dataKey="variance"
                      position="right"
                      fontSize={T.chartLabel}
                      fontWeight={700}
                      fill="#475569"
                      formatter={(v) => `${v > 0 ? '+' : ''}${v}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="flex gap-4 justify-center" style={{ paddingTop: 6 }}>
            {[['#10B981', 'Under / On budget'], ['#F43F5E', 'Over budget']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                <span style={{ fontSize: T.caption, color: '#64748B', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel 3: Risk Score ── */}
        <div className="card flex flex-col animate-slide-up animate-delay-4" style={{ flex: 1.3, padding: '16px 20px 10px' }}>
          <SectionTitle>Assignee Risk Score</SectionTitle>
          <SectionSub>Combined: unplanned % · effort overrun · unresolved bugs</SectionSub>
          <div className="flex-1 min-h-0" style={{ overflow: 'auto' }}>
            {assigneeRisk.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: T.body, textAlign: 'center', paddingTop: 24 }}>No data</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Risk', 'Unplanned', 'Effort Var.', 'Bugs'].map((h) => (
                      <th key={h} style={{
                        fontSize: T.tableHead, fontWeight: 700, color: '#94A3B8',
                        padding: '0 8px 8px', textAlign: h === 'Name' ? 'left' : 'center',
                        borderBottom: '1px solid #E2E8F0', letterSpacing: '0.03em', textTransform: 'uppercase',
                        position: 'sticky', top: 0, background: '#fff',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assigneeRisk.map((r, i) => {
                    const rs = riskColor(r.riskScore);
                    return (
                      <tr key={r.assignee} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '7px 8px', fontSize: T.label, fontWeight: 600, color: '#0F172A', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.assignee}
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
                            borderRadius: 6, padding: '2px 8px', fontSize: T.caption, fontWeight: 700,
                          }}>
                            {r.riskScore} · {rs.label}
                          </span>
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', fontSize: T.label, fontWeight: 600, color: r.unplannedPct > 30 ? '#F43F5E' : '#334155' }}>
                          {r.unplannedPct}%
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', fontSize: T.label, fontWeight: 600, color: r.effortVariance > 0 ? '#F43F5E' : '#10B981' }}>
                          {r.effortVariance > 0 ? '+' : ''}{r.effortVariance} MD
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', fontSize: T.label, fontWeight: 700, color: r.unresolvedBugs > 0 ? '#F43F5E' : '#94A3B8' }}>
                          {r.unresolvedBugs > 0 ? r.unresolvedBugs : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </SlideLayout>
  );
}
