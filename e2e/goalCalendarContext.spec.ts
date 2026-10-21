import { test, expect, type Page } from '@playwright/test';

const nav = (page: Page, name: string) =>
  page.locator('aside').getByRole('button', { name, exact: true }).first();

const localDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};

const goal = {
  id: 'goal-calendar-bjj',
  name: 'BJJ competition preparation',
  type: 'BJJ',
  status: 'Active',
  focus: 'bjj',
  supportingTargets: [
    { id: 'drilling-target', name: 'Competition drilling', activityType: 'BJJ', frequencyPerWeek: 2, durationMinutes: 75 }
  ]
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
});

test('View Calendar opens on the next linked session and filters unrelated plans', async ({ page }) => {
  const date = localDate(3);
  await page.evaluate(({ goal, date }) => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      goal,
      { id: 'goal-calendar-run', name: 'Running goal', type: 'Cardio', status: 'Active', focus: 'running' }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'legacy-bjj-plan', date, title: 'BJJ drilling', type: 'BJJ', status: 'Planned', sourceType: 'Goal', sourceId: goal.id },
      { id: 'run-plan', date, title: 'Tempo running', type: 'Cardio', status: 'Planned', goalIds: ['goal-calendar-run'] }
    ]));
  }, { goal, date });
  await page.reload();
  await nav(page, 'Goals').click();
  await page.getByRole('region', { name: 'Brazilian Jiu-Jitsu goals' })
    .getByRole('button', { name: 'View Calendar' }).click();

  const context = page.getByRole('region', { name: 'Selected goal Calendar filter' });
  await expect(context).toContainText('BJJ competition preparation');
  await expect(context).toContainText('1 linked activity');
  await expect(page.locator('.cal-week [data-date="' + date + '"]')).toBeVisible();
  await expect(page.getByText('○ BJJ drilling')).toBeVisible();
  await expect(page.getByText('○ Tempo running')).toHaveCount(0);
  await expect(page.locator('.cal-summary')).toContainText('1');
  await expect(page.locator('.cal-goal-coverage')).toContainText('BJJ competition preparation');
  await expect(page.locator('.cal-goal-coverage')).not.toContainText('Running goal');

  await context.getByRole('button', { name: 'Show all activities' }).click();
  await expect(context).toHaveCount(0);
  await expect(page.getByText('○ Tempo running')).toBeVisible();
  await expect(page.getByText('○ BJJ drilling')).toBeVisible();
});

test('Plan for this goal preselects the goal and retains the link after saving', async ({ page }) => {
  await page.evaluate(goal => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([goal])), goal);
  await page.reload();
  await nav(page, 'Goals').click();
  await page.getByRole('region', { name: 'Brazilian Jiu-Jitsu goals' })
    .getByRole('button', { name: 'View Calendar' }).click();

  const context = page.getByRole('region', { name: 'Selected goal Calendar filter' });
  await expect(context).toContainText('No activities linked to this goal yet');
  await context.getByRole('button', { name: 'Plan for this goal' }).click();
  const form = page.locator('.plan-form');
  await expect(form.getByPlaceholder(/Gi BJJ/i)).toHaveValue('Competition drilling');
  await expect(form.locator('select')).toHaveValue('BJJ');
  await expect(form.getByRole('checkbox', { name: 'BJJ competition preparation' })).toBeChecked();
  await form.getByPlaceholder(/Gi BJJ/i).fill('Extra gi class');
  await form.getByRole('button', { name: 'Add to calendar' }).click();
  await expect(page.getByText('○ Extra gi class')).toBeVisible();
  await expect(context).toContainText('1 linked activity');

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1') || '[]'));
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({ title: 'Extra gi class', type: 'BJJ', goalIds: [goal.id] });

  await page.reload();
  await nav(page, 'Goals').click();
  await page.getByRole('region', { name: 'Brazilian Jiu-Jitsu goals' })
    .getByRole('button', { name: 'View Calendar' }).click();
  await expect(page.getByText('○ Extra gi class')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Selected goal Calendar filter' })).toContainText('1 linked activity');
});

test('unfiltered Calendar remains the default when opened directly', async ({ page }) => {
  const date = localDate(0);
  await page.evaluate(date => {
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'plain-plan', date, title: 'Ordinary training', type: 'Strength', status: 'Planned' }
    ]));
  }, date);
  await page.reload();
  await nav(page, 'Calendar').click();
  await expect(page.getByRole('region', { name: 'Selected goal Calendar filter' })).toHaveCount(0);
  await expect(page.getByText('○ Ordinary training')).toBeVisible();
  await page.getByRole('button', { name: '+ Plan activity' }).click();
  await expect(page.locator('.plan-form').locator('input[type="checkbox"]:checked')).toHaveCount(0);
});
