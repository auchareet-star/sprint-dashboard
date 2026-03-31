import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { STATUS_ORDER, STATUS_COLORS } from '../utils/colors';
import { T, tooltipStyle, axisTickPrimary, axisTickSecondary, legendStyle } from '../utils/typography';
import { WrapTick, RoundedBarShape, TotalOnTop } from './chartUtils';

export default function StackedBarChart({ data, dataKeyX = 'assignee', width = '100%', height = 400, layout = 'vertical', disableAnimation = false }) {
  const activeStatuses = STATUS_ORDER.filter((s) => data.some((row) => row[s] > 0));
  const isHorizontal = layout === 'horizontal';
  const dataWithTotal = data.map((row) => {
    const total = activeStatuses.reduce((s, st) => s + (row[st] || 0), 0);
    return { ...row, _total: total };
  });

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={dataWithTotal} layout={isHorizontal ? 'horizontal' : 'vertical'}
        margin={{ top: 12, right: isHorizontal ? 24 : 44, left: isHorizontal ? 0 : 12, bottom: 12 }}>
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={!isHorizontal} vertical={isHorizontal} />
        {isHorizontal ? (
          <>
            <XAxis dataKey={dataKeyX} tick={axisTickPrimary} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
            <YAxis tick={axisTickSecondary} allowDecimals={false} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <YAxis dataKey={dataKeyX} type="category" tick={<WrapTick />} width={150} axisLine={false} tickLine={false} />
            <XAxis type="number" tick={axisTickSecondary} allowDecimals={false} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        {activeStatuses.map((status) => (
          <Bar key={status} dataKey={status} stackId="a" fill={STATUS_COLORS[status]} barSize={32}
            isAnimationActive={!disableAnimation}
            shape={(props) => <RoundedBarShape {...props} keys={activeStatuses} currentKey={status} dataEntry={dataWithTotal[props.index]} />}>
            <LabelList dataKey={status} position="center" fill="#fff" fontSize={T.chartLabel} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
            <LabelList dataKey={status}
              content={(props) => <TotalOnTop {...props} keys={activeStatuses} currentKey={status} data={dataWithTotal} />} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
