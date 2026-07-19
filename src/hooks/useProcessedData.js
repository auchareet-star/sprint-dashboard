import { useMemo } from 'react';
import { STATUS_ORDER, COMPLETED_STATUSES, RESOLVED_STATUSES } from '../utils/colors';

export function useProcessedData(cards, bugs) {
  return useMemo(() => {
    const total = cards.length;
    const planned = cards.filter((c) => c.type === 'Planned');
    const unplanned = cards.filter((c) => c.type === 'Unplanned');

    const doneCards = cards.filter((c) => c.status === 'Done');
    const pctDone = total > 0 ? Math.round((doneCards.length / total) * 100) : 0;
    const pctUnplanned = total > 0 ? Math.round((unplanned.length / total) * 100) : 0;

    const totalEstimate = cards.reduce((s, c) => s + c.estimate, 0);
    const totalActual = cards.reduce((s, c) => s + c.actual, 0);

    // Status counts by type — grouped as Planned/Unplanned rows with status breakdown
    const statusByType = [
      { type: 'Planned', ...Object.fromEntries(STATUS_ORDER.map((s) => [s, planned.filter((c) => c.status === s).length])) },
      { type: 'Unplanned', ...Object.fromEntries(STATUS_ORDER.map((s) => [s, unplanned.filter((c) => c.status === s).length])) },
    ];

    // Status distribution (all)
    const statusDistribution = STATUS_ORDER.map((status) => ({
      name: status,
      value: cards.filter((c) => c.status === status).length,
    })).filter((d) => d.value > 0);

    // Effort by status — grouped as Estimate/Actual rows with status breakdown
    const effortByStatus = [
      { type: 'Estimate', ...Object.fromEntries(STATUS_ORDER.map((s) => [s, cards.filter((c) => c.status === s).reduce((sum, c) => sum + c.estimate, 0)])) },
      { type: 'Actual', ...Object.fromEntries(STATUS_ORDER.map((s) => [s, cards.filter((c) => c.status === s).reduce((sum, c) => sum + c.actual, 0)])) },
    ];

    // Team performance - all assignees (sorted by total cards descending)
    const assigneeCounts = {};
    cards.forEach((c) => {
      if (!assigneeCounts[c.assignee]) assigneeCounts[c.assignee] = { total: 0 };
      assigneeCounts[c.assignee].total++;
    });
    const topAssignees = Object.entries(assigneeCounts)
      .sort((a, b) => b[1].total - a[1].total)
      .filter((e) => e[0] && e[0].trim() !== '')
      .map((e) => e[0]);

    const teamPlanned = topAssignees.map((name) => {
      const row = { assignee: name };
      STATUS_ORDER.forEach((status) => {
        row[status] = planned.filter((c) => c.assignee === name && c.status === status).length;
      });
      return row;
    });

    const teamUnplanned = topAssignees.map((name) => {
      const row = { assignee: name };
      STATUS_ORDER.forEach((status) => {
        row[status] = unplanned.filter((c) => c.assignee === name && c.status === status).length;
      });
      return row;
    });

    const teamTotal = topAssignees.map((name) => {
      const p = planned.filter((c) => c.assignee === name).length;
      const u = unplanned.filter((c) => c.assignee === name).length;
      return { assignee: name, Planned: p, Unplanned: u, Total: p + u };
    });

    // Effort gap
    const completedCards = cards.filter((c) => COMPLETED_STATUSES.includes(c.status));
    const inProgressCards = cards.filter((c) => !COMPLETED_STATUSES.includes(c.status));

    const effortGapDone = {
      label: 'Handed off (Review / Test / Deploy / Done)',
      Estimate: completedCards.reduce((s, c) => s + c.estimate, 0),
      Actual: completedCards.reduce((s, c) => s + c.actual, 0),
    };
    effortGapDone.gap = effortGapDone.Actual - effortGapDone.Estimate;
    effortGapDone.overrun = effortGapDone.gap > 0;

    const effortGapTodo = {
      label: 'Active (non-completed)',
      Estimate: inProgressCards.reduce((s, c) => s + c.estimate, 0),
      Actual: inProgressCards.reduce((s, c) => s + c.actual, 0),
    };
    effortGapTodo.gap = effortGapTodo.Actual - effortGapTodo.Estimate;
    effortGapTodo.overrun = effortGapTodo.gap > 0;

    // Per-assignee effort gap
    const effortGapByAssignee = topAssignees.map((name) => {
      const assigneeCards = cards.filter((c) => c.assignee === name);
      const est = assigneeCards.reduce((s, c) => s + c.estimate, 0);
      const act = assigneeCards.reduce((s, c) => s + c.actual, 0);
      return { assignee: name, Estimate: est, Actual: act, gap: act - est };
    });

    // Bugs — count all statuses
    const totalBugs = bugs.length;
    const bugsDone = bugs.filter((b) => RESOLVED_STATUSES.includes(b.status)).length;
    const bugsTodo = totalBugs - bugsDone;

    const bugStatusCounts = {};
    bugs.forEach((b) => {
      const s = b.status || 'Unknown';
      bugStatusCounts[s] = (bugStatusCounts[s] || 0) + 1;
    });
    const bugStatusDistribution = Object.entries(bugStatusCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // Bug priority distribution
    const bugPriorityCounts = {};
    bugs.forEach((b) => {
      const p = b.priority || 'Unknown';
      bugPriorityCounts[p] = (bugPriorityCounts[p] || 0) + 1;
    });
    const bugPriorityDistribution = Object.entries(bugPriorityCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // Bug Status x Priority breakdown
    const PRIORITY_LIST = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
    const bugStatusByPriority = STATUS_ORDER
      .map((status) => {
        const row = { status };
        const statusBugs = bugs.filter((b) => b.status === status);
        PRIORITY_LIST.forEach((p) => {
          row[p] = statusBugs.filter((b) => b.priority === p).length;
        });
        row._total = statusBugs.length;
        return row;
      })
      .filter((r) => r._total > 0);

    // Bugs by assignee (with per-status breakdown)
    const bugAssigneeCounts = {};
    bugs.forEach((b) => {
      const a = b.assignee || 'Unassigned';
      bugAssigneeCounts[a] = (bugAssigneeCounts[a] || 0) + 1;
    });
    const bugsByAssignee = Object.entries(bugAssigneeCounts)
      .map(([assignee, count]) => {
        const row = { assignee, count };
        STATUS_ORDER.forEach((s) => {
          row[s] = bugs.filter((b) => (b.assignee || 'Unassigned') === assignee && b.status === s).length;
        });
        return row;
      })
      .sort((a, b) => b.count - a.count);

    // ── Sprint Insights ──────────────────────────────────────────────────────

    // 1. Estimate Accuracy per assignee (sorted by absolute variance desc)
    const estimateAccuracy = topAssignees
      .map((name) => {
        const ac = cards.filter((c) => c.assignee === name && c.estimate > 0);
        if (ac.length === 0) return null;
        const est = parseFloat(ac.reduce((s, c) => s + c.estimate, 0).toFixed(2));
        const act = parseFloat(ac.reduce((s, c) => s + c.actual, 0).toFixed(2));
        return { assignee: name, estimate: est, actual: act, variance: parseFloat((act - est).toFixed(2)) };
      })
      .filter(Boolean)
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

    // 2. Planned vs Unplanned completion rate
    const plannedDone = planned.filter((c) => c.status === 'Done').length;
    const unplannedDone = unplanned.filter((c) => c.status === 'Done').length;
    const completionByType = {
      planned: { total: planned.length, done: plannedDone, pct: planned.length > 0 ? Math.round(plannedDone / planned.length * 100) : 0 },
      unplanned: { total: unplanned.length, done: unplannedDone, pct: unplanned.length > 0 ? Math.round(unplannedDone / unplanned.length * 100) : 0 },
    };

    // 3. Priority vs Completion
    const completionByPriority = ['Highest', 'High', 'Medium', 'Low', 'Lowest']
      .map((priority) => {
        const pc = cards.filter((c) => c.priority === priority);
        const done = pc.filter((c) => c.status === 'Done').length;
        return { priority, total: pc.length, done, pct: pc.length > 0 ? Math.round(done / pc.length * 100) : 0 };
      })
      .filter((p) => p.total > 0);

    // 4. Assignee Risk Score
    const assigneeRisk = topAssignees
      .map((name) => {
        const ac = cards.filter((c) => c.assignee === name);
        const unplannedRatio = ac.length > 0 ? ac.filter((c) => c.type === 'Unplanned').length / ac.length : 0;
        const est = ac.reduce((s, c) => s + c.estimate, 0);
        const act = ac.reduce((s, c) => s + c.actual, 0);
        const overrunRatio = est > 0 ? Math.max(0, (act - est) / est) : 0;
        const unresolvedBugs = bugs.filter((b) => b.assignee === name && !RESOLVED_STATUSES.includes(b.status)).length;
        const riskScore = Math.min(100, Math.round(
          Math.min(unplannedRatio, 0.5) / 0.5 * 33 +
          Math.min(overrunRatio, 0.5) / 0.5 * 33 +
          Math.min(unresolvedBugs, 5) / 5 * 34
        ));
        return {
          assignee: name,
          riskScore,
          unplannedPct: Math.round(unplannedRatio * 100),
          effortVariance: parseFloat((act - est).toFixed(2)),
          unresolvedBugs,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);

    return {
      total,
      plannedCount: planned.length,
      unplannedCount: unplanned.length,
      pctDone,
      pctUnplanned,
      totalEstimate,
      totalActual,
      totalBugs,
      statusByType,
      statusDistribution,
      effortByStatus,
      teamPlanned,
      teamUnplanned,
      teamTotal,
      topAssignees,
      effortGapDone,
      effortGapTodo,
      effortGapByAssignee,
      bugsDone,
      bugsTodo,
      bugStatusDistribution,
      bugsByAssignee,
      bugPriorityDistribution,
      bugStatusByPriority,
      estimateAccuracy,
      completionByType,
      completionByPriority,
      assigneeRisk,
    };
  }, [cards, bugs]);
}
