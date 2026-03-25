import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStatusColor } from '../utils/colors';

const RADIAN = Math.PI / 180;

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={13} fontWeight={700} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
    >
      {value}
    </text>
  );
};

export default function DonutChart({
  data,
  colorMap,
  width = '100%',
  height = 340,
  innerRadius = 80,
  outerRadius = 130,
  centerLabel = 'Total',
}) {
  const getColor = (name) => (colorMap ? colorMap[name] : getStatusColor(name)) || '#94A3B8';
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="46%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          labelLine={false}
          label={renderLabel}
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.name)} stroke="none" />
          ))}
        </Pie>
        {/* Center label rendered via customized to get correct coordinates */}
        <Pie
          data={[{ value: 1 }]}
          dataKey="value"
          cx="50%"
          cy="46%"
          innerRadius={0}
          outerRadius={0}
          fill="none"
          stroke="none"
          isAnimationActive={false}
        />
        <text
          x="50%"
          y="42%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={32}
          fontWeight={800}
          fill="#0F172A"
          style={{ letterSpacing: '-0.03em', pointerEvents: 'none' }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={500}
          fill="#94A3B8"
          style={{ pointerEvents: 'none' }}
        >
          {centerLabel}
        </text>
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            fontSize: 13,
            fontWeight: 500,
            padding: '10px 14px',
          }}
          formatter={(value, name) => [`${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, name]}
        />
        <Legend
          wrapperStyle={{ fontSize: 13, fontWeight: 500, color: '#475569' }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
