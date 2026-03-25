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

export default function HorizontalStackedBar({ data, width = '100%', height = 400 }) {
  const dataWithTotal = data.map((row) => ({
    ...row,
    _total: (row.Planned || 0) + (row.Unplanned || 0),
  }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={dataWithTotal} layout="vertical" margin={{ top: 12, right: 48, left: 24, bottom: 12 }}>
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 500 }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          dataKey="status"
          type="category"
          width={150}
          tick={{ fontSize: 14, fill: '#334155', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 12, color: '#475569' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="Planned" stackId="a" fill={TYPE_COLORS.Planned} radius={[0, 0, 0, 0]} barSize={32}>
          <LabelList dataKey="Planned" position="center" fill="#fff" fontSize={12} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
        </Bar>
        <Bar dataKey="Unplanned" stackId="a" fill={TYPE_COLORS.Unplanned} radius={[0, 6, 6, 0]} barSize={32}>
          <LabelList dataKey="Unplanned" position="center" fill="#fff" fontSize={12} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
          <LabelList dataKey="_total" position="right" fill="#475569" fontSize={11} fontWeight={700} offset={8} formatter={(v) => (v > 0 ? v : '')} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
