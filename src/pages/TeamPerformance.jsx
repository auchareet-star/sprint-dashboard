import SlideLayout from '../components/SlideLayout';
import StackedBarChart from '../charts/StackedBarChart';

export default function TeamPerformance({ data, slideRef }) {
  return (
    <SlideLayout title="Team Performance" subtitle="All Assignees — Planned vs Unplanned" slideRef={slideRef}>
      <div className="flex gap-7 h-full">
        {/* Left: Planned */}
        <div
          className="card flex-1 flex flex-col animate-slide-up animate-delay-1"
          style={{ padding: '24px 24px 16px' }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
          >
            Planned Items by Assignee
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px 4px', fontWeight: 500 }}>
            Story cards per team member
          </p>
          <div className="flex-1 min-h-0">
            <StackedBarChart data={data.teamPlanned} height="100%" />
          </div>
        </div>

        {/* Right: Unplanned */}
        <div
          className="card flex-1 flex flex-col animate-slide-up animate-delay-2"
          style={{ padding: '24px 24px 16px' }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
          >
            Unplanned Items by Assignee
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px 4px', fontWeight: 500 }}>
            Task cards per team member
          </p>
          <div className="flex-1 min-h-0">
            <StackedBarChart data={data.teamUnplanned} height="100%" />
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
