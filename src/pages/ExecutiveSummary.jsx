import SlideLayout from '../components/SlideLayout';
import KPICard from '../components/KPICard';
import HorizontalStackedBar from '../charts/HorizontalStackedBar';

export default function ExecutiveSummary({ data, slideRef }) {
  return (
    <SlideLayout title="Executive Summary" subtitle="Sprint Overview" slideRef={slideRef}>
      <div className="flex gap-7 h-full">
        {/* Left: KPI Cards */}
        <div className="flex flex-col gap-5 justify-center" style={{ width: 400 }}>
          <KPICard label="Total Cards" value={data.total} color="#1E3A5F" large delay={1} />
          <div className="grid grid-cols-2 gap-4">
            <KPICard label="Planned" value={data.plannedCount} subtitle={`${data.total > 0 ? Math.round((data.plannedCount / data.total) * 100) : 0}% of total`} color="#1E3A5F" delay={2} />
            <KPICard
              label="Unplanned"
              value={data.unplannedCount}
              subtitle={`${data.pctUnplanned}% of total`}
              color="#F59E0B"
              delay={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <KPICard label="% Done" value={`${data.pctDone}%`} color="#0D9488" delay={3} />
            <KPICard label="Total Bugs" value={data.totalBugs} color="#F43F5E" delay={3} />
          </div>
        </div>

        {/* Right: Stacked Bar Chart */}
        <div
          className="card flex-1 flex flex-col animate-slide-up animate-delay-2"
          style={{ padding: '24px 24px 16px' }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
          >
            Planned vs Unplanned by Status
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px 4px', fontWeight: 500 }}>
            Breakdown of work items across statuses
          </p>
          <div className="flex-1 min-h-0">
            <HorizontalStackedBar data={data.statusByType} height="100%" />
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
