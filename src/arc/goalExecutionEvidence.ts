import type { Goal } from '../goals';
import type { PlannedActivity } from '../plans';
import { goalActivities } from './goalExecution';

export type GoalExecutionEvidence = {
  recentCompleted: number;
  previousCompleted: number;
  measuredMinutes: number;
  measuredSessions: number;
  latestCompleted: PlannedActivity | null;
};

const localIso = (date: Date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

const offsetDate = (today: string, offset: number) => {
  const date = new Date(today + 'T12:00:00');
  date.setDate(date.getDate() + offset);
  return localIso(date);
};

/**
 * Evidence of execution, not outcome attainment.
 * Windows are two disjoint seven-day periods ending on the user's local today.
 * Only completed, explicitly goal-linked sessions count. Duplicate records for
 * the same linked activity are collapsed by goalActivities.
 * Scheduled durations are never substituted for actual training time.
 */
export function goalExecutionEvidence(
  goal: Goal,
  planned: PlannedActivity[],
  today: string
): GoalExecutionEvidence {
  const completed = goalActivities(planned, goal.id)
    .filter(p => p.status === 'Completed' && p.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.time ?? '').localeCompare(a.time ?? '') || b.id.localeCompare(a.id));
  const recentStart = offsetDate(today, -6);
  const previousStart = offsetDate(today, -13);
  const previousEnd = offsetDate(today, -7);
  const recent = completed.filter(p => p.date >= recentStart);
  const previous = completed.filter(p => p.date >= previousStart && p.date <= previousEnd);
  const measured = recent.filter(p => {
    const value = p.actuals?.actualDurationMinutes;
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  });

  return {
    recentCompleted: recent.length,
    previousCompleted: previous.length,
    measuredMinutes: measured.reduce((total, p) => total + (p.actuals?.actualDurationMinutes ?? 0), 0),
    measuredSessions: measured.length,
    latestCompleted: completed[0] ?? null
  };
}
