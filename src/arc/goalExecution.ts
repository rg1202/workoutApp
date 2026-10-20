import type { PlannedActivity } from '../plans';
import { uniqueActivities } from './uniqueActivities';

/** Keep legacy Goal-source records and manually linked Calendar activities in one execution lane. */
export function supportsGoal(plan: PlannedActivity, goalId: string): boolean {
  return Boolean(
    plan.goalIds?.includes(goalId) ||
    (plan.sourceType === 'Goal' && plan.sourceId === goalId) ||
    plan.id.startsWith('goal:' + goalId + ':')
  );
}

/** Deduplicate a session within a goal, without dropping its associations with other goals. */
export function goalActivities(plans: PlannedActivity[], goalId: string): PlannedActivity[] {
  return uniqueActivities(plans.filter(plan => supportsGoal(plan, goalId)));
}
