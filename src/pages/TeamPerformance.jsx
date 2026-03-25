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

const TOTAL_KEYS = ['Planned', 'Unplanned'];

function RoundedBarShape({ x, y, width, height, fill, statusKey, dataEntry }) {
  if (!width || !height) return null;
  let isTop = true;
  const myIdx = TOTAL_KEYS.indexOf(statusKey);
  for (let i = myIdx + 1; i < TOTAL_KEYS.length; i++) {
    if ((dataEntry[TOTAL_KEYS[i]] || 0) > 0) { isTop = false; break; }
  }
  const r = isTop ? 6 : 0;
  return (
    <path
      d={`M${x},${y} h${width - r} ${r ? `a${r},${r} 0 0 1 ${r},${r}` : `h${r}`} v${height - 2 * r} ${r ? `a${r},${r} 0 0 1 ${-r},${r}` : `v${r}`} h${-(width - r)} z`}
      fill={fill}
    />
  );
}

function TotalOnTop({ x, y, width, height, index, statusKey, data }) {
  if (!data?.[index]) return null;
  const row = data[index];
  let topKey = null;
  for (let i = TOTAL_KEYS.length - 1; i >= 0; i--) {
    if ((row[TOTAL_KEYS[i]] || 0) > 0) { topKey = TOTAL_KEYS[i]; break; }
  }
  if (statusKey !== topKey) return null;
  const total = row.Total;
  if (!total) return null;
  return (
    <text x={x + width + 8} y={y + height / 2} fill="#475569" fontSize={11} fontWeight={700} dominantBaseline="central">
      {total}
    </text>
  );
}

function TotalChart({ data, height = 400 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 12, right: 44, left: 12, bottom: 12 }}
      >
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
        <YAxis dataKey="assignee" type="category" tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }} width={150} axisLine={false} tickLine={false} />
        <XAxis type="number" tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 500 }} allowDecimals={false} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 12, color: '#475569' }} iconType="circle" iconSize={8} />
        {TOTAL_KEYS.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={TYPE_COLORS[key]}
            barSize={32}
            shape={(props) => <RoundedBarShape {...props} statusKey={key} dataEntry={data[props.index]} />}
          >
            <LabelList dataKey={key} position="center" fill="#fff" fontSize={11} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
            <LabelList dataKey={key} content={(props) => <TotalOnTop {...props} statusKey={key} data={data} />} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function TeamPerformance({ data, slideRef }) {
  return (
    <SlideLayout title="Team Performance" subtitle="All Assignees — Planned vs Unplanned" slideRef={slideRef}>
      <div className="flex gap-4 h-full">
        {/* Left: Total */}
        <div className="card flex flex-col animate-slide-up animate-delay-1" style={{ padding: '16px 20px 12px', flex: 1.2 }}>
          <h2 className="font-semibold" style={{ fontSize: 15, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>Total by Assignee</h2>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>Planned + Unplanned</p>
          <div className="flex-1 min-h-0"><TotalChart data={data.teamTotal} height="100%" /></div>
        </div>

        {/* Middle: Planned */}
        <div className="card flex-1 flex flex-col animate-slide-up animate-delay-2" style={{ padding: '16px 20px 12px' }}>
          <h2 className="font-semibold" style={{ fontSize: 15, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>Planned by Assignee</h2>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>Story cards per member</p>
          <div className="flex-1 min-h-0"><StackedBarChart data={data.teamPlanned} height="100%" /></div>
        </div>

        {/* Right: Unplanned */}
        <div className="card flex-1 flex flex-col animate-slide-up animate-delay-3" style={{ padding: '16px 20px 12px' }}>
          <h2 className="font-semibold" style={{ fontSize: 15, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>Unplanned by Assignee</h2>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>Task cards per member</p>
          <div className="flex-1 min-h-0"><StackedBarChart data={data.teamUnplanned} height="100%" /></div>
        </div>
      </div>
    </SlideLayout>
  );
}
