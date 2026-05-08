import { useMemo } from 'react';
import { T, tooltipStyle } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';
import DonutChart from '../charts/DonutChart';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { WrapTick, RoundedBarShape, TotalOnTop } from '../charts/chartUtils';
import { STATUS_COLORS, STATUS_ORDER } from '../utils/colors';

const BUG_PRIORITY_COLORS = {
  Highest: '#991B1B',
  High:    '#F43F5E',
  Medium:  '#F59E0B',
  Low:     '#6366F1',
  Lowest:  '#94A3B8',
};

const PRIO_KEYS = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const BUG_RESOLVED = ['Done', 'Cancel'];

const ISSUE_TYPE_COLORS = {
  Bug:         '#F43F5E',
  Task:        '#6366F1',
  Story:       '#1E3A5F',
  Improvement: '#0D9488',
  Request:     '#D97706',
  Sub_task:    '#94A3B8',
  'Sub-task':  '#94A3B8',
};

export default function MAAnalysis({ data, slideRef, isExporting = false }) {
  const issues = data.maIssues || [];

  const stats = useMemo(() => {
    const total = issues.length;
    const done = issues.filter((i) => BUG_RESOLVED.includes(i.status)).length;
    const open = total - done;
    const resolutionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    // Status x Priority
    const statusByPriority = STATUS_ORDER
      .map((status) => {
        const row = { status };
        const statusIssues = issues.filter((i) => i.status === status);
        PRIO_KEYS.forEach((p) => { row[p] = statusIssues.filter((i) => i.priority === p).length; });
        row._total = statusIssues.length;
        return row;
      })
      .filter((r) => r._total > 0);

    // Priority distribution
    const prioCounts = {};
    issues.forEach((i) => { const p = i.priority || 'Unknown'; prioCounts[p] = (prioCounts[p] || 0) + 1; });
    const priorityDist = Object.entries(prioCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);


    // Issue Type distribution
    const typeCounts = {};
    issues.forEach((i) => { const t = i.issueType || 'Unknown'; typeCounts[t] = (typeCounts[t] || 0) + 1; });
    const issueTypeDist = Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // By Assignee with status breakdown
    const assigneeCounts = {};
    issues.forEach((i) => { const a = i.assignee || 'Unassigned'; assigneeCounts[a] = (assigneeCounts[a] || 0) + 1; });
    const byAssignee = Object.entries(assigneeCounts)
      .map(([assignee, count]) => {
        const row = { assignee, count };
        STATUS_ORDER.forEach((s) => {
          row[s] = issues.filter((i) => (i.assignee || 'Unassigned') === assignee && i.status === s).length;
        });
        return row;
      })
      .sort((a, b) => b.count - a.count);

    return { total, done, open, resolutionRate, statusByPriority, priorityDist, issueTypeDist, byAssignee };
  }, [issues]);

  return (
    <SlideLayout title="MA Analysis" subtitle="Issue & Bug Tracking — MA System" slideRef={slideRef}>
      <div className="flex flex-col gap-4 h-full">
        {/* KPI row */}
        <div className="flex gap-4 flex-none animate-slide-up animate-delay-1">
          <div className="card flex items-center gap-5" style={{ padding: '14px 24px', flex: 2 }}>
            <div className="font-extrabold" style={{ fontSize: T.kpiBig, color: '#F43F5E', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {stats.total}
            </div>
            <div>
              <div style={{ fontSize: T.section, color: '#0F172A', fontWeight: 700 }}>Total Issues in MA</div>
              <div className="flex gap-6 mt-2">
                <span style={{ fontSize: T.bodyLg, color: '#1E3A5F', fontWeight: 700 }}>
                  {stats.done} <span style={{ fontSize: T.desc, color: '#94A3B8', fontWeight: 500 }}>Resolved</span>
                </span>
                <span style={{ fontSize: T.bodyLg, color: '#F43F5E', fontWeight: 700 }}>
                  {stats.open} <span style={{ fontSize: T.desc, color: '#94A3B8', fontWeight: 500 }}>Open</span>
                </span>
              </div>
            </div>
          </div>

          <div className="card flex items-center gap-5" style={{ padding: '14px 24px', flex: 1, borderLeft: '3px solid #1E3A5F' }}>
            <div>
              <div style={{ fontSize: T.label, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Resolution Rate</div>
              <div className="font-extrabold" style={{ fontSize: T.metricXl, color: '#1E3A5F', lineHeight: 1.1, marginTop: 2, letterSpacing: '-0.03em' }}>
                {stats.resolutionRate}%
              </div>
            </div>
            <div className="flex-1">
              <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 4 }}>
                <div style={{ width: `${stats.resolutionRate}%`, height: '100%', background: 'linear-gradient(90deg, #1E3A5F, #6366F1)', borderRadius: 4, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Status x Priority */}
          <div className="card flex-1 flex flex-col animate-slide-up animate-delay-2" style={{ padding: '16px 20px 10px' }}>
            <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>
              Status x Priority
            </h2>
            <p style={{ fontSize: T.body, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>Priority breakdown per status</p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.statusByPriority} layout="vertical" margin={{ top: 8, right: 36, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
                  <YAxis dataKey="status" type="category" tick={<WrapTick />} width={130} axisLine={false} tickLine={false} />
                  <XAxis type="number" tick={{ fontSize: T.chartAxis, fill: '#94A3B8', fontWeight: 500 }} allowDecimals={false} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: T.chartLegend, fontWeight: 600, paddingTop: 8, color: '#475569' }} iconType="circle" iconSize={8} />
                  {PRIO_KEYS.map((pk) => (
                    <Bar key={pk} dataKey={pk} stackId="a" fill={BUG_PRIORITY_COLORS[pk] || '#94A3B8'} barSize={32}
                      isAnimationActive={!isExporting}
                      shape={(props) => <RoundedBarShape {...props} keys={PRIO_KEYS} currentKey={pk} dataEntry={(stats.statusByPriority)[props.index] || {}} />}
                    >
                      <LabelList dataKey={pk} position="center" fill="#fff" fontSize={T.chartLabel} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
                      <LabelList dataKey={pk} content={(props) => <TotalOnTop {...props} keys={PRIO_KEYS} currentKey={pk} data={stats.statusByPriority} />} />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* By Priority */}
          <div className="card flex-1 flex flex-col animate-slide-up animate-delay-3" style={{ padding: '16px 20px 10px' }}>
            <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>
              By Priority
            </h2>
            <p style={{ fontSize: T.body, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>Severity distribution</p>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <DonutChart
                data={stats.priorityDist}
                colorMap={BUG_PRIORITY_COLORS}
                height="100%"
                innerRadius={65}
                outerRadius={115}
                centerLabel="Issues"
                disableAnimation={isExporting}
              />
            </div>
          </div>

          {/* By Issue Type */}
          <div className="card flex-1 flex flex-col animate-slide-up animate-delay-3" style={{ padding: '16px 20px 10px' }}>
            <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>
              By Issue Type
            </h2>
            <p style={{ fontSize: T.body, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>Type breakdown</p>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <DonutChart
                data={stats.issueTypeDist}
                colorMap={ISSUE_TYPE_COLORS}
                height="100%"
                innerRadius={65}
                outerRadius={115}
                centerLabel="Issues"
                disableAnimation={isExporting}
              />
            </div>
          </div>

          {/* By Assignee */}
          <div className="card flex-1 flex flex-col animate-slide-up animate-delay-4" style={{ padding: '16px 20px 10px' }}>
            <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 1px 4px', letterSpacing: '-0.01em' }}>
              By Assignee
            </h2>
            <p style={{ fontSize: T.body, color: '#94A3B8', margin: '0 0 0 4px', fontWeight: 500 }}>Issue count per team member</p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byAssignee} layout="vertical" margin={{ top: 8, right: 36, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="none" stroke="#F1F5F9" horizontal={false} />
                  <YAxis dataKey="assignee" type="category" tick={{ fontSize: T.chartAxis, fill: '#334155', fontWeight: 500 }} width={120} axisLine={false} tickLine={false} />
                  <XAxis type="number" tick={{ fontSize: T.chartAxis, fill: '#94A3B8', fontWeight: 500 }} allowDecimals={false} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: T.chartLegend, fontWeight: 600, paddingTop: 8, color: '#475569' }} iconType="circle" iconSize={8} />
                  {STATUS_ORDER.filter((s) => stats.byAssignee.some((r) => r[s] > 0)).map((s, si, arr) => (
                    <Bar key={s} dataKey={s} stackId="a" fill={STATUS_COLORS[s] || '#94A3B8'} barSize={28} isAnimationActive={!isExporting}
                      shape={(props) => <RoundedBarShape {...props} keys={arr} currentKey={s} dataEntry={stats.byAssignee[props.index] || {}} />}
                    >
                      <LabelList dataKey={s} position="center" fill="#fff" fontSize={T.chartLabel} fontWeight={700} formatter={(v) => (v > 0 ? v : '')} />
                      <LabelList dataKey={s} content={(props) => <TotalOnTop {...props} keys={arr} currentKey={s} data={stats.byAssignee} />} />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
