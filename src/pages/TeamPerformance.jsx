import SlideLayout from '../components/SlideLayout';
import StackedBarChart from '../charts/StackedBarChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { TYPE_COLORS } from '../utils/colors';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: 13,
  fontWeight: 500,
  padding: '10px 14px',
};

function TotalChart({ data, height = 400 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 12, right: 40, left: 12, bottom: 12 }}
      >
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
        <YAxis
          dataKey="assignee"
          type="category"
          tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }}
          width={150}
          axisLine={false}
          tickLine={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 500 }}
          allowDecimals={false}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 12, color: '#475569' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="Planned" stackId="a" fill={TYPE_COLORS.Planned} barSize={32} radius={[0, 0, 0, 0]}>
          <LabelList dataKey="Planned" position="center" fill="#fff" fontSize={11} fontWeight={700} />
        </Bar>
        <Bar dataKey="Unplanned" stackId="a" fill={TYPE_COLORS.Unplanned} barSize={32} radius={[0, 6, 6, 0]}>
          <LabelList dataKey="Unplanned" position="center" fill="#fff" fontSize={11} fontWeight={700} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function TeamPerformance({ data, slideRef }) {
  return (
    <SlideLayout title="Team Performance" subtitle="All Assignees — Planned vs Unplanned" slideRef={slideRef}>
      <div className="flex gap-6 h-full">
        {/* Left: Total */}
        <div
          className="card flex flex-col animate-slide-up animate-delay-1"
          style={{ padding: '24px 24px 16px', flex: 1.2 }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
          >
            Total by Assignee
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px 4px', fontWeight: 500 }}>
            Planned + Unplanned per member
          </p>
          <div className="flex-1 min-h-0">
            <TotalChart data={data.teamTotal} height="100%" />
          </div>
        </div>

        {/* Middle: Planned */}
        <div
          className="card flex-1 flex flex-col animate-slide-up animate-delay-2"
          style={{ padding: '24px 24px 16px' }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
          >
            Planned by Assignee
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px 4px', fontWeight: 500 }}>
            Story cards per member
          </p>
          <div className="flex-1 min-h-0">
            <StackedBarChart data={data.teamPlanned} height="100%" />
          </div>
        </div>

        {/* Right: Unplanned */}
        <div
          className="card flex-1 flex flex-col animate-slide-up animate-delay-3"
          style={{ padding: '24px 24px 16px' }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: 17, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}
          >
            Unplanned by Assignee
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px 4px', fontWeight: 500 }}>
            Task cards per member
          </p>
          <div className="flex-1 min-h-0">
            <StackedBarChart data={data.teamUnplanned} height="100%" />
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
