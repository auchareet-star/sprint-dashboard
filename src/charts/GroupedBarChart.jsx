import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { EFFORT_COLORS } from '../utils/colors';
import { T, tooltipStyle, axisTickPrimary, axisTickSecondary, legendStyle } from '../utils/typography';

const fmt2 = (v) => (typeof v === 'number' ? v.toFixed(2) : v);

function WrapTick({ x, y, payload }) {
  const text = payload.value || '';
  let lines;
  if (text.length <= 16) {
    lines = [text];
  } else {
    const mid = Math.floor(text.length / 2);
    let best = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ' && (best === -1 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
    lines = best > 0 ? [text.slice(0, best), text.slice(best + 1)] : [text];
  }
  const lh = 15;
  const topY = y - ((lines.length - 1) * lh) / 2;
  return (
    <text x={x} textAnchor="end" fontSize={T.chartAxis} fontWeight={500} fill="#334155">
      {lines.map((l, i) => <tspan key={i} x={x} y={topY + i * lh}>{l}</tspan>)}
    </text>
  );
}

export default function GroupedBarChart({ data, dataKeyX = 'status', width = '100%', height = 400, layout = 'vertical' }) {
  const isHorizontal = layout === 'horizontal';
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data} layout={isHorizontal ? 'horizontal' : 'vertical'} margin={{ top: 12, right: 40, left: isHorizontal ? 0 : 12, bottom: 12 }}>
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={!isHorizontal} vertical={isHorizontal} />
        {isHorizontal ? (
          <>
            <XAxis dataKey={dataKeyX} tick={axisTickPrimary} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
            <YAxis tick={axisTickSecondary} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <YAxis dataKey={dataKeyX} type="category" tick={<WrapTick />} width={150} axisLine={false} tickLine={false} />
            <XAxis type="number" tick={axisTickSecondary} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmt2(value)} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="Estimate" fill={EFFORT_COLORS.Estimate} radius={isHorizontal ? [4, 4, 0, 0] : [0, 6, 6, 0]} barSize={28}>
          <LabelList dataKey="Estimate" position={isHorizontal ? 'top' : 'right'} fontSize={T.chartLabel} fontWeight={600} fill="#475569" formatter={fmt2} />
        </Bar>
        <Bar dataKey="Actual" fill={EFFORT_COLORS.Actual} radius={isHorizontal ? [4, 4, 0, 0] : [0, 6, 6, 0]} barSize={28}>
          <LabelList dataKey="Actual" position={isHorizontal ? 'top' : 'right'} fontSize={T.chartLabel} fontWeight={600} fill="#475569" formatter={fmt2} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
