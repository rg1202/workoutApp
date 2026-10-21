import { test, expect, type Page } from '@playwright/test';

const nav = (page: Page, name: string) =>
  page.locator('aside').getByRole('button', { name, exact: true }).first();

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
});

test('old goals receive current-week suggestions, credit linked sessions, and do not duplicate on repeat', async ({ page }) => {
  const today = new Date().toLocaleDateString('en-CA');
  await page.evaluate(date => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'planner-bjj', name: 'Train toward blue belt', type: 'BJJ', focus: 'bjj', status: 'Active',
        startDate: '2025-01-01', deadline: '2028-01-01',
        supportingTargets: [{ id: 'target-bjj', name: 'Gi class', activityType: 'BJJ', frequencyPerWeek: 2, durationMinutes: 60 }] }
    ]));
    const sunday = new Date(date + 'T12:00:00');
    sunday.setDate(sunday.getDate() - sunday.getDay());
    const weekStart = sunday.toLocaleDateString('en-CA');
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'already-done', date: weekStart, title: 'Gi class', type: 'BJJ', status: 'Completed', goalIds: ['planner-bjj'] }
    ]));
  }, today);
  await page.reload();
  await nav(page, 'Goals').click();
  await page.locator('.goal-card').getByRole('button', { name: 'Plan on Calendar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Plan your supporting activities' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '1 week' }).click();
  await expect(dialog).toContainText('1');
  await expect(dialog.locator('.arc-week-planner-item')).toHaveCount(1);
  const date = await dialog.locator('.arc-week-planner-item input').getAttribute('aria-label');
  expect(date).toContain('Gi class on ');
  expect(date!.split(' on ')[1] >= today).toBeTruthy();
  await dialog.getByRole('button', { name: 'Add 1 to Calendar' }).click();
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1') || '[]'));
  expect(stored.filter((p: any) => p.title === 'Gi class')).toHaveLength(2);
  expect(stored.find((p: any) => p.id !== 'already-done')).toMatchObject({
    sourceType: 'Goal', sourceId: 'planner-bjj', goalIds: ['planner-bjj'], status: 'Planned'
  });
  await nav(page, 'Goals').click();
  await page.locator('.goal-card').getByRole('button', { name: 'Plan on Calendar' }).click();
  await dialog.getByRole('button', { name: '1 week' }).click();
  await expect(dialog.locator('.arc-week-planner-item')).toHaveCount(0);
  await expect(dialog).toContainText('2 existing');
  await dialog.getByRole('button', { name: 'Not now' }).click();
});

test('active BJJ injury restriction prevents automatic suggestions and preserves existing data', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'injured-bjj', name: 'BJJ practice', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [{ id: 'target-gi', name: 'BJJ class', activityType: 'BJJ', frequencyPerWeek: 2 }] }
    ]));
    localStorage.setItem('workoutapp.injuries.v1', JSON.stringify([
      { id: 'injury-one', name: 'Shoulder', bodyArea: 'Shoulder', side: 'Left', type: 'Strain',
        onsetDate: '2026-10-01', severity: 5, status: 'Active', notes: '',
        bjjRestriction: 'No rolling until reviewed' }
    ]));
  });
  await page.reload();
  await nav(page, 'Goals').click();
  await page.locator('.goal-card').getByRole('button', { name: 'Plan on Calendar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Plan your supporting activities' });
  await dialog.getByRole('button', { name: '1 week' }).click();
  await expect(dialog.locator('.arc-week-planner-item')).toHaveCount(0);
  await expect(dialog).toContainText('not suggested because of an active injury restriction');
  await expect(dialog.getByRole('button', { name: /Add .* to Calendar/ })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Not now' }).click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1') || '[]'));
  expect(stored).toHaveLength(0);
});

test('recovery cautions require opt-in and mobile layout does not overflow', async ({ page }) => {
  const today = new Date().toLocaleDateString('en-CA');
  await page.evaluate(date => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'caution-goal', name: 'Running consistency', type: 'Cardio', focus: 'running', status: 'Active', deadline: date,
        supportingTargets: [{ id: 'target-run', name: 'Easy run', activityType: 'Cardio', frequencyPerWeek: 1, durationMinutes: 40 }] }
    ]));
    localStorage.setItem('arc.daily-state.v1', JSON.stringify([{ date, energy: 1, soreness: 5, stress: 4, sleepHours: 5 }]));
  }, today);
  await page.reload();
  await nav(page, 'Goals').click();
  await page.locator('.goal-card').getByRole('button', { name: 'Plan on Calendar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Plan your supporting activities' });
  await dialog.getByRole('button', { name: '1 week' }).click();
  await expect(dialog.locator('.arc-week-planner-item')).toHaveCount(1);
  await expect(dialog).toContainText('need your review');
  const check = dialog.locator('.arc-week-planner-item input');
  await expect(check).not.toBeChecked();
  await expect(dialog.getByRole('button', { name: 'Add 0 to Calendar' })).toBeDisabled();
  await check.check();
  await expect(dialog.getByRole('button', { name: 'Add 1 to Calendar' })).toBeEnabled();
  await page.setViewportSize({ width: 390, height: 844 });
  const viewport = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
    dialogWidth: document.querySelector('.arc-week-planner')!.getBoundingClientRect().width
  }));
  expect(viewport.pageWidth).toBeLessThanOrEqual(viewport.viewportWidth);
  expect(viewport.dialogWidth).toBeLessThanOrEqual(viewport.viewportWidth);
  await dialog.getByRole('button', { name: 'Not now' }).click();
});
