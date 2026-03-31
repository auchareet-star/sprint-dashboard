import { T, tooltipStyle, axisTickSecondary, legendStyle } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';
import DonutChart from '../charts/DonutChart';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { STATUS_ORDER, STATUS_COLORS } from '../utils/colors';

export default function EffortOverview({ data, slideRef, isExporting = false }) {
  const variance = data.totalActual - data.totalEstimate;
  const isOver = variance > 0;

  return (
    <SlideLayout title="Effort Overview" subtitle="Estimate vs Actual by Status" slideRef={slideRef}>
      <div className="flex flex-col h-full gap-4">
        {/* Summary Row — top */}
        <div className="flex gap-3 flex-none animate-slide-up animate-delay-1">
          <SummaryPill label="Total Estimate" value={data.totalEstimate.toFixed(2)} unit="man-days" color="#1E3A5F" />
          <SummaryPill label="Total Actual" value={data.totalActual.toFixed(2)} unit="man-days" color="#F59E0B" />
          <SummaryPill
            label="Variance"
            value={`${isOver ? '+' : ''}${variance.toFixed(2)}`}
            unit={isOver ? 'overrun' : 'under'}
            color={isOver ? '#F43F5E' : '#0D9488'}
            highlight={isOver}
          />
        </div>

        {/* Main row */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left: Bar Chart */}
          <div
            className="card flex-1 flex flex-col animate-slide-up animate-delay-2"
            style={{ padding: '16px 20px 12px' }}
          >
            <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}>
              Estimate vs Actual
            </h2>
            <p style={{ fontSize: T.desc, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>
              Man-days comparison by work status
            </p>
            <div className="flex-1 min-h-0">
              <EffortByStatusChart data={data.effortByStatus} disableAnimation={isExporting} />
            </div>
          </div>

          {/* Right: Donut */}
          <div
            className="card flex flex-col animate-slide-up animate-delay-3"
            style={{ width: 420, padding: '16px 20px 12px' }}
          >
            <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}>
              Status Distribution
            </h2>
            <p style={{ fontSize: T.desc, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>
              Card count by current status
            </p>
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <DonutChart data={data.statusDistribution} height="100%" innerRadius={80} outerRadius={150} centerLabel="Cards" disableAnimation={isExporting} />
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function SummaryPill({ label, value, unit, color, highlight = false }) {
  return (
    <div
      className="card flex-1 flex items-center justify-between"
      style={{
        padding: '12px 20px',
        borderLeft: `3px solid ${color}`,
        background: highlight ? '#FFF7F7' : '#FFFFFF',
      }}
    >
      <div>
        <div style={{ fontSize: T.label, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</div>
        {unit && <div style={{ fontSize: T.caption, color: '#CBD5E1', fontWeight: 500 }}>{unit}</div>}
      </div>
      <span className="font-extrabold" style={{ fontSize: T.metricValue, color, letterSpacing: '-0.02em' }}>
        {value}
      </span>
    </div>
  );
}

const fmt2 = (v) => (typeof v === 'number' ? v.toFixed(2) : v);

function TotalOnTopVertical({ x, y, width, height, index, statusKey, activeStatuses, data }) {
  if (!data?.[index]) return null;
  const row = data[index];
  // Only render on the FIRST status in the list (Done = bottom of stack, always has largest segment)
  if (statusKey !== activeStatuses[0]) return null;
  const total = activeStatuses.reduce((s, st) => s + (row[st] || 0), 0);
  if (!total) return null;
  // y + height = bottom of this segment (axis baseline)
  // Total bar height proportional: this segment's value / total * full height
  // Full stack visual height = height * (total / row[statusKey])
  const thisVal = row[statusKey] || 1;
  const fullStackHeight = height * (total / thisVal);
  const topY = y + height - fullStackHeight;
  return (
    <text x={x + width / 2} y={topY - 12} fill="#475569" fontSize={18} fontWeight={700} textAnchor="middle">
      {fmt2(total)}
    </text>
  );
}

function RoundedVerticalBar({ x, y, width, height, fill, statusKey, activeStatuses, dataEntry }) {
  if (!width || !height) return null;
  let isTop = true;
  const myIdx = activeStatuses.indexOf(statusKey);
  for (let i = myIdx + 1; i < activeStatuses.length; i++) {
    if ((dataEntry[activeStatuses[i]] || 0) > 0) { isTop = false; break; }
  }
  const r = isTop ? 6 : 0;
  // Vertical bar: round top-left and top-right
  return (
    <path d={`M${x},${y + (r ? r : 0)} ${r ? `a${r},${r} 0 0 1 ${r},${-r}` : `v0`} h${width - 2 * r} ${r ? `a${r},${r} 0 0 1 ${r},${r}` : `h0`} v${height - r} h${-width} z`} fill={fill} />
  );
}

function EffortByStatusChart({ data, disableAnimation = false }) {
  const activeStatuses = STATUS_ORDER.filter((s) => data.some((row) => (row[s] || 0) > 0));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 56, right: 20, left: 20, bottom: 12 }}>
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="type" tick={{ fontSize: T.section, fill: '#334155', fontWeight: 600 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
        <YAxis tick={axisTickSecondary} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmt2(value)} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        {activeStatuses.map((status) => (
          <Bar key={status} dataKey={status} stackId="a" fill={STATUS_COLORS[status]} barSize={120}
            isAnimationActive={!disableAnimation}
            shape={(props) => <RoundedVerticalBar {...props} statusKey={status} activeStatuses={activeStatuses} dataEntry={data[props.index] || {}} />}
          >
            <LabelList dataKey={status} position="center" fill="#fff" fontSize={T.chartLabel} fontWeight={700}
              formatter={(v) => (v > 0 ? fmt2(v) : '')} />
            <LabelList dataKey={status}
              content={(props) => <TotalOnTopVertical {...props} statusKey={status} activeStatuses={activeStatuses} data={data} />} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
