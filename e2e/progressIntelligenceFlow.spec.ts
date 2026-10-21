import { test, expect, type Page } from '@playwright/test';

const nav = (page: Page, name: string) =>
  page.locator('aside').getByRole('button', { name, exact: true }).first();
const offset = (n = 0) => {
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

test('Progress prioritizes recovery over an uncovered weekly plan, with working navigation and a 28-day trend', async ({ page }) => {
  await page.evaluate(({ today, old }) => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'recovery', name: 'Recover well', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [{ id: 'r', name: 'Mat work', activityType: 'BJJ', frequencyPerWeek: 3 }] },
      { id: 'mat', name: 'BJJ consistency', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [{ id: 'm', name: 'Gi drills', activityType: 'BJJ', frequencyPerWeek: 2 }] },
      { id: 'unlinked', name: 'Cycle weekly', type: 'Cardio', focus: 'cycling', status: 'Active' }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'recovery-session', date: today, title: 'Hard class', type: 'BJJ', status: 'Completed',
        goalIds: ['recovery'], recoveryBody: 'Concern', recoveryNeed: 'High', recoveryNote: 'Rest recommended' },
      { id: 'mat-old', date: old, title: 'Gi training', type: 'BJJ', status: 'Completed', goalIds: ['mat'] }
    ]));
  }, { today: offset(), old: offset(-16) });
  await page.reload();
  await nav(page, 'Progress').click();
  const next = page.getByRole('region', { name: 'Suggested next moves' });
  await expect(next).toContainText('Recover well');
  await expect(next).toContainText('Recovery deserves review');
  await expect(next).toContainText('BJJ consistency');
  await expect(next).toContainText('Recorded activity gap');
  await expect(next).not.toContainText('Cycle weekly');
  await expect(next.locator('.arc-progress-next-item').first()).toContainText('Recover well');
  await expect(page.locator('.arc-progress-goal[data-goal-id="mat"] .arc-progress-intelligence')).toContainText('Recorded activity gap');
  await expect(page.locator('.arc-progress-goal[data-goal-id="mat"] .arc-progress-mini-week')).toHaveCount(4);

  await next.getByRole('button', { name: 'Review recovery' }).click();
  await expect(page.locator('#progress-recovery-signals')).toContainText('Rest recommended');
  await next.getByRole('button', { name: 'BJJ consistency' }).click();
  await expect(page.getByRole('region', { name: 'Focused goal progress' })).toContainText('BJJ consistency');
  await expect(page.locator('.arc-progress-goal')).toHaveCount(1);
  await expect(next).not.toContainText('Recover well');
  await next.getByRole('button', { name: 'Plan activity' }).click();
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  await expect(page.locator('.plan-form').getByRole('checkbox', { name: 'BJJ consistency' })).toBeChecked();
  await expect(page.getByPlaceholder(/Gi BJJ/i)).toHaveValue('Gi drills');
});

test('the suggested next move disappears after a matching session is scheduled; outcome stays unchanged', async ({ page }) => {
  await page.evaluate(today => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'goal', name: 'Training frequency', type: 'BJJ', focus: 'bjj', status: 'Active',
        current: 1, target: 8,
        supportingTargets: [{ id: 'm', name: 'Gi drills', activityType: 'BJJ', frequencyPerWeek: 1 }] }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'cardio', date: today, title: 'Easy run', type: 'Cardio', status: 'Completed', goalIds: ['goal'] }
    ]));
  }, offset());
  await page.reload();
  await nav(page, 'Progress').click();
  const next = page.getByRole('region', { name: 'Suggested next moves' });
  await expect(next).toContainText('Weekly plan has a gap');
  await next.getByRole('button', { name: 'Plan activity' }).click();
  await expect(page.locator('.plan-form').getByRole('checkbox', { name: 'Training frequency' })).toBeChecked();
  await page.getByRole('button', { name: 'Add to calendar' }).click();
  await nav(page, 'Progress').click();
  await expect(next).not.toContainText('Weekly plan has a gap');
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal"]')).toContainText('13% toward outcome target');
  await page.reload();
  await nav(page, 'Progress').click();
  await expect(next).not.toContainText('Weekly plan has a gap');
});

test('mobile trend bars and next actions are readable with no horizontal overflow', async ({ page }) => {
  await page.evaluate(today => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'goal-long', name: 'Long-distance running consistency for upcoming half marathon', type: 'Cardio', focus: 'running', status: 'Active',
        supportingTargets: [{ id: 'run', name: 'Running', activityType: 'Cardio', frequencyPerWeek: 3 }] },
      { id: 'goal-bjj', name: 'BJJ practice', type: 'BJJ', focus: 'bjj', status: 'Active' }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'run', date: today, title: 'Easy run', type: 'Cardio', status: 'Completed', goalIds: ['goal-long'] }
    ]));
  }, offset());
  await page.reload();
  await page.setViewportSize({ width: 390, height: 844 });
  await nav(page, 'Progress').click();
  await expect(page.locator('.arc-progress-next-item')).toHaveCount(2);
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-long"] .arc-progress-mini-week')).toHaveCount(4);
  const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scroll: document.documentElement.scrollWidth,
    nextColumns: getComputedStyle(document.querySelector('.arc-progress-next-list')!).gridTemplateColumns.split(' ').length,
    barColumns: getComputedStyle(document.querySelector('.arc-progress-mini-chart')!).gridTemplateColumns.split(' ').length
  }));
  expect(layout.scroll).toBeLessThanOrEqual(layout.viewport);
  expect(layout.nextColumns).toBe(1);
  expect(layout.barColumns).toBe(4);
});
