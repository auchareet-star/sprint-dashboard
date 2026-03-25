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
import { EFFORT_COLORS } from '../utils/colors';

const fmt2 = (v) => (typeof v === 'number' ? v.toFixed(2) : v);

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: 13,
  fontWeight: 500,
  padding: '10px 14px',
};

export default function GroupedBarChart({
  data,
  dataKeyX = 'status',
  width = '100%',
  height = 400,
  layout = 'vertical',
}) {
  const isHorizontal = layout === 'horizontal';

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? 'horizontal' : 'vertical'}
        margin={{ top: 12, right: 40, left: isHorizontal ? 0 : 12, bottom: 12 }}
      >
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={!isHorizontal} vertical={isHorizontal} />

        {isHorizontal ? (
          <>
            <XAxis
              dataKey={dataKeyX}
              tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
          </>
        ) : (
          <>
            <YAxis
              dataKey={dataKeyX}
              type="category"
              tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }}
              width={150}
              axisLine={false}
              tickLine={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 500 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
          </>
        )}

        <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmt2(value)} />
        <Legend
          wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 12, color: '#475569' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="Estimate" fill={EFFORT_COLORS.Estimate} radius={isHorizontal ? [4, 4, 0, 0] : [0, 6, 6, 0]} barSize={28}>
          <LabelList dataKey="Estimate" position={isHorizontal ? 'top' : 'right'} fontSize={11} fontWeight={600} fill="#475569" formatter={fmt2} />
        </Bar>
        <Bar dataKey="Actual" fill={EFFORT_COLORS.Actual} radius={isHorizontal ? [4, 4, 0, 0] : [0, 6, 6, 0]} barSize={28}>
          <LabelList dataKey="Actual" position={isHorizontal ? 'top' : 'right'} fontSize={11} fontWeight={600} fill="#475569" formatter={fmt2} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
