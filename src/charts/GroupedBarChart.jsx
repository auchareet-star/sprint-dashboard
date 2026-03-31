import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { EFFORT_COLORS } from '../utils/colors';
import { T, tooltipStyle, axisTickPrimary, axisTickSecondary, legendStyle } from '../utils/typography';
import { WrapTick } from './chartUtils';

const fmt2 = (v) => (typeof v === 'number' ? v.toFixed(2) : v);

export default function GroupedBarChart({ data, dataKeyX = 'status', width = '100%', height = 400, layout = 'vertical', disableAnimation = false }) {
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
        <Bar dataKey="Estimate" fill={EFFORT_COLORS.Estimate} radius={isHorizontal ? [4, 4, 0, 0] : [0, 6, 6, 0]} barSize={28} isAnimationActive={!disableAnimation}>
          <LabelList dataKey="Estimate" position={isHorizontal ? 'top' : 'right'} fontSize={T.chartLabel} fontWeight={600} fill="#475569" formatter={fmt2} />
        </Bar>
        <Bar dataKey="Actual" fill={EFFORT_COLORS.Actual} radius={isHorizontal ? [4, 4, 0, 0] : [0, 6, 6, 0]} barSize={28} isAnimationActive={!disableAnimation}>
          <LabelList dataKey="Actual" position={isHorizontal ? 'top' : 'right'} fontSize={T.chartLabel} fontWeight={600} fill="#475569" formatter={fmt2} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
