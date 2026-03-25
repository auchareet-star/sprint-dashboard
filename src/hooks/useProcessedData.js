import { useMemo } from 'react';
import { STATUS_ORDER } from '../utils/colors';

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

    // Effort by status
    const effortByStatus = STATUS_ORDER.map((status) => {
      const group = cards.filter((c) => c.status === status);
      return {
        status,
        Estimate: group.reduce((s, c) => s + c.estimate, 0),
        Actual: group.reduce((s, c) => s + c.actual, 0),
      };
    }).filter((d) => d.Estimate > 0 || d.Actual > 0);

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
    const COMPLETED_STATUSES = ['Done', 'Wait for Deploy', 'Waiting for Test', 'Cancel'];
    const IN_PROGRESS_STATUSES = ['To Do', 'In Progress', 'Test Failed'];

    const completedCards = cards.filter((c) => COMPLETED_STATUSES.includes(c.status));
    const inProgressCards = cards.filter((c) => IN_PROGRESS_STATUSES.includes(c.status));

    const effortGapDone = {
      label: 'Done / Deploy / Test / Cancel',
      Estimate: completedCards.reduce((s, c) => s + c.estimate, 0),
      Actual: completedCards.reduce((s, c) => s + c.actual, 0),
    };
    effortGapDone.gap = effortGapDone.Actual - effortGapDone.Estimate;
    effortGapDone.overrun = effortGapDone.gap > 0;

    const effortGapTodo = {
      label: 'To Do / In Progress / Test Failed',
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
    const BUG_RESOLVED = ['Done', 'Cancel'];
    const bugsDone = bugs.filter((b) => BUG_RESOLVED.includes(b.status)).length;
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

    // Bugs by assignee
    const bugAssigneeCounts = {};
    bugs.forEach((b) => {
      const a = b.assignee || 'Unassigned';
      bugAssigneeCounts[a] = (bugAssigneeCounts[a] || 0) + 1;
    });
    const bugsByAssignee = Object.entries(bugAssigneeCounts)
      .map(([assignee, count]) => ({ assignee, count }))
      .sort((a, b) => b.count - a.count);

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
    };
  }, [cards, bugs]);
}
