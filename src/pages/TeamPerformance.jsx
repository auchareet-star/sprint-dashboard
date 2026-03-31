import { T, tooltipStyle, axisTickSecondary, legendStyle } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';
import StackedBarChart from '../charts/StackedBarChart';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { TYPE_COLORS } from '../utils/colors';
import { RoundedBarShape, TotalOnTop } from '../charts/chartUtils';

const TOTAL_KEYS = ['Planned', 'Unplanned'];

function ClickableTick({ x, y, payload, goToAssignee }) {
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
    <text x={x} textAnchor="end" fontSize={T.chartAxis} fontWeight={500} fill="#1E3A5F"
      style={{ cursor: goToAssignee ? 'pointer' : 'default' }}
      onClick={() => goToAssignee?.(payload.value)}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} y={topY + i * lh}>{line}</tspan>
      ))}
    </text>
  );
}

function TotalChart({ data, height = 400, goToAssignee, disableAnimation = false }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 12, right: 44, left: 12, bottom: 12 }}>
        <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
        <YAxis dataKey="assignee" type="category" tick={goToAssignee ? <ClickableTick goToAssignee={goToAssignee} /> : { fontSize: T.chartAxis, fill: '#334155', fontWeight: 500 }} width={150} axisLine={false} tickLine={false} />
        <XAxis type="number" tick={axisTickSecondary} allowDecimals={false} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        {TOTAL_KEYS.map((key) => (
          <Bar key={key} dataKey={key} stackId="a" fill={TYPE_COLORS[key]} barSize={32}
            isAnimationActive={!disableAnimation}
            shape={(props) => <RoundedBarShape {...props} keys={TOTAL_KEYS} currentKey={key} dataEntry={data[props.index]} />}>
            <LabelList dataKey={key} position="center" fill="#fff" fontSize={T.chartLabel} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
            <LabelList dataKey={key} content={(props) => <TotalOnTop {...props} keys={TOTAL_KEYS} currentKey={key} data={data} totalKey="Total" />} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function TeamPerformance({ data, slideRef, goToAssignee, isExporting = false }) {
  return (
    <SlideLayout title="Team Performance" subtitle="All Assignees — Planned vs Unplanned" slideRef={slideRef}>
      <div className="flex gap-4 h-full">
        <div className="card flex flex-col animate-slide-up animate-delay-1" style={{ padding: '16px 20px 12px', flex: 1.1 }}>
          <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>Total by Assignee</h2>
          <p style={{ fontSize: T.desc, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>Planned + Unplanned</p>
          <div className="flex-1 min-h-0"><TotalChart data={data.teamTotal} height="100%" goToAssignee={goToAssignee} disableAnimation={isExporting} /></div>
        </div>
        <div className="card flex-1 flex flex-col animate-slide-up animate-delay-2" style={{ padding: '16px 20px 12px' }}>
          <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>Planned by Assignee</h2>
          <p style={{ fontSize: T.desc, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>Story cards per member</p>
          <div className="flex-1 min-h-0"><StackedBarChart data={data.teamPlanned} height="100%" disableAnimation={isExporting} /></div>
        </div>
        <div className="card flex-1 flex flex-col animate-slide-up animate-delay-3" style={{ padding: '16px 20px 12px' }}>
          <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>Unplanned by Assignee</h2>
          <p style={{ fontSize: T.desc, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>Task cards per member</p>
          <div className="flex-1 min-h-0"><StackedBarChart data={data.teamUnplanned} height="100%" disableAnimation={isExporting} /></div>
        </div>
      </div>
    </SlideLayout>
  );
}
