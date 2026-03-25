import SlideLayout from '../components/SlideLayout';
import DonutChart from '../charts/DonutChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';

const BUG_STATUS_COLORS = {
  Done: '#1E3A5F',
  'To Do': '#94A3B8',
  'Wait for Deploy': '#6366F1',
  'Waiting for test': '#8B5CF6',
  'Waiting for Test': '#8B5CF6',
  'Test Failed': '#F59E0B',
  Cancel: '#F43F5E',
  'In Progress': '#0D9488',
};

const BUG_PRIORITY_COLORS = {
  Highest: '#991B1B',
  High: '#F43F5E',
  Medium: '#F59E0B',
  Low: '#6366F1',
  Lowest: '#94A3B8',
};

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: 13,
  fontWeight: 500,
  padding: '10px 14px',
};

export default function DefectAnalysis({ data, slideRef }) {
  const resolutionRate = data.totalBugs > 0 ? Math.round((data.bugsDone / data.totalBugs) * 100) : 0;

  return (
    <SlideLayout title="Defect Analysis" subtitle="Bug Tracking Overview" slideRef={slideRef}>
      <div className="flex flex-col gap-4 h-full">
        {/* Top row: KPI stats */}
        <div className="flex gap-4 flex-none animate-slide-up animate-delay-1">
          {/* Total */}
          <div
            className="card flex items-center gap-5"
            style={{ padding: '14px 24px', flex: 2 }}
          >
            <div
              className="font-extrabold"
              style={{ fontSize: 48, color: '#F43F5E', lineHeight: 1, letterSpacing: '-0.04em' }}
            >
              {data.totalBugs}
            </div>
            <div>
              <div style={{ fontSize: 15, color: '#0F172A', fontWeight: 700 }}>
                Total Bugs in Sprint
              </div>
              <div className="flex gap-6 mt-2">
                <span style={{ fontSize: 14, color: '#1E3A5F', fontWeight: 700 }}>
                  {data.bugsDone} <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Resolved</span>
                </span>
                <span style={{ fontSize: 14, color: '#F43F5E', fontWeight: 700 }}>
                  {data.bugsTodo} <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Open</span>
                </span>
              </div>
            </div>
          </div>

          {/* Resolution Rate */}
          <div
            className="card flex items-center gap-5"
            style={{ padding: '14px 24px', flex: 1, borderLeft: '3px solid #1E3A5F' }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Resolution Rate
              </div>
              <div
                className="font-extrabold"
                style={{ fontSize: 40, color: '#1E3A5F', lineHeight: 1.1, marginTop: 2, letterSpacing: '-0.03em' }}
              >
                {resolutionRate}%
              </div>
            </div>
            <div className="flex-1">
              <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 4 }}>
                <div style={{
                  width: `${resolutionRate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #1E3A5F, #6366F1)',
                  borderRadius: 4,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: 3 panels */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* By Status */}
          <div
            className="card flex-1 flex flex-col animate-slide-up animate-delay-2"
            style={{ padding: '16px 20px 10px' }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: 15, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}
            >
              By Status
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>
              Current bug resolution state
            </p>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <DonutChart
                data={data.bugStatusDistribution}
                colorMap={BUG_STATUS_COLORS}
                height="100%"
                innerRadius={75}
                outerRadius={135}
                centerLabel="Bugs"
              />
            </div>
          </div>

          {/* By Priority */}
          <div
            className="card flex-1 flex flex-col animate-slide-up animate-delay-3"
            style={{ padding: '16px 20px 10px' }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: 15, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}
            >
              By Priority
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>
              Severity distribution
            </p>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <DonutChart
                data={data.bugPriorityDistribution}
                colorMap={BUG_PRIORITY_COLORS}
                height="100%"
                innerRadius={75}
                outerRadius={135}
                centerLabel="Bugs"
              />
            </div>
          </div>

          {/* By Assignee */}
          <div
            className="card flex-1 flex flex-col animate-slide-up animate-delay-4"
            style={{ padding: '16px 20px 10px' }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: 15, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}
            >
              By Assignee
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>
              Bug count per team member
            </p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.bugsByAssignee}
                  layout="vertical"
                  margin={{ top: 8, right: 36, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
                  <YAxis
                    dataKey="assignee"
                    type="category"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                    width={120}
                    axisLine={false}
                    tickLine={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }}
                    allowDecimals={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#F43F5E" radius={[0, 6, 6, 0]} barSize={20}>
                    <LabelList dataKey="count" position="right" fontSize={12} fontWeight={700} fill="#475569" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
