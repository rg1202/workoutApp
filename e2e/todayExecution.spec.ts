import { test, expect, type Page } from '@playwright/test';

const nav = (page: Page, name: string) =>
  page.locator('aside').getByRole('button', { name, exact: true }).first();

const localDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
});

test('Today separates completed, scheduled, and missing weekly goal support', async ({ page }) => {
  const today = localDate();
  await page.evaluate(today => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'bjj-execution', name: 'BJJ preparation', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [{ id: 'bjj-week', name: 'Gi drilling', activityType: 'BJJ', frequencyPerWeek: 2, durationMinutes: 60 }] },
      { id: 'run-execution', name: 'Run three times', type: 'Cardio', focus: 'running', status: 'Active',
        supportingTargets: [{ id: 'run-week', name: 'Easy run', activityType: 'Cardio', frequencyPerWeek: 1, durationMinutes: 30 }] }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'done-bjj', date: today, title: 'Gi drilling done', type: 'BJJ', status: 'Completed', goalIds: ['bjj-execution'] },
      { id: 'next-bjj', date: today, title: 'Gi drilling next', type: 'BJJ', status: 'Planned', goalIds: ['bjj-execution'] },
      { id: 'other', date: today, title: 'Mobility reset', type: 'Mobility', status: 'Planned' }
    ]));
  }, today);
  await page.reload();
  await nav(page, 'Today').click();

  const summary = page.getByRole('region', { name: "Today's execution overview" });
  await expect(summary).toContainText('2 to do');
  await expect(summary).toContainText('1 completed');
  await expect(summary).toContainText('2 goal-linked');
  await expect(summary).toContainText('Run three times');
  await expect(summary).toContainText('1 to schedule');
  await expect(summary).not.toContainText('BJJ preparation');

  const bjj = page.locator('.today-goal-item').filter({ hasText: 'BJJ preparation' });
  await expect(bjj).toContainText('Week covered');
  await expect(bjj).toContainText('1 completed · 1 scheduled · 0 still to schedule');
  const running = page.locator('.today-goal-item').filter({ hasText: 'Run three times' });
  await expect(running).toContainText('Needs scheduling');

  const timeline = page.locator('.today-activity-list');
  await expect(timeline.getByText('Supports: BJJ preparation')).toHaveCount(2);
  await expect(timeline.getByText('Mobility reset')).toBeVisible();
  await expect(timeline.locator('.today-timeline-goal-link')).toHaveCount(2);

  await bjj.getByRole('button', { name: 'View schedule' }).click();
  const focused = page.getByRole('region', { name: 'Selected goal Calendar filter' });
  await expect(focused).toContainText('BJJ preparation');
  await expect(page.getByText('○ Gi drilling next')).toBeVisible();
  await expect(page.getByText('○ Mobility reset')).toHaveCount(0);
  await focused.getByRole('button', { name: 'Show all activities' }).click();
  await expect(page.getByText('○ Mobility reset')).toBeVisible();
});

test('a session supporting two goals appears once in the Today timeline', async ({ page }) => {
  const today = localDate();
  await page.evaluate(today => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'first', name: 'Competition prep', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [{ id: 't1', name: 'Mat time', activityType: 'BJJ', frequencyPerWeek: 1 }] },
      { id: 'second', name: 'Mat consistency', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [{ id: 't2', name: 'Mat time', activityType: 'BJJ', frequencyPerWeek: 1 }] }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'shared', date: today, title: 'Open mat', type: 'BJJ', status: 'Completed', goalIds: ['first', 'second'] }
    ]));
  }, today);
  await page.reload();
  await nav(page, 'Today').click();
  const summary = page.getByRole('region', { name: "Today's execution overview" });
  await expect(summary).toContainText('0 to do');
  await expect(summary).toContainText('1 completed');
  await expect(summary).toContainText('1 goal-linked');
  await expect(summary).toContainText('All tracked weekly goal-support targets');
  const timeline = page.locator('.today-activity-list');
  await expect(timeline.locator('.today-activity-main')).toHaveCount(1);
  await expect(timeline.locator('.today-timeline-goal-link')).toHaveText('Supports: Competition prep, Mat consistency');
  await expect(page.locator('.today-goal-week-status.covered')).toHaveCount(2);
});

test('a past uncompleted session and cross-training do not satisfy the weekly target', async ({ page }) => {
  test.skip(new Date().getDay() === 0, 'A Sunday has no earlier day in its calendar week');
  const today = localDate(), yesterday = localDate(-1);
  await page.evaluate(({ today, yesterday }) => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'overdue-bjj', name: 'Guard retention', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [{ id: 'target-bjj', name: 'BJJ session', activityType: 'BJJ', frequencyPerWeek: 1 }] }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'overdue', date: yesterday, title: 'Missed drilling', type: 'BJJ', status: 'Planned', goalIds: ['overdue-bjj'] },
      { id: 'cross-training', date: today, title: 'Recovery run', type: 'Cardio', status: 'Completed', goalIds: ['overdue-bjj'] }
    ]));
  }, { today, yesterday });
  await page.reload();
  await nav(page, 'Today').click();
  const summary = page.getByRole('region', { name: "Today's execution overview" });
  await expect(summary).toContainText('Guard retention');
  await expect(summary).toContainText('1 to schedule');
  await expect(summary).toContainText('1 past-due');
  const goal = page.locator('.today-goal-item').filter({ hasText: 'Guard retention' });
  await expect(goal).toContainText('Needs scheduling');
  await expect(goal).toContainText('0 completed · 0 scheduled · 1 still to schedule');
});

test('Today Plan activity fills a weekly gap and survives reload', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'fill-bjj', name: 'Two gi sessions', type: 'BJJ', focus: 'bjj', status: 'Active',
      supportingTargets: [{ id: 'gi-target', name: 'Gi practice', activityType: 'BJJ', frequencyPerWeek: 1, durationMinutes: 75 }] }
  ])));
  await page.reload();
  await nav(page, 'Today').click();
  const summary = page.getByRole('region', { name: "Today's execution overview" });
  await expect(summary).toContainText('Two gi sessions');
  await summary.getByRole('button', { name: 'Plan activity' }).click();
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  const form = page.locator('.plan-form');
  await expect(form.getByPlaceholder(/Gi BJJ/i)).toHaveValue('Gi practice');
  await expect(form.getByRole('checkbox', { name: 'Two gi sessions' })).toBeChecked();
  await form.getByRole('button', { name: 'Add to calendar' }).click();

  await nav(page, 'Today').click();
  await expect(summary).toContainText('All tracked weekly goal-support targets');
  const goal = page.locator('.today-goal-item').filter({ hasText: 'Two gi sessions' });
  await expect(goal).toContainText('Week covered');
  await expect(goal).toContainText('0 completed · 1 scheduled · 0 still to schedule');
  await expect(page.locator('.today-activity-list .today-timeline-goal-link')).toHaveText('Supports: Two gi sessions');

  await page.reload();
  await nav(page, 'Today').click();
  await expect(page.locator('.today-goal-item').filter({ hasText: 'Two gi sessions' })).toContainText('Week covered');
});

test('Today execution remains readable at phone width', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'long-goal', name: 'Long distance endurance and running consistency', type: 'Cardio', focus: 'running', status: 'Active',
      supportingTargets: [{ id: 'run-target', name: 'Long run', activityType: 'Cardio', frequencyPerWeek: 3 }] }
  ])));
  await page.reload();
  await page.setViewportSize({ width: 390, height: 844 });
  await nav(page, 'Today').click();
  await expect(page.getByRole('region', { name: "Today's execution overview" })).toBeVisible();
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport);
});
