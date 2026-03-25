import SlideLayout from '../components/SlideLayout';
import GroupedBarChart from '../charts/GroupedBarChart';
import DonutChart from '../charts/DonutChart';

export default function EffortOverview({ data, slideRef }) {
  const variance = data.totalActual - data.totalEstimate;
  const isOver = variance > 0;

  return (
    <SlideLayout title="Effort Overview" subtitle="Estimate vs Actual by Status" slideRef={slideRef}>
      <div className="flex flex-col h-full gap-5">
        {/* Main row */}
        <div className="flex gap-7 flex-1 min-h-0">
          {/* Left: Bar Chart */}
          <div
            className="card flex-1 flex flex-col animate-slide-up animate-delay-1"
            style={{ padding: '24px 24px 16px' }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
            >
              Estimate vs Actual
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px 4px', fontWeight: 500 }}>
              Man-days comparison by work status
            </p>
            <div className="flex-1 min-h-0">
              <GroupedBarChart data={data.effortByStatus} height="100%" />
            </div>
          </div>

          {/* Right: Donut */}
          <div
            className="card flex flex-col animate-slide-up animate-delay-2"
            style={{ width: 440, padding: '24px 24px 16px' }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
            >
              Status Distribution
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>
              Card count by current status
            </p>
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <DonutChart
                data={data.statusDistribution}
                height="100%"
                innerRadius={85}
                outerRadius={155}
                centerLabel="Cards"
              />
            </div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="flex gap-4 flex-none animate-slide-up animate-delay-3">
          <SummaryPill label="Total Estimate" value={data.totalEstimate.toFixed(2)} color="#1E3A5F" />
          <SummaryPill label="Total Actual" value={data.totalActual.toFixed(2)} color="#F59E0B" />
          <SummaryPill
            label="Variance"
            value={`${isOver ? '+' : ''}${variance.toFixed(2)}`}
            color={isOver ? '#F43F5E' : '#0D9488'}
            highlight={isOver}
          />
        </div>
      </div>
    </SlideLayout>
  );
}

function SummaryPill({ label, value, color, highlight = false }) {
  return (
    <div
      className="card flex-1 flex items-center justify-between"
      style={{
        padding: '14px 24px',
        borderLeft: `3px solid ${color}`,
        background: highlight ? '#FFF7F7' : '#FFFFFF',
      }}
    >
      <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600, letterSpacing: '0.01em' }}>
        {label}
      </span>
      <span className="font-extrabold" style={{ fontSize: 20, color, letterSpacing: '-0.02em' }}>
        {value}
      </span>
    </div>
  );
}
