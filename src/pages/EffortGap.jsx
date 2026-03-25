import SlideLayout from '../components/SlideLayout';
import GroupedBarChart from '../charts/GroupedBarChart';

export default function EffortGap({ data, slideRef }) {
  // Merge completed + active into one summary
  const totalEst = data.effortGapDone.Estimate + data.effortGapTodo.Estimate;
  const totalAct = data.effortGapDone.Actual + data.effortGapTodo.Actual;
  const totalGap = totalAct - totalEst;
  const isOverrun = totalGap > 0;

  // Sort assignees by gap descending (highest overrun first)
  const sortedGap = [...data.effortGapByAssignee]
    .filter((d) => d.Estimate > 0 || d.Actual > 0)
    .sort((a, b) => b.gap - a.gap);

  // Insights
  const top3 = sortedGap.filter((d) => d.gap > 0).slice(0, 3);
  const lowest = [...sortedGap].sort((a, b) => a.gap - b.gap)[0];
  const overrunCount = sortedGap.filter((d) => d.gap > 0).length;
  const GAP_THRESHOLD = 2;
  const criticalCount = sortedGap.filter((d) => d.gap > GAP_THRESHOLD).length;

  return (
    <SlideLayout title="Effort Gap Analysis" subtitle="Estimate vs Actual — Variance by Assignee" slideRef={slideRef}>
      <div className="flex gap-4 h-full">
        {/* Left Panel: Summary + Insights */}
        <div className="flex flex-col gap-3" style={{ width: 340, flexShrink: 0 }}>

          {/* Effort Summary */}
          <div className="card animate-slide-up animate-delay-1" style={{ padding: '16px 20px 14px', borderLeft: `3px solid ${isOverrun ? '#F43F5E' : '#0D9488'}` }}>
            <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 700, marginBottom: 10 }}>Effort Summary</div>
            <div className="flex justify-between">
              <MetricBlock label="Estimate" value={totalEst.toFixed(2)} color="#1E3A5F" />
              <MetricBlock label="Actual" value={totalAct.toFixed(2)} color="#F59E0B" />
              <MetricBlock label="Gap" value={`${totalGap > 0 ? '+' : ''}${totalGap.toFixed(2)}`} color={isOverrun ? '#F43F5E' : '#0D9488'} />
            </div>
            {/* Progress indicator */}
            <div style={{ marginTop: 10 }}>
              <div className="flex justify-between" style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, marginBottom: 3 }}>
                <span>Estimate</span>
                <span>Actual</span>
              </div>
              <div style={{ position: 'relative', height: 6, background: '#F1F5F9', borderRadius: 3 }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3,
                  width: `${totalEst > 0 ? Math.min((totalAct / totalEst) * 100, 100) : 0}%`,
                  background: isOverrun ? '#F43F5E' : '#0D9488',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, textAlign: 'right' }}>
                {totalEst > 0 ? Math.round((totalAct / totalEst) * 100) : 0}% of estimate used
              </div>
            </div>
          </div>

          {/* Phase Breakdown: Completed vs Active */}
          <div className="card animate-slide-up animate-delay-1 flex gap-3" style={{ padding: '12px 16px' }}>
            <PhaseChip
              label="Completed"
              estimate={data.effortGapDone.Estimate}
              actual={data.effortGapDone.Actual}
              gap={data.effortGapDone.gap}
              overrun={data.effortGapDone.overrun}
            />
            <div style={{ width: 1, background: '#E2E8F0', flexShrink: 0 }} />
            <PhaseChip
              label="Active"
              estimate={data.effortGapTodo.Estimate}
              actual={data.effortGapTodo.Actual}
              gap={data.effortGapTodo.gap}
              overrun={data.effortGapTodo.overrun}
            />
          </div>

          {/* Insights */}
          <div className="card animate-slide-up animate-delay-2 flex-1 flex flex-col" style={{ padding: '14px 18px 12px' }}>
            <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 700, marginBottom: 8 }}>Insights</div>

            {top3.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Highest Overrun
                </div>
                {top3.map((d) => (
                  <div key={d.assignee} className="flex justify-between" style={{ fontSize: 12, padding: '2px 0' }}>
                    <span style={{ color: '#334155', fontWeight: 500 }}>{d.assignee}</span>
                    <span style={{ color: '#F43F5E', fontWeight: 700 }}>+{d.gap.toFixed(2)}d</span>
                  </div>
                ))}
              </div>
            )}

            {lowest && lowest.gap < 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Best Performer
                </div>
                <div className="flex justify-between" style={{ fontSize: 12 }}>
                  <span style={{ color: '#334155', fontWeight: 500 }}>{lowest.assignee}</span>
                  <span style={{ color: '#0D9488', fontWeight: 700 }}>{lowest.gap.toFixed(2)}d</span>
                </div>
              </div>
            )}

            {/* Risk Note */}
            <div className="mt-auto">
              {criticalCount > 0 ? (
                <div className="rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '8px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#F43F5E' }}>Risk</div>
                  <div style={{ fontSize: 10, color: '#64748B', lineHeight: 1.5 }}>
                    {criticalCount} member{criticalCount > 1 ? 's' : ''} exceed {GAP_THRESHOLD}d gap threshold. {overrunCount} of {sortedGap.length} over estimate.
                  </div>
                </div>
              ) : (
                <div className="rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '8px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A' }}>On Track</div>
                  <div style={{ fontSize: 10, color: '#64748B', lineHeight: 1.5 }}>
                    No member exceeds {GAP_THRESHOLD}d gap. {overrunCount} of {sortedGap.length} slightly over.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Estimate vs Actual Chart */}
        <div className="card flex-1 flex flex-col animate-slide-up animate-delay-2" style={{ padding: '16px 20px 12px' }}>
          <h2 className="font-semibold" style={{ fontSize: 15, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>
            Effort Gap by Assignee
          </h2>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>
            Man-days variance per team member
          </p>
          <div className="flex-1 min-h-0">
            <GroupedBarChart data={data.effortGapByAssignee} dataKeyX="assignee" height="100%" />
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function MetricBlock({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div className="font-extrabold" style={{ fontSize: 24, color, letterSpacing: '-0.03em', marginTop: 1 }}>{value}</div>
    </div>
  );
}

function PhaseChip({ label, estimate, actual, gap, overrun }) {
  return (
    <div className="flex-1">
      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div className="flex gap-4">
        <div>
          <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 500 }}>Est</div>
          <div className="font-bold" style={{ fontSize: 14, color: '#1E3A5F' }}>{estimate.toFixed(1)}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 500 }}>Act</div>
          <div className="font-bold" style={{ fontSize: 14, color: '#F59E0B' }}>{actual.toFixed(1)}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 500 }}>Gap</div>
          <div className="font-bold" style={{ fontSize: 14, color: overrun ? '#F43F5E' : '#0D9488' }}>
            {gap > 0 ? '+' : ''}{gap.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
