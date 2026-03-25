import SlideLayout from '../components/SlideLayout';
import GroupedBarChart from '../charts/GroupedBarChart';

export default function EffortGap({ data, slideRef }) {
  return (
    <SlideLayout title="Effort Gap Analysis" subtitle="Estimate vs Actual — Grouped by Work Phase" slideRef={slideRef}>
      <div className="flex gap-7 h-full">
        {/* Left: Summary Cards */}
        <div className="flex flex-col gap-5 justify-center" style={{ width: 400 }}>
          <GapCard
            title="Done / Deploy / Test / Cancel"
            subtitle="Completed work phases"
            estimate={data.effortGapDone.Estimate}
            actual={data.effortGapDone.Actual}
            gap={data.effortGapDone.gap}
            overrun={data.effortGapDone.overrun}
            delay={1}
          />
          <GapCard
            title="To Do / In Progress / Test Failed"
            subtitle="Active work phases"
            estimate={data.effortGapTodo.Estimate}
            actual={data.effortGapTodo.Actual}
            gap={data.effortGapTodo.gap}
            overrun={data.effortGapTodo.overrun}
            delay={2}
          />
        </div>

        {/* Right: Per-assignee chart */}
        <div
          className="card flex-1 flex flex-col animate-slide-up animate-delay-2"
          style={{ padding: '24px 24px 16px' }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
          >
            Effort Gap by Assignee
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px 4px', fontWeight: 500 }}>
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

function GapCard({ title, subtitle, estimate, actual, gap, overrun, delay = 0 }) {
  return (
    <div
      className={`card flex flex-col animate-slide-up ${delay ? `animate-delay-${delay}` : ''}`}
      style={{
        padding: '24px 28px 20px',
        borderLeft: overrun ? '3px solid #F43F5E' : '3px solid #0D9488',
        background: overrun ? '#FFFBFB' : '#FFFFFF',
      }}
    >
      <h3
        className="font-semibold"
        style={{ fontSize: 16, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}
      >
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0', fontWeight: 500 }}>{subtitle}</p>
      )}

      <div className="flex justify-between mt-4">
        <div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Estimate
          </div>
          <div className="font-extrabold" style={{ fontSize: 28, color: '#1E3A5F', letterSpacing: '-0.03em', marginTop: 1 }}>
            {estimate.toFixed(2)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Actual
          </div>
          <div className="font-extrabold" style={{ fontSize: 28, color: '#F59E0B', letterSpacing: '-0.03em', marginTop: 1 }}>
            {actual.toFixed(2)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Gap
          </div>
          <div
            className="font-extrabold"
            style={{ fontSize: 28, color: overrun ? '#F43F5E' : '#0D9488', letterSpacing: '-0.03em', marginTop: 1 }}
          >
            {gap > 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2)}
          </div>
        </div>
      </div>

      {overrun && (
        <div
          className="rounded-lg text-center font-semibold mt-3"
          style={{
            background: '#FEF2F2',
            color: '#F43F5E',
            padding: '6px 12px',
            fontSize: 12,
            letterSpacing: '0.01em',
          }}
        >
          Overrun Detected
        </div>
      )}
    </div>
  );
}
