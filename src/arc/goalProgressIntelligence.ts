import type { Goal } from '../goals';
import type { PlannedActivity, PlannedActivityType } from '../plans';
import { goalActivities } from './goalExecution';

export type ProgressNextAction = 'plan' | 'review-recovery' | 'none';
export type GoalProgressInsight = {
  /** Four oldest-to-newest disjoint seven-day windows, ending on local today. */
  windows: { start: string; end: string; completed: number; targetCompleted: number; eligible: boolean }[];
  trend: 'More logged' | 'Steady' | 'Fewer logged' | 'Recently started' | 'No recent completions' | 'No completion history';
  targetPerWeek: number;
  windowsMeetingTarget: number | null;
  eligibleWindowCount: number;
  status: string;
  detail: string;
  nextMove: string;
  action: ProgressNextAction;
  priority: number;
};

const iso = (d: Date) =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const addDays = (date: string, delta: number) => {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return iso(d);
};
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 86400000);
const plural = (n: number, noun: string) => n + ' ' + noun + (n === 1 ? '' : 's');

/**
 * Deterministic insights about recorded execution only.
 * A lack of recorded activity is never proof of inactivity or an unchanged outcome.
 * Do not infer a trend from a zero-only baseline, and do not treat past-due planned
 * sessions as future coverage of a weekly target.
 */
export function goalProgressInsight(goal: Goal, plans: PlannedActivity[], today: string): GoalProgressInsight {
  const linked = goalActivities(plans, goal.id).filter(p => !goal.startDate || p.date >= goal.startDate);
  const completed = linked.filter(p => p.status === 'Completed' && p.date <= today);
  const targetTypes = new Set<PlannedActivityType>((goal.supportingTargets ?? []).map(t => t.activityType));
  const targetPerWeek = (goal.supportingTargets ?? []).reduce((sum, t) =>
    sum + Math.max(0, Number.isFinite(t.frequencyPerWeek) ? t.frequencyPerWeek : 0), 0);
  const windows = [3, 2, 1, 0].map(index => {
    const start = addDays(today, -(index * 7 + 6));
    const end = addDays(today, -index * 7);
    const entries = completed.filter(p => p.date >= start && p.date <= end);
    const eligible = !goal.startDate || goal.startDate <= start;
    return {
      start, end, completed: entries.length,
      targetCompleted: entries.filter(p => targetTypes.has(p.type)).length,
      eligible
    };
  });
  const recent = windows[3].completed;
  const previous = windows[2].completed;
  const history = windows.reduce((sum, w) => sum + w.completed, 0);
  const trend: GoalProgressInsight['trend'] =
    recent > 0 && previous === 0 ? 'Recently started' :
    recent === 0 && previous === 0 ? (history > 0 ? 'No recent completions' : 'No completion history') :
    recent > previous ? 'More logged' :
    recent < previous ? 'Fewer logged' : 'Steady';
  const eligibleWindows = windows.filter(w => w.eligible);
  const windowsMeetingTarget = targetPerWeek > 0
    ? eligibleWindows.filter(w => w.targetCompleted >= targetPerWeek).length : null;

  const weekStart = new Date(today + 'T12:00:00');
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = addDays(iso(weekStart), 6);
  const thisWeek = linked.filter(p => p.date >= iso(weekStart) && p.date <= weekEnd);
  const future = linked.filter(p => p.status === 'Planned' && p.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
  const thisWeekCompleted = thisWeek.filter(p => p.status === 'Completed' && p.date <= today && targetTypes.has(p.type)).length;
  const thisWeekUpcoming = thisWeek.filter(p => p.status === 'Planned' && p.date >= today && targetTypes.has(p.type)).length;
  const uncovered = Math.max(0, targetPerWeek - thisWeekCompleted - thisWeekUpcoming);
  const recentRecovery = completed.some(p => p.date >= addDays(today, -6) &&
    (p.recoveryBody === 'Concern' || p.recoveryNeed === 'High'));
  const latestDate = completed.reduce<string | null>((latest, p) => !latest || p.date > latest ? p.date : latest, null);
  const inactivityDays = latestDate ? daysBetween(latestDate, today) : null;
  const base = { windows, trend, targetPerWeek, windowsMeetingTarget,
    eligibleWindowCount: eligibleWindows.length };

  if (goal.startDate && goal.startDate > today) {
    return { ...base, status: 'Upcoming goal', detail: 'The recorded start date is in the future.',
      nextMove: 'Review the supporting plan before the start date.', action: 'none', priority: 0 };
  }
  if (recentRecovery) {
    return { ...base, status: 'Recovery deserves review',
      detail: 'A completed session in the last seven days records a concern or high recovery need.',
      nextMove: 'Review that recovery note before adding another session.',
      action: 'review-recovery', priority: 5 };
  }
  if (inactivityDays !== null && inactivityDays >= 14 && !future.length) {
    return { ...base, status: 'Recorded activity gap',
      detail: 'No goal-linked completion recorded for ' + plural(inactivityDays, 'day') + ', and no upcoming session is scheduled.',
      nextMove: 'Plan a return session when you are ready.', action: 'plan', priority: 4 };
  }
  if (!linked.length) {
    return { ...base, status: 'Needs a supporting plan',
      detail: 'No Calendar activities are linked to this goal.',
      nextMove: 'Add a supporting activity to Calendar.', action: 'plan', priority: 3 };
  }
  if (uncovered > 0 && targetPerWeek > 0) {
    const gaps = (goal.supportingTargets ?? []).reduce((map, target) => {
      map.set(target.activityType, (map.get(target.activityType) ?? 0) + Math.max(0, target.frequencyPerWeek || 0));
      return map;
    }, new Map<PlannedActivityType, number>());
    const missingByType = [...gaps].map(([type, target]) => ({
      type, missing: Math.max(0, target -
        thisWeek.filter(p => p.type === type && (p.status === 'Completed' && p.date <= today ||
          p.status === 'Planned' && p.date >= today)).length)
    })).sort((a, b) => b.missing - a.missing);
    const largestGap = missingByType[0];
    return { ...base, status: 'Weekly plan has a gap',
      detail: plural(uncovered, 'supporting session') + ' not covered by completed or upcoming matching-type activities this calendar week.',
      nextMove: largestGap && largestGap.missing > 0
        ? 'Review options for ' + plural(largestGap.missing, largestGap.type + ' session') + ' this week.'
        : 'Review the remaining weekly schedule.',
      action: 'plan', priority: 3 };
  }
  if (recent === 0 && inactivityDays !== null && future.length) {
    return { ...base, status: 'Next session scheduled',
      detail: 'No completion in the last seven days; the next linked session is ' + future[0].date + '.',
      nextMove: 'Use the upcoming session to resume recorded activity.', action: 'none', priority: 1 };
  }
  if (targetPerWeek > 0 && windowsMeetingTarget !== null &&
    eligibleWindows.length >= 3 && windowsMeetingTarget >= 3) {
    return { ...base, status: 'Consistent recorded execution',
      detail: plural(windowsMeetingTarget, 'seven-day window') + ' met the matching-type session target.',
      nextMove: 'Keep the schedule sustainable and record actual results.', action: 'none', priority: 0 };
  }
  if (recent > 0) {
    return { ...base, status: 'Execution recorded',
      detail: plural(recent, 'goal-linked session') + ' completed in the last seven days.',
      nextMove: future.length ? 'Next linked session: ' + future[0].date + '.' :
        'Review when the next supporting session fits.', action: future.length ? 'none' : 'plan',
      priority: future.length ? 0 : 1 };
  }
  if (future.length) {
    return { ...base, status: 'Session on the calendar',
      detail: 'No completed activity recorded yet in the last seven days.',
      nextMove: 'Next linked session: ' + future[0].date + '.', action: 'none', priority: 0 };
  }
  return { ...base, status: 'No recent completion evidence',
    detail: 'No goal-linked completions are recorded in the last seven days.',
    nextMove: 'Review or add a supporting session.', action: 'plan', priority: 2 };
}
