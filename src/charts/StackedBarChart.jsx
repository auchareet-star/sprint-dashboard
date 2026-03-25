import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { STATUS_ORDER, STATUS_COLORS } from '../utils/colors';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: 13,
  fontWeight: 500,
  padding: '10px 14px',
};

export default function StackedBarChart({
  data,
  dataKeyX = 'assignee',
  width = '100%',
  height = 400,
  layout = 'vertical',
}) {
  const activeStatuses = STATUS_ORDER.filter((s) =>
    data.some((row) => row[s] > 0)
  );

  const isHorizontal = layout === 'horizontal';

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? 'horizontal' : 'vertical'}
        margin={{ top: 12, right: 24, left: isHorizontal ? 0 : 12, bottom: 12 }}
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
              allowDecimals={false}
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
              allowDecimals={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
          </>
        )}

        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 12, color: '#475569' }}
          iconType="circle"
          iconSize={8}
        />
        {activeStatuses.map((status, i) => (
          <Bar
            key={status}
            dataKey={status}
            stackId="a"
            fill={STATUS_COLORS[status]}
            radius={
              i === activeStatuses.length - 1
                ? isHorizontal ? [4, 4, 0, 0] : [0, 6, 6, 0]
                : [0, 0, 0, 0]
            }
            barSize={32}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
