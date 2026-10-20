import { test, expect } from '@playwright/test';
import { planGoalWeeks } from '../src/arc/goalWeekPlanner';
import type { Goal } from '../src/goals';
import type { PlannedActivity } from '../src/plans';

const today = '2026-10-20';
const goal = (targets: Goal['supportingTargets']): Goal => ({
  id: 'goal-1', name: 'Blue belt', type: 'BJJ', focus: 'bjj',
  status: 'Active', startDate: '2024-01-01', deadline: '2027-12-31',
  supportingTargets: targets
});

test('same-type targets cannot double-credit one existing linked session', () => {
  const g = goal([
    { id: 'a', name: 'Gi class', activityType: 'BJJ', frequencyPerWeek: 1, durationMinutes: 60 },
    { id: 'b', name: 'No-Gi class', activityType: 'BJJ', frequencyPerWeek: 1, durationMinutes: 60 }
  ]);
  const existing: PlannedActivity[] = [
    { id: 'done', date: today, title: 'Gi class', type: 'BJJ', status: 'Completed', goalIds: ['goal-1'] },
    { id: 'cross', date: today, title: 'Recovery jog', type: 'Cardio', status: 'Completed', goalIds: ['goal-1'] },
    { id: 'unlinked', date: today, title: 'No-Gi class', type: 'BJJ', status: 'Completed' }
  ];
  const plan = planGoalWeeks({ goal: g, planned: existing, today, weeks: 1 });
  expect(plan.required).toBe(2);
  expect(plan.covered).toBe(1);
  expect(plan.suggestions).toHaveLength(1);
  expect(plan.suggestions[0].plan.title).toBe('No-Gi class');
  expect(plan.suggestions[0].plan.date).toBeGreaterThanOrEqual(today);
  expect(plan.suggestions[0].plan.time).toBeUndefined();
  expect(plan.suggestions[0].plan.goalIds).toEqual(['goal-1']);
});

test('existing generated program sessions occupy days even when not linked to a goal', () => {
  const g = goal([{ id: 'a', name: 'Gi class', activityType: 'BJJ', frequencyPerWeek: 1, durationMinutes: 90 }]);
  const existing: PlannedActivity[] = [
    { id: 'program:one', date: '2026-10-21', title: 'Strength session', type: 'Strength', durationMinutes: 120, status: 'Planned' },
    { id: 'program:two', date: '2026-10-22', title: 'Gi training', type: 'BJJ', durationMinutes: 90, status: 'Planned' }
  ];
  const plan = planGoalWeeks({ goal: g, planned: existing, today, weeks: 1 });
  expect(plan.suggestions).toHaveLength(1);
  expect(plan.suggestions[0].plan.date).not.toBe('2026-10-21');
  expect(plan.suggestions[0].plan.date).not.toBe('2026-10-22');
});

test('restricting BJJ prevents automated placement while keeping a clear unplaced count', () => {
  const g = goal([{ id: 'a', name: 'Gi class', activityType: 'BJJ', frequencyPerWeek: 3 }]);
  const plan = planGoalWeeks({
    goal: g, planned: [], today, weeks: 1,
    injuries: [{ id: 'inj', name: 'Shoulder', bodyArea: 'Shoulder', side: 'Left',
      type: 'Strain', onsetDate: today, severity: 4, status: 'Improving',
      notes: '', bjjRestriction: 'No BJJ yet' }]
  });
  expect(plan.suggestions).toHaveLength(0);
  expect(plan.unplaced).toBe(3);
  expect(plan.notices.join(' ')).toContain('active injury restriction');
});

test('skipped sessions do not satisfy weekly targets, and old start dates do not stop planning', () => {
  const g = goal([{ id: 'a', name: 'Gi class', activityType: 'BJJ', frequencyPerWeek: 1 }]);
  const plan = planGoalWeeks({
    goal: g, planned: [{ id: 'old-skipped', date: today, title: 'Gi class', type: 'BJJ',
      status: 'Skipped', goalIds: ['goal-1'] }], today, weeks: 2
  });
  expect(plan.required).toBe(2);
  expect(plan.covered).toBe(0);
  expect(plan.suggestions).toHaveLength(2);
  expect(plan.suggestions.every(s => s.plan.date >= today)).toBeTruthy();
  expect(new Set(plan.suggestions.map(s => s.plan.id)).size).toBe(2);
});

test('fully occupied days produce unplaced sessions, not invisible overbooking', () => {
  const g = goal([{ id: 'a', name: 'Gi class', activityType: 'BJJ', frequencyPerWeek: 2 }]);
  const existing: PlannedActivity[] = [];
  for (let n = 0; n < 7; n++) {
    const d = new Date('2026-10-18T12:00:00');
    d.setDate(d.getDate() + n);
    const date = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    for (let i = 0; i < 2; i++) existing.push({
      id: 'busy-' + n + '-' + i, date, title: 'Existing commitment', type: 'Other', status: 'Planned', durationMinutes: 60
    });
  }
  const plan = planGoalWeeks({ goal: g, planned: existing, today, weeks: 1 });
  expect(plan.suggestions).toHaveLength(0);
  expect(plan.unplaced).toBe(2);
});
