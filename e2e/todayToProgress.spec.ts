import { test, expect, type Page } from '@playwright/test';

const nav = (page: Page, name: string) =>
  page.locator('aside').getByRole('button', { name, exact: true }).first();
const date = (n = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
});

test('completing a Today activity updates its goal execution evidence without changing the outcome measurement', async ({ page }) => {
  await page.evaluate(({ today, yesterday, previous }) => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'goal-mat', name: 'Mat consistency', type: 'BJJ', focus: 'bjj', status: 'Active', current: 2, target: 10,
        supportingTargets: [{ id: 'target-mat', name: 'Mat practice', activityType: 'BJJ', frequencyPerWeek: 3 }] },
      { id: 'goal-run', name: 'Run a race', type: 'Cardio', focus: 'running', status: 'Active' }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'mat-today', date: today, title: 'Open mat', type: 'BJJ', status: 'Planned', goalIds: ['goal-mat'], durationMinutes: 90 },
      { id: 'mat-yesterday', date: yesterday, title: 'Drilling', type: 'BJJ', status: 'Completed', goalIds: ['goal-mat'], actuals: { actualDurationMinutes: 60 } },
      { id: 'mat-previous', date: previous, title: 'Last week class', type: 'BJJ', status: 'Completed', goalIds: ['goal-mat'], actuals: { actualDurationMinutes: 40 } },
      { id: 'unlinked', date: today, title: 'Unlinked walk', type: 'Cardio', status: 'Completed' }
    ]));
  }, { today: date(), yesterday: date(-1), previous: date(-9) });
  await page.reload();
  await nav(page, 'Today').click();
  await page.getByRole('button', { name: 'Mark Open mat complete' }).click();
  const todaySession = page.locator('.today-activity-list>div').filter({ hasText: 'Open mat' });
  await todaySession.locator('.today-result-options').getByRole('button', { name: 'Good' }).click();
  await todaySession.getByRole('button', { name: 'See in Progress' }).click();

  const focus = page.getByRole('region', { name: 'Focused goal progress' });
  await expect(focus).toContainText('Mat consistency');
  await expect(page.locator('.arc-progress-goal')).toHaveCount(1);
  const card = page.locator('.arc-progress-goal[data-goal-id="goal-mat"]');
  await expect(card).toContainText('20% toward outcome target');
  const evidence = card.locator('.arc-progress-goal-evidence');
  await expect(evidence).toContainText('2 sessions');
  await expect(evidence).toContainText('vs 1 completed in the previous 7 days');
  await expect(evidence).toContainText('60 min');
  await expect(evidence).toContainText('1 of 2 recent completed sessions have actual duration');
  await expect(evidence).toContainText('Latest completed: Open mat');
  await expect(evidence).toContainText('Result: Good');
  await expect(card).toContainText('2 / 3');
  await expect(page.locator('.progress-recent')).toContainText('Open mat');
  await expect(page.locator('.progress-recent')).not.toContainText('Unlinked walk');

  await focus.getByRole('button', { name: 'Show all goals' }).click();
  await expect(page.locator('.arc-progress-goal')).toHaveCount(2);
  await expect(page.locator('.progress-recent')).toContainText('Unlinked walk');
  await page.reload();
  await nav(page, 'Progress').click();
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-mat"] .arc-progress-goal-evidence')).toContainText('2 sessions');
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-mat"]')).toContainText('20% toward outcome target');
});

test('one shared activity updates both goals but remains one global session', async ({ page }) => {
  await page.evaluate(today => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'goal-a', name: 'Competition preparation', type: 'BJJ', focus: 'bjj', status: 'Active' },
      { id: 'goal-b', name: 'Mat consistency', type: 'BJJ', focus: 'bjj', status: 'Active' }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'shared', date: today, title: 'Open mat', type: 'BJJ', status: 'Completed',
        goalIds: ['goal-a', 'goal-b'], actuals: { actualDurationMinutes: 80 }, sessionResult: 'Great' }
    ]));
  }, date());
  await page.reload();
  await nav(page, 'Today').click();
  await page.locator('.today-activity-list').getByRole('button', { name: 'See in Progress' }).click();
  await expect(page.getByRole('region', { name: 'Focused goal progress' })).toHaveCount(0);
  await expect(page.locator('.arc-progress-goal')).toHaveCount(2);
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-a"] .arc-progress-goal-evidence')).toContainText('80 min');
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-b"] .arc-progress-goal-evidence')).toContainText('80 min');
  await expect(page.locator('.progress-snapshot')).toContainText('1 of 1 planned sessions completed');
  await expect(page.locator('.progress-recent>div')).toHaveCount(1);

  await nav(page, 'Today').click();
  await page.locator('.today-goal-item').filter({ hasText: 'Mat consistency' })
    .getByRole('button', { name: 'View progress' }).click();
  await expect(page.getByRole('region', { name: 'Focused goal progress' })).toContainText('Mat consistency');
  await expect(page.locator('.arc-progress-goal')).toHaveCount(1);
});

test('missing actual duration stays unmeasured, even when the planned session has a duration', async ({ page }) => {
  await page.evaluate(today => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'goal-bjj', name: 'Train BJJ', type: 'BJJ', focus: 'bjj', status: 'Active' }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'no-actuals', date: today, title: 'Gi class', type: 'BJJ', status: 'Completed',
        durationMinutes: 90, goalIds: ['goal-bjj'], sessionResult: 'Great' }
    ]));
  }, date());
  await page.reload();
  await nav(page, 'Progress').click();
  const card = page.locator('.arc-progress-goal[data-goal-id="goal-bjj"]');
  await expect(card.locator('.arc-progress-goal-evidence')).toContainText('1 session');
  await expect(card.locator('.arc-progress-evidence-grid')).toContainText('0 of 1 recent completed sessions have actual duration');
  await expect(card.locator('.arc-progress-evidence-grid strong').nth(1)).toHaveText('—');
  await expect(card.locator('.arc-progress-latest')).toContainText('Result: Great');
});

test('focused Progress and evidence remain readable on a narrow screen', async ({ page }) => {
  await page.evaluate(today => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'long', name: 'Long-distance running preparation and consistency', type: 'Cardio', focus: 'running', status: 'Active',
        supportingTargets: [{ id: 'long-run', name: 'Long run', activityType: 'Cardio', frequencyPerWeek: 3 }] }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'long-session', date: today, title: 'Long run', type: 'Cardio', status: 'Completed', goalIds: ['long'] }
    ]));
  }, date());
  await page.reload();
  await page.setViewportSize({ width: 390, height: 844 });
  await nav(page, 'Today').click();
  await page.locator('.today-goal-item').getByRole('button', { name: 'View progress' }).click();
  const card = page.locator('.arc-progress-goal');
  await expect(card).toContainText('1 session');
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scroll: document.documentElement.scrollWidth,
    evidenceColumns: getComputedStyle(document.querySelector('.arc-progress-evidence-grid')!).gridTemplateColumns.split(' ').length
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport);
  expect(sizes.evidenceColumns).toBe(1);
});
