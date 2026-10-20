import { test, expect, type Page } from '@playwright/test';

const navGoals = (page: Page) => page.locator('aside').getByRole('button', { name: 'Goals', exact: true }).first();

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
});

test('focus-first Goals groups active records once and preserves legacy focus records', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'bjj-goal', name: 'Competition Prep', type: 'BJJ', status: 'Active', focus: 'bjj', priority: 'Primary' },
    { id: 'run-goal', name: '5K Running', type: 'Cardio', status: 'Active', focus: 'running' },
    { id: 'cycle-goal', name: 'Century Ride', type: 'Cardio', status: 'Active', focus: 'cycling' },
    { id: 'shared-goal', name: 'Shared Weight', type: 'Body', status: 'Active', focus: 'general', relatedFocuses: ['bjj', 'running'] },
    { id: 'legacy-goal', name: 'Legacy Strength', type: 'Strength', status: 'Active', focus: 'strength' },
    { id: 'paused-goal', name: 'Paused BJJ', type: 'BJJ', status: 'Paused', focus: 'bjj' }
  ])));
  await page.reload();
  await navGoals(page).click();

  const groups = [
    ['Brazilian Jiu-Jitsu goals', 'Competition Prep'],
    ['Running goals', '5K Running'],
    ['Cycling goals', 'Century Ride'],
    ['Shared goals', 'Shared Weight'],
    ['Other goals', 'Legacy Strength']
  ] as const;
  for (const [section, name] of groups) {
    await expect(page.getByRole('region', { name: section }).locator('.goal-card')).toContainText(name);
  }
  await expect(page.locator('.goal-card')).toHaveCount(5);
  await expect(page.getByText('Paused BJJ')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Shared goals' }).getByText(/Also supports:.*Brazilian Jiu-Jitsu.*Running/)).toBeVisible();

  const bjj = page.getByRole('region', { name: 'Brazilian Jiu-Jitsu goals' });
  await bjj.getByRole('button', { name: 'Toggle Brazilian Jiu-Jitsu goals' }).click();
  await expect(bjj.locator('.goal-card')).toHaveCount(0);
  await bjj.getByRole('button', { name: 'Toggle Brazilian Jiu-Jitsu goals' }).click();
  await expect(bjj.locator('.goal-card')).toContainText('Competition Prep');
});

test('creating from a focus preselects it and offers relevant goal presets', async ({ page }) => {
  await navGoals(page).click();
  await page.getByRole('region', { name: 'Brazilian Jiu-Jitsu goals' })
    .getByRole('button', { name: 'Add Brazilian Jiu-Jitsu goal' }).click();
  await expect(page.getByLabel('Goal focus')).toHaveValue('bjj');
  await page.getByRole('button', { name: 'Use Rank milestone goal preset' }).click();
  await expect(page.getByLabel('Goal name')).toHaveValue('Earn my next belt');
  await page.getByLabel('Goal name').fill('Earn blue belt');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create goal' }).click();
  await page.getByRole('button', { name: 'Not now' }).click();

  const bjj = page.getByRole('region', { name: 'Brazilian Jiu-Jitsu goals' });
  await expect(bjj.locator('.goal-card')).toContainText('Earn blue belt');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('workoutapp.goals.v2') || '[]'));
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({ name: 'Earn blue belt', focus: 'bjj', goalTypeV2: 'Skill', type: 'Milestone' });
  await page.reload();
  await navGoals(page).click();
  await expect(page.getByRole('region', { name: 'Brazilian Jiu-Jitsu goals' }).locator('.goal-card')).toContainText('Earn blue belt');
});

test('shared goal supports multiple focuses without duplicating the goal or changing its ID', async ({ page }) => {
  await navGoals(page).click();
  await page.getByRole('region', { name: 'Shared goals' })
    .getByRole('button', { name: 'Add shared goal' }).click();
  await expect(page.getByLabel('Goal focus')).toHaveValue('general');
  await page.getByRole('button', { name: 'Use Body composition goal preset' }).click();
  await page.getByLabel('Goal name').fill('Target weight');
  await page.getByRole('checkbox', { name: 'Brazilian Jiu-Jitsu' }).check();
  await page.getByRole('checkbox', { name: 'Running' }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Target value').fill('165');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create goal' }).click();
  await page.getByRole('button', { name: 'Not now' }).click();

  const shared = page.getByRole('region', { name: 'Shared goals' });
  await expect(shared.locator('.goal-card')).toContainText('Target weight');
  await expect(shared.getByText(/Also supports:.*Brazilian Jiu-Jitsu.*Running/)).toBeVisible();
  await expect(page.locator('.goal-card')).toHaveCount(1);
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('workoutapp.goals.v2') || '[]'));
  expect(before[0]).toMatchObject({ focus: 'general', relatedFocuses: ['bjj', 'running'], target: 165 });
  await page.reload();
  await navGoals(page).click();
  await expect(page.locator('.goal-card')).toHaveCount(1);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('workoutapp.goals.v2') || '[]'));
  expect(after[0].id).toBe(before[0].id);
  expect(after[0].relatedFocuses).toEqual(['bjj', 'running']);
});

test('unclassified legacy cardio goals use evidence from their name rather than defaulting to running', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'legacy-bike', name: 'Ride 100 miles', type: 'Cardio', status: 'Active' },
    { id: 'legacy-run', name: 'Run 10K', type: 'Cardio', status: 'Active' },
    { id: 'legacy-cardio', name: 'Aerobic capacity', type: 'Cardio', status: 'Active' }
  ])));
  await page.reload();
  await navGoals(page).click();
  await expect(page.getByRole('region', { name: 'Cycling goals' }).locator('.goal-card')).toContainText('Ride 100 miles');
  await expect(page.getByRole('region', { name: 'Running goals' }).locator('.goal-card')).toContainText('Run 10K');
  await expect(page.getByRole('region', { name: 'Shared goals' }).locator('.goal-card')).toContainText('Aerobic capacity');
});
