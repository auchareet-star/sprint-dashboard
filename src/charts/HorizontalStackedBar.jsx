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
import { STATUS_ORDER, STATUS_COLORS } from '../utils/colors';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: 13,
  fontWeight: 500,
  padding: '10px 14px',
};

function RoundedBarShape({ x, y, width, height, fill, statusKey, activeStatuses, dataEntry }) {
  if (!width || !height) return null;
  let isTop = true;
  const myIdx = activeStatuses.indexOf(statusKey);
  for (let i = myIdx + 1; i < activeStatuses.length; i++) {
    if ((dataEntry[activeStatuses[i]] || 0) > 0) { isTop = false; break; }
  }
  const r = isTop ? 6 : 0;
  return (
    <path
      d={`M${x},${y} h${width - r} ${r ? `a${r},${r} 0 0 1 ${r},${r}` : `h${r}`} v${height - 2 * r} ${r ? `a${r},${r} 0 0 1 ${-r},${r}` : `v${r}`} h${-(width - r)} z`}
      fill={fill}
    />
  );
}

function TotalOnTop({ x, y, width, height, index, statusKey, activeStatuses, data }) {
  if (!data?.[index]) return null;
  const row = data[index];
  let topStatus = null;
  for (let i = activeStatuses.length - 1; i >= 0; i--) {
    if ((row[activeStatuses[i]] || 0) > 0) { topStatus = activeStatuses[i]; break; }
  }
  if (statusKey !== topStatus) return null;
  const total = row._total;
  if (!total) return null;
  return (
    <text x={x + width + 8} y={y + height / 2} fill="#475569" fontSize={12} fontWeight={700} dominantBaseline="central">
      {total}
    </text>
  );
}

export default function HorizontalStackedBar({ data, width = '100%', height = 400 }) {
  const activeStatuses = STATUS_ORDER.filter((s) =>
    data.some((row) => row[s] > 0)
  );

  const dataWithTotal = data.map((row) => {
    const total = activeStatuses.reduce((s, st) => s + (row[st] || 0), 0);
    return { ...row, _total: total };
  });

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={dataWithTotal} layout="vertical" margin={{ top: 12, right: 48, left: 24, bottom: 12 }}>
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 500 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="type" type="category" width={110} tick={{ fontSize: 15, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 12, color: '#475569' }} iconType="circle" iconSize={8} />
        {activeStatuses.map((status) => (
          <Bar
            key={status}
            dataKey={status}
            stackId="a"
            fill={STATUS_COLORS[status]}
            barSize={40}
            shape={(props) => (
              <RoundedBarShape {...props} statusKey={status} activeStatuses={activeStatuses} dataEntry={dataWithTotal[props.index]} />
            )}
          >
            <LabelList dataKey={status} position="center" fill="#fff" fontSize={12} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
            <LabelList
              dataKey={status}
              content={(props) => <TotalOnTop {...props} statusKey={status} activeStatuses={activeStatuses} data={dataWithTotal} />}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
