import { test, expect } from '@playwright/test';
import { goalProgressInsight } from '../src/arc/goalProgressIntelligence';
import type { Goal } from '../src/goals';
import type { PlannedActivity } from '../src/plans';

const today = '2026-10-20'; // Tuesday, so the calendar week is deterministic.
const add = (n: number) => {
  const d = new Date(today + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};
const goal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'goal', name: 'Mat consistency', type: 'BJJ', status: 'Active',
  supportingTargets: [{ id: 'bjj', name: 'Mat class', activityType: 'BJJ', frequencyPerWeek: 2 }],
  ...overrides
});
const plan = (id: string, offset: number, status: PlannedActivity['status'] = 'Completed',
  overrides: Partial<PlannedActivity> = {}): PlannedActivity => ({
  id, date: add(offset), title: id, type: 'BJJ', status, goalIds: ['goal'], ...overrides
});

test('28-day windows are disjoint, oldest to newest, deduplicated and exclude future/unfinished sessions', () => {
  const entries = [
    plan('w3', -27), plan('w2', -14), plan('w1', -7), plan('recent', 0),
    plan('same-activity', 0, 'Completed', { linkedActivityId: 'same' }),
    plan('duplicate', 0, 'Completed', { linkedActivityId: 'same' }),
    plan('too-old', -28), plan('future', 1),
    plan('skipped', 0, 'Skipped'), plan('planned', 0, 'Planned'),
    plan('other', 0, 'Completed', { goalIds: ['other'] })
  ];
  const insight = goalProgressInsight(goal({ supportingTargets: [] }), entries, today);
  expect(insight.windows.map(w => w.completed)).toEqual([1, 1, 1, 2]);
  expect(insight.windows[0]).toMatchObject({ start: add(-27), end: add(-21) });
  expect(insight.windows[3]).toMatchObject({ start: add(-6), end: today });
  expect(insight.trend).toBe('More logged');
  expect(insight.windowsMeetingTarget).toBeNull();
});

test('only matching activity types count toward weekly coverage, and overdue planned sessions do not cover a gap', () => {
  const entries = [
    plan('run', -1, 'Completed', { type: 'Cardio' }),
    plan('past-unfinished', -1, 'Planned'),
    plan('future', 1, 'Planned', { type: 'Cardio' })
  ];
  const insight = goalProgressInsight(goal(), entries, today);
  expect(insight.status).toBe('Weekly plan has a gap');
  expect(insight.detail).toContain('2 supporting sessions');
  expect(insight.nextMove).toContain('2 BJJ sessions');
  expect(insight.action).toBe('plan');
});

test('genuine three-window matching-target execution can be described as consistent', () => {
  const entries = [-25, -22, -19, -15, -11, -8, -4, -2].map((n, i) => plan('session-' + i, n));
  const insight = goalProgressInsight(goal(), entries, today);
  expect(insight.windows.map(w => w.targetCompleted)).toEqual([2, 2, 2, 2]);
  expect(insight.windowsMeetingTarget).toBe(4);
  expect(insight.status).toBe('Consistent recorded execution');
  expect(insight.action).toBe('none');
});

test('historical completions with 14+ day gap and no upcoming plan trigger a recorded-activity gap, not an outcome claim', () => {
  const insight = goalProgressInsight(goal(), [plan('old', -17)], today);
  expect(insight).toMatchObject({ status: 'Recorded activity gap', priority: 4, action: 'plan' });
  expect(insight.detail).toContain('17 days');
  expect(insight.nextMove).toContain('return session');
  expect(insight.trend).toBe('No recent completions');
});

test('a future scheduled session suppresses the long-gap alert when there is no frequency target', () => {
  const insight = goalProgressInsight(goal({ supportingTargets: [] }), [
    plan('old', -19), plan('upcoming', 2, 'Planned')
  ], today);
  expect(insight.status).toBe('Next session scheduled');
  expect(insight.action).toBe('none');
  expect(insight.detail).toContain(add(2));
});

test('recovery concern takes priority over training gaps without recommending extra activity', () => {
  const insight = goalProgressInsight(goal(), [
    plan('sore', -1, 'Completed', { recoveryNeed: 'High', recoveryBody: 'Concern' })
  ], today);
  expect(insight).toMatchObject({ status: 'Recovery deserves review', priority: 5, action: 'review-recovery' });
  expect(insight.nextMove).toContain('Review that recovery note');
});

test('missing history and a future goal start never masquerade as an established plateau', () => {
  const empty = goalProgressInsight(goal(), [], today);
  expect(empty).toMatchObject({ status: 'Needs a supporting plan', trend: 'No completion history' });
  const upcoming = goalProgressInsight(goal({ startDate: add(3) }), [], today);
  expect(upcoming).toMatchObject({ status: 'Upcoming goal', action: 'none' });
  const recentlyStarted = goalProgressInsight(goal({ startDate: add(-3) }), [
    plan('new', -2), plan('older', -15)
  ], today);
  expect(recentlyStarted.windows.map(w => w.completed)).toEqual([0, 0, 0, 1]);
  expect(recentlyStarted.eligibleWindowCount).toBe(0);
  expect(recentlyStarted.windowsMeetingTarget).toBe(0);
  expect(recentlyStarted.trend).toBe('Recently started');
});

test('two equal active weeks are steady; reduced recorded activity is fewer logged, not evidence of declining fitness', () => {
  const steady = goalProgressInsight(goal({ supportingTargets: [] }), [
    plan('prior', -7), plan('recent', 0)
  ], today);
  expect(steady.trend).toBe('Steady');
  const fewer = goalProgressInsight(goal({ supportingTargets: [] }), [
    plan('prior-a', -8), plan('prior-b', -9), plan('recent', 0)
  ], today);
  expect(fewer.trend).toBe('Fewer logged');
});
