import { test, expect } from '@playwright/test';
import { goalExecutionEvidence } from '../src/arc/goalExecutionEvidence';
import type { Goal } from '../src/goals';
import type { PlannedActivity } from '../src/plans';

const iso = (d: Date) =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const offset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};
const goal: Goal = { id: 'bjj', name: 'Mat consistency', type: 'BJJ', status: 'Active' };

test('execution evidence uses disjoint seven-day windows, deduplicates sessions and finds the latest result', () => {
  const plans: PlannedActivity[] = [
    { id: 'today', linkedActivityId: 'session-1', date: offset(0), title: 'Open mat', type: 'BJJ', status: 'Completed', goalIds: ['bjj'], actuals: { actualDurationMinutes: 75 }, sessionResult: 'Great' },
    { id: 'today-duplicate', linkedActivityId: 'session-1', date: offset(0), title: 'Open mat', type: 'BJJ', status: 'Completed', goalIds: ['bjj'], actuals: { actualDurationMinutes: 75 } },
    { id: 'six-days', date: offset(-6), title: 'Drills', type: 'BJJ', status: 'Completed', goalIds: ['bjj'] },
    { id: 'seven-days', date: offset(-7), title: 'Older class', type: 'BJJ', status: 'Completed', goalIds: ['bjj'], actuals: { actualDurationMinutes: 50 } },
    { id: 'thirteen-days', date: offset(-13), title: 'Oldest included', type: 'BJJ', status: 'Completed', goalIds: ['bjj'] },
    { id: 'fourteen-days', date: offset(-14), title: 'Too old', type: 'BJJ', status: 'Completed', goalIds: ['bjj'] },
    { id: 'other-goal', date: offset(0), title: 'Not linked', type: 'BJJ', status: 'Completed', goalIds: ['other'] }
  ];
  const evidence = goalExecutionEvidence(goal, plans, offset(0));
  expect(evidence).toMatchObject({
    recentCompleted: 2,
    previousCompleted: 2,
    measuredMinutes: 75,
    measuredSessions: 1
  });
  expect(evidence.latestCompleted?.title).toBe('Open mat');
});

test('execution evidence never substitutes planned duration for actual minutes or counts future and unfinished plans', () => {
  const plans: PlannedActivity[] = [
    { id: 'completed', date: offset(0), title: 'Today class', type: 'BJJ', status: 'Completed', goalIds: ['bjj'], durationMinutes: 90 },
    { id: 'planned', date: offset(0), title: 'Future plan', type: 'BJJ', status: 'Planned', goalIds: ['bjj'], durationMinutes: 120 },
    { id: 'skipped', date: offset(-1), title: 'Skipped', type: 'BJJ', status: 'Skipped', goalIds: ['bjj'], durationMinutes: 40 },
    { id: 'future-completed', date: offset(1), title: 'Future date', type: 'BJJ', status: 'Completed', goalIds: ['bjj'], actuals: { actualDurationMinutes: 55 } }
  ];
  expect(goalExecutionEvidence(goal, plans, offset(0))).toMatchObject({
    recentCompleted: 1,
    previousCompleted: 0,
    measuredMinutes: 0,
    measuredSessions: 0,
    latestCompleted: expect.objectContaining({ id: 'completed' })
  });
});

test('zero actual minutes is recorded evidence, but an empty goal has no invented latest action', () => {
  const completed: PlannedActivity = {
    id: 'zero', date: offset(0), title: 'Recovery practice', type: 'BJJ',
    status: 'Completed', goalIds: ['bjj'], actuals: { actualDurationMinutes: 0 }
  };
  expect(goalExecutionEvidence(goal, [completed], offset(0))).toMatchObject({
    recentCompleted: 1, measuredMinutes: 0, measuredSessions: 1
  });
  expect(goalExecutionEvidence(goal, [], offset(0))).toMatchObject({
    recentCompleted: 0, previousCompleted: 0, measuredSessions: 0, latestCompleted: null
  });
});
