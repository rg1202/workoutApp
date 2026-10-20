import type { Goal } from '../goals';
import type { PlannedActivity, PlannedActivityType } from '../plans';
import type { Injury } from '../storage';
import type { DailyState } from './dailyState';
import type { StateObservation } from './stateHistory';
import type { SupportingTarget } from './goalsV2';
import { goalActivities } from './goalExecution';
import { uniqueActivities } from './uniqueActivities';
import { recoveryAssessment } from './recoveryScheduling';

const parse = (date: string) => new Date(date + 'T12:00:00');
const iso = (d: Date) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const addDays = (date: string, n: number) => { const d = parse(date); d.setDate(d.getDate() + n); return iso(d); };
const weekStart = (date: string) => addDays(date, -parse(date).getDay());
const demanding = (type: PlannedActivityType) => type === 'BJJ' || type === 'Strength';
const clampFrequency = (n: number) => Number.isFinite(n) ? Math.max(0, Math.min(7, Math.floor(n))) : 0;
const dayLabel = (date: string) => parse(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export type GoalWeekSuggestion = {
  plan: PlannedActivity;
  targetId: string;
  weekStart: string;
  reason: string;
  warnings: string[];
  needsReview: boolean;
};
export type GoalWeekSummary = { start: string; end: string; required: number; covered: number; suggested: number; unplaced: number };
export type GoalWeekPlan = {
  suggestions: GoalWeekSuggestion[];
  weeks: GoalWeekSummary[];
  required: number;
  covered: number;
  unplaced: number;
  notices: string[];
};

export type GoalWeekPlannerInput = {
  goal: Goal;
  planned: PlannedActivity[];
  today: string;
  weeks: number;
  states?: DailyState[];
  history?: StateObservation[];
  injuries?: Injury[];
};

/** Pure, deterministic calendar-week planner. No activity is persisted until explicitly accepted. */
export function planGoalWeeks({ goal, planned, today, weeks, states = [], history = [], injuries = [] }: GoalWeekPlannerInput): GoalWeekPlan {
  const result: GoalWeekPlan = { suggestions: [], weeks: [], required: 0, covered: 0, unplaced: 0, notices: [] };
  if (goal.status !== 'Active') return result;
  const targets = (goal.supportingTargets ?? []).filter(t => clampFrequency(t.frequencyPerWeek) > 0);
  if (!targets.length) return result;

  const all = uniqueActivities(planned);
  const working = [...all];
  const linked = goalActivities(all, goal.id).filter(p => p.status !== 'Skipped');
  const activeInjuries = injuries.filter(i => i.status !== 'Resolved');
  const maxWeeks = Math.max(1, Math.min(4, Math.floor(weeks)));
  const firstWeek = weekStart(today);

  for (let w = 0; w < maxWeeks; w++) {
    const start = addDays(firstWeek, w * 7);
    const end = addDays(start, 6);
    if (goal.deadline && start > goal.deadline) break;
    const from = [start, today, goal.startDate ?? start].sort().at(-1)!;
    const through = goal.deadline && goal.deadline < end ? goal.deadline : end;
    if (from > through) continue;

    const summary: GoalWeekSummary = { start, end, required: 0, covered: 0, suggested: 0, unplaced: 0 };
    const weekLinked = linked.filter(p => p.date >= start && p.date <= end);
    const assigned = new Set<string>();

    // Allocate each existing session to one target only, preferring its named target.
    // A single session linked to multiple goals can still count once within each goal.
    const credited = new Map<string, number>();
    for (const target of targets) {
      const count = clampFrequency(target.frequencyPerWeek);
      summary.required += count;
      const matches = weekLinked.filter(p =>
        !assigned.has(p.id) && p.type === target.activityType &&
        (p.title === target.name || p.id.startsWith('goal:' + goal.id + ':' + target.id + ':'))
      ).slice(0, count);
      matches.forEach(p => assigned.add(p.id));
      credited.set(target.id, matches.length);
    }
    for (const target of targets) {
      const room = clampFrequency(target.frequencyPerWeek) - (credited.get(target.id) ?? 0);
      const generic = weekLinked.filter(p => !assigned.has(p.id) && p.type === target.activityType).slice(0, room);
      generic.forEach(p => assigned.add(p.id));
      credited.set(target.id, (credited.get(target.id) ?? 0) + generic.length);
    }
    summary.covered = [...credited.values()].reduce((sum, n) => sum + n, 0);

    for (const target of targets) {
      const frequency = clampFrequency(target.frequencyPerWeek);
      const missing = frequency - (credited.get(target.id) ?? 0);
      if (!missing) continue;
      const restrictions = activeInjuries.filter(i =>
        (target.activityType === 'BJJ' && Boolean(i.bjjRestriction?.trim())) ||
        (target.activityType === 'Strength' && Boolean(i.strengthRestriction?.trim()))
      );
      const severe = demanding(target.activityType) && activeInjuries.some(i => i.status === 'Active' && i.severity >= 7);
      if (restrictions.length || severe) {
        summary.unplaced += missing;
        const detail = restrictions.length
          ? 'an active injury restriction'
          : 'a high-severity active injury';
        result.notices.push(target.name + ': ' + missing + ' session(s) not suggested because of ' + detail + '. Review the restriction before planning manually.');
        continue;
      }

      for (let index = 0; index < missing; index++) {
        const duration = Math.max(1, Math.min(300, target.durationMinutes ?? 60));
        const candidates: { date: string; score: number; warnings: string[]; reason: string; needsReview: boolean }[] = [];
        for (let date = from; date <= through; date = addDays(date, 1)) {
          const dayPlans = working.filter(p => p.status !== 'Skipped' && p.date === date);
          const dayMinutes = dayPlans.reduce((n, p) => n + (p.durationMinutes ?? 60), 0);
          // Avoid overfilling a day or stacking demanding sessions; preserve existing commitments.
          if (dayPlans.length >= 2 || dayMinutes + duration > 150) continue;
          if (demanding(target.activityType) && dayPlans.some(p => demanding(p.type))) continue;
          if (dayPlans.some(p => p.type === target.activityType && (p.title === target.name || p.id.startsWith('goal:' + goal.id + ':' + target.id + ':')))) continue;

          const before = working.filter(p => p.status !== 'Skipped' && p.date === addDays(date, -1));
          const after = working.filter(p => p.status !== 'Skipped' && p.date === addDays(date, 1));
          const adjacentLoad = demanding(target.activityType) &&
            [...before, ...after].some(p => demanding(p.type));
          const assessment = recoveryAssessment(working, date, states, history);
          const caution = assessment.warnings.filter(w =>
            /high-effort|actual training minutes|low energy|high soreness|high stress|short sleep/i.test(w)
          );
          const warnings = [...caution];
          if (adjacentLoad) warnings.push('Demanding training on an adjacent day; check recovery');
          if (dayPlans.some(p => !p.time)) warnings.push('Existing activity has no start time; check for overlap');
          if (activeInjuries.length) warnings.push('Active injury recorded; confirm this activity is appropriate');
          if (assessment.missing.length) warnings.push('Recovery data is incomplete');
          const idealDay = (index + (credited.get(target.id) ?? 0) + 0.5) * 7 / frequency;
          const score = dayPlans.length * 50 + dayMinutes / 5 + (adjacentLoad ? 30 : 0) +
            caution.length * 25 + Math.abs(parse(date).getDay() - idealDay) * 3;
          candidates.push({
            date, score, warnings,
            reason: dayPlans.length ? 'Fits around ' + dayPlans.length + ' existing session(s)' : 'No other activity scheduled',
            needsReview: caution.length > 0 || activeInjuries.length > 0 || adjacentLoad || dayPlans.some(p => !p.time)
          });
        }
        candidates.sort((a, b) => a.score - b.score || a.date.localeCompare(b.date));
        const best = candidates[0];
        if (!best) { summary.unplaced++; continue; }
        const base = 'goal:' + goal.id + ':' + target.id + ':' + start + ':' + index;
        let id = base;
        let attempt = 1;
        while (working.some(p => p.id === id) || planned.some(p => p.id === id)) id = base + ':retry' + attempt++;
        const plan: PlannedActivity = {
          id, date: best.date, title: target.name || goal.name, type: target.activityType,
          durationMinutes: duration, status: 'Planned', sourceType: 'Goal', sourceId: goal.id,
          sourceLabel: goal.name, goalIds: [goal.id],
          notes: [goal.name, target.notes].filter(Boolean).join(' · ')
        };
        working.push(plan);
        result.suggestions.push({
          plan, targetId: target.id, weekStart: start, reason: best.reason,
          warnings: best.warnings, needsReview: best.needsReview
        });
        summary.suggested++;
      }
    }
    result.weeks.push(summary);
    result.required += summary.required;
    result.covered += summary.covered;
    result.unplaced += summary.unplaced;
  }

  if (!result.weeks.length) result.notices.push('No dates in this planning horizon fall within the goal’s active dates.');
  if (result.unplaced > 0) result.notices.push(result.unplaced + ' session(s) could not fit within available days or recorded constraints.');
  if (result.suggestions.some(s => s.warnings.includes('Recovery data is incomplete'))) result.notices.push('Some recovery information is missing. Suggested dates are planning aids, not clearance to train.');
  return result;
}
