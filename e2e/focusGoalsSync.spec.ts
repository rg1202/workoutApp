import { test, expect, type Page } from '@playwright/test';

const goalsNav = (page: Page) => page.locator('aside').getByRole('button', { name: 'Goals', exact: true }).first();
const manageNav = (page: Page) => page.locator('aside').getByRole('button', { name: 'Add / Manage' });
const section = (page: Page, name: string) => page.getByRole('region', { name: name + ' goals', exact: true });
const catalogFocus = (page: Page, name: string) =>
  page.locator('.arc-focus-catalog-buttons').getByRole('button', { name: new RegExp('^' + name + '\\b') });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
});

test('removing and restoring a Focus synchronizes Goals without deleting existing goals', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'bjj-1', name: 'BJJ competition', type: 'BJJ', status: 'Active', focus: 'bjj' },
    { id: 'run-1', name: 'Run a 5K', type: 'Cardio', status: 'Active', focus: 'running' },
    { id: 'cycle-1', name: 'Ride 50 miles', type: 'Cardio', status: 'Active', focus: 'cycling' },
    { id: 'shared-1', name: 'Healthy weight', type: 'Body', status: 'Active', focus: 'general', relatedFocuses: ['running', 'bjj'] }
  ])));
  await page.reload();
  await goalsNav(page).click();
  await expect(section(page, 'Running')).toContainText('Run a 5K');
  await expect(page.getByRole('region', { name: 'Shared goals' })).toContainText('Healthy weight');
  await expect(page.locator('.arc-focus-goals-total')).toContainText('4');

  await manageNav(page).click();
  await catalogFocus(page, 'Running').click();
  await page.locator('.arc-focus-detail-actions').getByRole('button', { name: 'Remove focus' }).click();
  await page.getByRole('group', { name: 'Confirm remove focus' }).getByRole('button', { name: 'Remove focus' }).click();
  await goalsNav(page).click();
  await expect(section(page, 'Running')).toHaveCount(0);
  await expect(section(page, 'Brazilian Jiu-Jitsu')).toContainText('BJJ competition');
  await expect(section(page, 'Cycling')).toContainText('Ride 50 miles');
  await expect(page.getByRole('region', { name: 'Shared goals' })).toContainText('Healthy weight');
  await expect(page.locator('.goal-card')).toHaveCount(3);
  await expect(page.locator('.arc-focus-goals-total')).toContainText('3');
  await expect(page.getByText('Also supports: Brazilian Jiu-Jitsu')).toBeVisible();

  let stored = await page.evaluate(() => JSON.parse(localStorage.getItem('workoutapp.goals.v2') || '[]'));
  expect(stored).toHaveLength(4);
  expect(stored.find((g: { id: string }) => g.id === 'run-1')).toBeTruthy();
  expect(stored.find((g: { id: string }) => g.id === 'shared-1').relatedFocuses).toEqual(['running', 'bjj']);
  await page.reload();
  await goalsNav(page).click();
  await expect(section(page, 'Running')).toHaveCount(0);

  await manageNav(page).click();
  await catalogFocus(page, 'Running').click();
  await page.locator('.arc-focus-detail-actions').getByRole('button', { name: 'Add Running' }).click();
  await goalsNav(page).click();
  await expect(section(page, 'Running')).toContainText('Run a 5K');
  await expect(page.locator('.goal-card')).toHaveCount(4);
  await expect(page.getByText('Also supports: Running, Brazilian Jiu-Jitsu')).toBeVisible();
  await page.reload();
  await goalsNav(page).click();
  await expect(section(page, 'Running')).toContainText('Run a 5K');
});

test('defocusing and refocusing via sidebar eye updates Goals immediately', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'run-2', name: 'Run 10K', type: 'Cardio', status: 'Active', focus: 'running' }
  ])));
  await page.reload();
  await goalsNav(page).click();
  await expect(section(page, 'Running')).toContainText('Run 10K');
  await page.locator('aside').getByRole('button', { name: 'Defocus Running' }).click();
  await expect(section(page, 'Running')).toHaveCount(0);
  await expect(page.locator('.goal-card')).toHaveCount(0);
  await page.reload();
  await goalsNav(page).click();
  await expect(section(page, 'Running')).toHaveCount(0);
  await page.locator('aside').getByRole('button', { name: 'Refocus Running' }).click();
  await expect(section(page, 'Running')).toContainText('Run 10K');
});

test('adding a preview Focus creates its Goals section and enables a contextual goal', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'yoga-existing', name: 'Yoga three times a week', type: 'Consistency', status: 'Active', focus: 'yoga' }
  ])));
  await page.reload();
  await goalsNav(page).click();
  await expect(section(page, 'Yoga')).toHaveCount(0);
  await expect(page.locator('.goal-card')).toHaveCount(0);

  await manageNav(page).click();
  await catalogFocus(page, 'Yoga').click();
  await page.locator('.arc-focus-detail-actions').getByRole('button', { name: 'Add Yoga' }).click();
  await goalsNav(page).click();
  await expect(section(page, 'Yoga')).toContainText('Yoga three times a week');
  await section(page, 'Yoga').getByRole('button', { name: 'Add Yoga goal' }).click();
  await expect(page.getByLabel('Goal focus')).toHaveValue('yoga');
  await expect(page.getByRole('button', { name: 'Use Practice consistency goal preset' })).toBeVisible();
  await page.getByRole('button', { name: 'Use Practice consistency goal preset' }).click();
  await expect(page.getByLabel('Goal name')).toHaveValue('Practice Yoga consistently');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create goal' }).click();
  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(section(page, 'Yoga').locator('.goal-card')).toHaveCount(2);

  await manageNav(page).click();
  await catalogFocus(page, 'Yoga').click();
  await page.locator('.arc-focus-detail-actions').getByRole('button', { name: 'Remove focus' }).click();
  await page.getByRole('group', { name: 'Confirm remove focus' }).getByRole('button', { name: 'Remove focus' }).click();
  await goalsNav(page).click();
  await expect(section(page, 'Yoga')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Other goals' })).toHaveCount(0);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('workoutapp.goals.v2') || '[]'));
  expect(stored.filter((g: { focus: string }) => g.focus === 'yoga')).toHaveLength(2);
  await manageNav(page).click();
  await catalogFocus(page, 'Yoga').click();
  await page.locator('.arc-focus-detail-actions').getByRole('button', { name: 'Add Yoga' }).click();
  await goalsNav(page).click();
  await expect(section(page, 'Yoga').locator('.goal-card')).toHaveCount(2);
});
