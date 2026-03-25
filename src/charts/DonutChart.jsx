import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStatusColor } from '../utils/colors';
import { T, tooltipStyle } from '../utils/typography';

const RADIAN = Math.PI / 180;

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={T.body} fontWeight={700} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
      {value}
    </text>
  );
};

export default function DonutChart({ data, colorMap, width = '100%', height = 340, innerRadius = 80, outerRadius = 130, centerLabel = 'Total' }) {
  const getColor = (name) => (colorMap ? colorMap[name] : getStatusColor(name)) || '#94A3B8';
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="46%"
          innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={3} labelLine={false} label={renderLabel} strokeWidth={0}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.name)} stroke="none" />
          ))}
        </Pie>
        <text x="50%" y="42%" textAnchor="middle" dominantBaseline="central"
          fontSize={T.pageTitle} fontWeight={800} fill="#0F172A" style={{ letterSpacing: '-0.03em', pointerEvents: 'none' }}>
          {total}
        </text>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          fontSize={T.body} fontWeight={500} fill="#94A3B8" style={{ pointerEvents: 'none' }}>
          {centerLabel}
        </text>
        <Tooltip contentStyle={tooltipStyle}
          formatter={(value, name) => [`${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, name]} />
        <Legend wrapperStyle={{ fontSize: T.body, fontWeight: 500, color: '#475569' }} iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}
