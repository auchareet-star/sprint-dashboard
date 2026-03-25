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

const KEYS = ['Planned', 'Unplanned'];

function RoundedBarShape({ x, y, width, height, fill, statusKey, dataEntry }) {
  if (!width || !height) return null;
  let isTop = true;
  const myIdx = KEYS.indexOf(statusKey);
  for (let i = myIdx + 1; i < KEYS.length; i++) {
    if ((dataEntry[KEYS[i]] || 0) > 0) { isTop = false; break; }
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
  for (let i = KEYS.length - 1; i >= 0; i--) {
    if ((row[KEYS[i]] || 0) > 0) { topKey = KEYS[i]; break; }
  }
  if (statusKey !== topKey) return null;
  const total = row._total;
  if (!total) return null;
  return (
    <text x={x + width + 8} y={y + height / 2} fill="#475569" fontSize={11} fontWeight={700} dominantBaseline="central">
      {total}
    </text>
  );
}

export default function HorizontalStackedBar({ data, width = '100%', height = 400 }) {
  const dataWithTotal = data.map((row) => ({
    ...row,
    _total: (row.Planned || 0) + (row.Unplanned || 0),
  }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={dataWithTotal} layout="vertical" margin={{ top: 12, right: 48, left: 24, bottom: 12 }}>
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 500 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
        <YAxis dataKey="status" type="category" width={150} tick={{ fontSize: 14, fill: '#334155', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 12, color: '#475569' }} iconType="circle" iconSize={8} />
        {KEYS.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={TYPE_COLORS[key]}
            barSize={32}
            shape={(props) => (
              <RoundedBarShape {...props} statusKey={key} dataEntry={dataWithTotal[props.index]} />
            )}
          >
            <LabelList dataKey={key} position="center" fill="#fff" fontSize={12} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
            <LabelList dataKey={key} content={(props) => <TotalOnTop {...props} statusKey={key} data={dataWithTotal} />} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
