import { useMemo } from 'react';
import { T, tooltipStyle } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';
import {
  Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, LabelList,
  Line, ComposedChart, LineChart,
} from 'recharts';
import { RoundedBarShape, TotalOnTop } from '../charts/chartUtils';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ISSUE_TYPE_COLORS = {
  Bug:         '#F43F5E',
  Task:        '#6366F1',
  Story:       '#1E3A5F',
  Improvement: '#0D9488',
  Request:     '#D97706',
  'Sub-task':  '#94A3B8',
  Sub_task:    '#94A3B8',
};

function parseDate(str) {
  if (!str) return null;
  const p = str.split('/');
  if (p.length === 3) return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export default function MATimeline({ data, slideRef, isExporting = false }) {
  const issues = data.maIssues || [];

  const { monthlyData, typeKeys, peakMonth, totalWithDate, avgPerMonth, weeklyTrend, weeklyTypeKeys } = useMemo(() => {
    const typeSet = new Set();
    const monthMap = {};
    const weekMap = {};
    const weekTypeSet = new Set();

    issues.forEach((i) => {
      const d = parseDate(i.created);
      if (!d) return;
      const t = i.issueType || 'Unknown';
      typeSet.add(t);

      // Monthly
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[mKey]) monthMap[mKey] = { key: mKey, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, total: 0 };
      monthMap[mKey].total++;
      monthMap[mKey][t] = (monthMap[mKey][t] || 0) + 1;

      // Weekly
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
      const wKey = monday.toISOString().slice(0, 10);
      if (!weekMap[wKey]) weekMap[wKey] = { key: wKey, label: `${monday.getDate()} ${MONTHS[monday.getMonth()]}` };
      weekTypeSet.add(t);
      weekMap[wKey][t] = (weekMap[wKey][t] || 0) + 1;
    });

    const sortTypes = (set) => [...set].sort((a, b) => {
      const order = ['Bug', 'Task', 'Story', 'Improvement', 'Request', 'Sub-task'];
      const ai = order.indexOf(a), bi = order.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    const typeKeys = sortTypes(typeSet);
    const weeklyTypeKeys = sortTypes(weekTypeSet);

    const monthlyData = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
    monthlyData.forEach((m) => typeKeys.forEach((t) => { if (!m[t]) m[t] = 0; }));

    const weeklyTrend = Object.values(weekMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((row) => { weeklyTypeKeys.forEach((t) => { if (!row[t]) row[t] = 0; }); return row; });

    const totalWithDate = monthlyData.reduce((s, m) => s + m.total, 0);
    const peakMonth = monthlyData.reduce((best, m) => m.total > (best?.total || 0) ? m : best, null);
    const avgPerMonth = monthlyData.length > 0 ? (totalWithDate / monthlyData.length).toFixed(1) : 0;

    return { monthlyData, typeKeys, peakMonth, totalWithDate, avgPerMonth, weeklyTrend, weeklyTypeKeys };
  }, [issues]);

  return (
    <SlideLayout title="MA Issues — Monthly Trend" slideRef={slideRef}>
      <div className="flex flex-col h-full gap-4 animate-slide-up animate-delay-1">

        {/* KPI row */}
        <div className="flex gap-4 flex-none">
          {[
            { label: 'Total Issues', value: totalWithDate, color: '#F43F5E' },
            { label: 'Peak Month', value: peakMonth ? `${peakMonth.label} (${peakMonth.total})` : '—', color: '#D97706' },
            { label: 'Avg / Month', value: avgPerMonth, color: '#6366F1' },
            { label: 'Months Tracked', value: monthlyData.length, color: '#0D9488' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card flex-1 flex items-center gap-4" style={{ padding: '12px 20px' }}>
              <div style={{ width: 4, height: 40, borderRadius: 2, background: color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: T.label, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                <div style={{ fontSize: T.metricValue, fontWeight: 800, color, lineHeight: 1.2, marginTop: 2 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly trend */}
        {weeklyTrend.length > 0 && (
          <div className="card flex-none" style={{ padding: '10px 20px 8px', height: 210 }}>
            <div className="flex items-baseline gap-3" style={{ marginBottom: 2 }}>
              <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                Created Over Time
              </h2>
              <span style={{ fontSize: T.body, color: '#94A3B8', fontWeight: 500 }}>Cards created per week by Issue Type</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend} margin={{ top: 14, right: 20, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickFormatter={(val) => { const parts = val.split(' '); return parseInt(parts[0]) <= 7 ? parts[1] : ''; }}
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  height={28}
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Week of ${l}`} />
                <Legend verticalAlign="top" align="left" wrapperStyle={{ fontSize: T.chartLegend, fontWeight: 600, paddingBottom: 4, color: '#475569', left: 14 }} iconType="circle" iconSize={8} />
                {weeklyTypeKeys.map((t) => (
                  <Line key={t} type="monotone" dataKey={t}
                    stroke={ISSUE_TYPE_COLORS[t] || '#94A3B8'}
                    strokeWidth={2}
                    dot={{ fill: ISSUE_TYPE_COLORS[t] || '#94A3B8', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={!isExporting}
                  >
                    <LabelList dataKey={t} position="top" fontSize={9} fontWeight={700} fill={ISSUE_TYPE_COLORS[t] || '#94A3B8'} formatter={(v) => (v > 0 ? v : '')} />
                  </Line>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Main chart */}
        <div className="card flex-1 min-h-0" style={{ padding: '16px 20px 10px' }}>
          <div className="flex items-baseline gap-3" style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: T.section, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Cards Created by Month
            </h2>
            <span style={{ fontSize: T.body, color: '#94A3B8', fontWeight: 500 }}>
              {typeKeys.length > 0 ? 'stacked by Issue Type' : 'all issues'}
            </span>
          </div>

          {monthlyData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#94A3B8', fontSize: T.body }}>
              No date data available
            </div>
          ) : typeKeys.length > 0 ? (
            /* Stacked bar by issue type */
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={monthlyData} margin={{ top: 16, right: 24, left: -8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: T.chartAxis, fill: '#334155', fontWeight: 500 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="bar"
                  allowDecimals={false}
                  tick={{ fontSize: T.chartAxis, fill: '#94A3B8', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis yAxisId="line" hide orientation="right" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, name) => [v, name === 'total' ? 'Total' : name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: T.chartLegend, fontWeight: 600, paddingTop: 8, color: '#475569' }}
                  iconType="circle" iconSize={8}
                />
                {typeKeys.map((t, ti, arr) => (
                  <Bar
                    key={t} yAxisId="bar" dataKey={t} stackId="a"
                    fill={ISSUE_TYPE_COLORS[t] || '#94A3B8'}
                    barSize={36} isAnimationActive={!isExporting}
                    shape={(props) => <RoundedBarShape {...props} keys={arr} currentKey={t} dataEntry={monthlyData[props.index] || {}} />}
                  >
                    <LabelList dataKey={t} position="center" fill="#fff" fontSize={T.chartLabel} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
                    <LabelList dataKey={t} content={(props) => <TotalOnTop {...props} keys={arr} currentKey={t} data={monthlyData} />} />
                  </Bar>
                ))}
                <Line
                  yAxisId="line" type="monotone" dataKey="total"
                  stroke="#1E3A5F" strokeWidth={2} strokeDasharray="4 3"
                  dot={{ fill: '#1E3A5F', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={!isExporting}
                  legendType="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            /* Simple line if no type data */
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={monthlyData} margin={{ top: 16, right: 24, left: -8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: T.chartAxis, fill: '#334155', fontWeight: 500 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: T.chartAxis, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Cards']} />
                <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={3}
                  dot={{ fill: '#6366F1', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={!isExporting}
                >
                  <LabelList dataKey="total" position="top" fontSize={T.chartLabel} fontWeight={700} fill="#334155" />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </SlideLayout>
  );
}
