import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { STATUS_ORDER, STATUS_COLORS } from '../utils/colors';
import { T, tooltipStyle, axisTickSecondary, legendStyle } from '../utils/typography';
import { RoundedBarShape, TotalOnTop } from './chartUtils';

export default function HorizontalStackedBar({ data, width = '100%', height = 400, disableAnimation = false }) {
  const activeStatuses = STATUS_ORDER.filter((s) => data.some((row) => row[s] > 0));
  const dataWithTotal = data.map((row) => {
    const total = activeStatuses.reduce((s, st) => s + (row[st] || 0), 0);
    return { ...row, _total: total };
  });

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={dataWithTotal} layout="vertical" margin={{ top: 12, right: 48, left: 24, bottom: 12 }}>
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
        <XAxis type="number" tick={axisTickSecondary} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="type" type="category" width={110} tick={{ fontSize: T.subtitle, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        {activeStatuses.map((status) => (
          <Bar key={status} dataKey={status} stackId="a" fill={STATUS_COLORS[status]} barSize={64}
            isAnimationActive={!disableAnimation}
            shape={(props) => <RoundedBarShape {...props} keys={activeStatuses} currentKey={status} dataEntry={dataWithTotal[props.index]} />}>
            <LabelList dataKey={status} position="center" fill="#fff" fontSize={T.chartBarLabel} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
            <LabelList dataKey={status}
              content={(props) => <TotalOnTop {...props} keys={activeStatuses} currentKey={status} data={dataWithTotal} />} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
