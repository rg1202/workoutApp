import type { Goal } from '../goals';
import type { PlannedActivity } from '../plans';
import { weeklyCoverage } from './goalCoverage';
import { goalActivities, supportsGoal } from './goalExecution';

export type TodayGoalCoverage = {
  goal: Goal;
  required: number;
  completed: number;
  scheduled: number;
  overdue: number;
  missing: number;
  status: 'Needs scheduling' | 'Week covered' | 'Weekly target completed';
};

const localIso = (date: Date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

/**
 * Today's weekly action coverage. Only future or same-day planned sessions can
 * satisfy the remaining schedule. Past, uncompleted sessions stay on Calendar,
 * but no longer count as actionable coverage.
 *
 * This is a scheduling signal, not a measurement of goal achievement.
 */
export function todayGoalCoverage(goals: Goal[], plans: PlannedActivity[], today: string): TodayGoalCoverage[] {
  const start = new Date(today + 'T12:00:00');
  start.setDate(start.getDate() - start.getDay());
  const weekStart = localIso(start);

  return goals.filter(goal =>
    goal.status === 'Active' && (goal.supportingTargets ?? []).some(target => target.frequencyPerWeek > 0)
  ).map(goal => {
    const linked = goalActivities(plans, goal.id);
    const rows = weeklyCoverage(goal, plans, today);
    const totals = rows.reduce((result, row) => {
      const overdue = linked.filter(plan =>
        plan.type === row.type && plan.status === 'Planned' &&
        plan.date >= weekStart && plan.date < today
      ).length;
      const scheduled = Math.max(0, row.scheduled - overdue);
      result.required += row.target;
      result.completed += row.completed;
      result.scheduled += scheduled;
      result.overdue += overdue;
      result.missing += Math.max(0, row.target - row.completed - scheduled);
      return result;
    }, { required: 0, completed: 0, scheduled: 0, overdue: 0, missing: 0 });

    const status: TodayGoalCoverage['status'] = totals.missing > 0
      ? 'Needs scheduling'
      : totals.completed >= totals.required
        ? 'Weekly target completed'
        : 'Week covered';
    return { goal, ...totals, status };
  });
}

/** A session may support several goals but is still one item on Today's timeline. */
export function linkedGoalNames(plan: PlannedActivity, goals: Goal[]): string[] {
  return goals.filter(goal => goal.status === 'Active' && supportsGoal(plan, goal.id)).map(goal => goal.name);
}
