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
import { T, tooltipStyle, axisTickPrimary, axisTickSecondary, legendStyle } from '../utils/typography';

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

/**
 * Custom bar shape: rounds the right edge only if this segment is the topmost for that row.
 */
function RoundedBarShape({ x, y, width, height, fill, statusKey, activeStatuses, dataEntry }) {
  if (!width || !height) return null;
  // Check if this is the topmost segment
  let isTop = true;
  const myIdx = activeStatuses.indexOf(statusKey);
  for (let i = myIdx + 1; i < activeStatuses.length; i++) {
    if ((dataEntry[activeStatuses[i]] || 0) > 0) {
      isTop = false;
      break;
    }
  }
  const r = isTop ? 6 : 0;
  return (
    <path
      d={`M${x},${y} h${width - r} ${r ? `a${r},${r} 0 0 1 ${r},${r}` : `h${r}`} v${height - 2 * r} ${r ? `a${r},${r} 0 0 1 ${-r},${r}` : `v${r}`} h${-(width - r)} z`}
      fill={fill}
    />
  );
}

/**
 * Shows total label at the right edge of the full stacked bar.
 * Only renders on the topmost visible segment.
 */
function TotalOnTop({ x, y, width, height, index, statusKey, activeStatuses, data }) {
  if (!data?.[index]) return null;
  const row = data[index];

  // Find topmost status with value > 0
  let topStatus = null;
  for (let i = activeStatuses.length - 1; i >= 0; i--) {
    if ((row[activeStatuses[i]] || 0) > 0) {
      topStatus = activeStatuses[i];
      break;
    }
  }
  if (statusKey !== topStatus) return null;

  const total = row._total;
  if (!total) return null;

  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="#475569"
      fontSize={T.chartLabel}
      fontWeight={700}
      dominantBaseline="central"
    >
      {total}
    </text>
  );
}

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

  const dataWithTotal = data.map((row) => {
    const total = activeStatuses.reduce((s, st) => s + (row[st] || 0), 0);
    return { ...row, _total: total };
  });

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={dataWithTotal}
        layout={isHorizontal ? 'horizontal' : 'vertical'}
        margin={{ top: 12, right: isHorizontal ? 24 : 44, left: isHorizontal ? 0 : 12, bottom: 12 }}
      >
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
          <Bar
            key={status}
            dataKey={status}
            stackId="a"
            fill={STATUS_COLORS[status]}
            barSize={32}
            shape={(props) => (
              <RoundedBarShape
                {...props}
                statusKey={status}
                activeStatuses={activeStatuses}
                dataEntry={dataWithTotal[props.index]}
              />
            )}
          >
            <LabelList
              dataKey={status}
              position="center"
              fill="#fff"
              fontSize={T.chartLabel}
              fontWeight={700}
              formatter={(v) => (v > 0 ? v : '')}
            />
            <LabelList
              dataKey={status}
              content={(props) => (
                <TotalOnTop
                  {...props}
                  statusKey={status}
                  activeStatuses={activeStatuses}
                  data={dataWithTotal}
                />
              )}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
