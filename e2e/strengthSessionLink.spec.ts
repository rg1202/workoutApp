import { test, expect } from '@playwright/test';
import { matchingStrengthPlan, completeLinkedStrengthPlan } from '../src/arc/strengthSessionLink';
import type { PlannedActivity } from '../src/plans';

const planned = (id: string, overrides: Partial<PlannedActivity> = {}): PlannedActivity => ({
  id, date: '2026-11-03', title: 'Strength session', type: 'Strength',
  status: 'Planned', programId: 'program-1', ...overrides
});

test('strength session links only to one matching scheduled activity', () => {
  const plan = planned('calendar-1');
  expect(matchingStrengthPlan([plan], 'program-1', '2026-11-03')?.id).toBe(plan.id);
  expect(matchingStrengthPlan([plan], 'program-2', '2026-11-03')).toBeUndefined();
  expect(matchingStrengthPlan([plan, planned('calendar-2')], 'program-1', '2026-11-03')).toBeUndefined();
  expect(matchingStrengthPlan([planned('done', { status: 'Completed' })], 'program-1', '2026-11-03')).toBeUndefined();
});

test('completing a linked strength session preserves unrelated plans and IDs', () => {
  const plans = [planned('calendar-1'), planned('calendar-2', { programId: 'other' })];
  const result = completeLinkedStrengthPlan(plans, { plannedActivityId: 'calendar-1' });
  expect(result.map(x => [x.id, x.status])).toEqual([
    ['calendar-1', 'Completed'], ['calendar-2', 'Planned']
  ]);
  expect(completeLinkedStrengthPlan(plans, {})).toBe(plans);
});
