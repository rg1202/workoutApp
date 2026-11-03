import type { PlannedActivity } from '../plans';
import type { SessionRecord } from '../storage';

/** Link only when exactly one uncompleted strength plan matches this session.
 * Ambiguous matches must never complete an unrelated Calendar activity. */
export function matchingStrengthPlan(
  plans: PlannedActivity[],
  programId: string,
  sessionDate: string
): PlannedActivity | undefined {
  const candidates = plans.filter(plan =>
    plan.type === 'Strength' &&
    plan.status === 'Planned' &&
    plan.programId === programId &&
    plan.date === sessionDate
  );
  return candidates.length === 1 ? candidates[0] : undefined;
}

export function completeLinkedStrengthPlan(
  plans: PlannedActivity[],
  session: Pick<SessionRecord, 'plannedActivityId'>
): PlannedActivity[] {
  if (!session.plannedActivityId) return plans;
  return plans.map(plan =>
    plan.id === session.plannedActivityId && plan.status === 'Planned'
      ? { ...plan, status: 'Completed' as const }
      : plan
  );
}
