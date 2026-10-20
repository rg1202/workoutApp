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

test('Progress plans a linked activity, Today completes it, and Progress reflects execution after reload', async ({ page }) => {
  const today = new Date().toLocaleDateString('en-CA');
  await page.evaluate(date => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'goal-bjj-flow', name: 'BJJ competition', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [{ id: 'target-drills', name: 'BJJ drills', activityType: 'BJJ', frequencyPerWeek: 2, durationMinutes: 45 }] },
      { id: 'goal-run-flow', name: 'Run a 10K', type: 'Cardio', focus: 'running', status: 'Active' }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'session-bjj', date, title: 'BJJ open mat', type: 'BJJ', status: 'Completed', goalIds: ['goal-bjj-flow'] },
      { id: 'session-unlinked', date, title: 'Unlinked recovery', type: 'Recovery', status: 'Completed' }
    ]));
  }, today);
  await page.reload();
  await nav(page, 'Progress').click();

  const bjj = page.locator('.arc-progress-goal[data-goal-id="goal-bjj-flow"]');
  const running = page.locator('.arc-progress-goal[data-goal-id="goal-run-flow"]');
  await expect(bjj).toContainText('1 / 2');
  await expect(bjj).toContainText('Needs attention');
  await expect(running).toContainText('No schedule');
  await expect(page.locator('.progress-recent').getByText(/Supports: BJJ competition/)).toBeVisible();

  await bjj.getByRole('button', { name: 'Plan activity for BJJ competition' }).click();
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  await expect(page.getByPlaceholder(/Gi BJJ/i)).toHaveValue('BJJ drills');
  await expect(page.locator('.plan-form').getByRole('checkbox', { name: 'BJJ competition' })).toBeChecked();
  await expect(page.locator('.plan-form').getByRole('checkbox', { name: 'Run a 10K' })).not.toBeChecked();
  await expect(page.locator('.plan-form').getByText('BJJ', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Add to calendar' }).click();

  await expect.poll(() => page.evaluate(() => {
    const plans = JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1') || '[]');
    return plans.find((p: any) => p.title === 'BJJ drills')?.goalIds;
  })).toEqual(['goal-bjj-flow']);

  await nav(page, 'Today').click();
  await expect(page.locator('.today-goal-intelligence')).toContainText('BJJ drills');
  await page.getByRole('button', { name: 'Mark BJJ drills complete' }).click();

  await nav(page, 'Progress').click();
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-bjj-flow"]')).toContainText('2 / 2');
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-bjj-flow"]')).toContainText('On pace');
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-run-flow"]')).toContainText('No schedule');
  await page.reload();
  await nav(page, 'Progress').click();
  await expect(page.locator('.arc-progress-goal[data-goal-id="goal-bjj-flow"]')).toContainText('2 / 2');
});

test('Today can plan for an active goal without a supporting template', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'goal-bjj-untargeted', name: 'Practice guard retention', type: 'BJJ', focus: 'bjj', status: 'Active' }
  ])));
  await page.reload();
  await nav(page, 'Today').click();
  const card = page.locator('.today-goal-item').filter({ hasText: 'Practice guard retention' });
  await card.getByRole('button', { name: 'Plan next activity' }).click();
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  await expect(page.locator('.plan-form').getByRole('checkbox', { name: 'Practice guard retention' })).toBeChecked();
  await expect(page.locator('.plan-form select').first()).toHaveValue('BJJ');
  await page.getByPlaceholder(/Gi BJJ/i).fill('Guard retention drills');
  await page.getByRole('button', { name: 'Add to calendar' }).click();
  await nav(page, 'Today').click();
  await expect(card).toContainText('Guard retention drills');
});

test('one multi-goal session contributes once to global execution and to each explicitly linked goal', async ({ page }) => {
  const today = new Date().toLocaleDateString('en-CA');
  await page.evaluate(date => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'g-one', name: 'Goal one', type: 'BJJ', focus: 'bjj', status: 'Active', supportingTargets: [{ id: 'a', name: 'Mat time', activityType: 'BJJ', frequencyPerWeek: 1 }] },
      { id: 'g-two', name: 'Goal two', type: 'BJJ', focus: 'bjj', status: 'Active', supportingTargets: [{ id: 'b', name: 'Mat time', activityType: 'BJJ', frequencyPerWeek: 1 }] }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'shared-session', date, title: 'Mat time', type: 'BJJ', status: 'Completed', goalIds: ['g-one', 'g-two'] }
    ]));
  }, today);
  await page.reload();
  await nav(page, 'Progress').click();
  await expect(page.locator('.arc-progress-goal[data-goal-id="g-one"]')).toContainText('1 / 1');
  await expect(page.locator('.arc-progress-goal[data-goal-id="g-two"]')).toContainText('1 / 1');
  await expect(page.locator('.progress-snapshot').first()).toContainText('1 of 1 planned sessions completed');
  await expect(page.locator('.progress-recent')).toContainText('Supports: Goal one, Goal two');
});
