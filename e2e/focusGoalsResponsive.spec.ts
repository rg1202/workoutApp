import { test, expect } from '@playwright/test';

test('Focus-first Goals stays compact and avoids horizontal overflow on mobile', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'visual-bjj', name: 'Earn my next belt', type: 'BJJ', status: 'Active', focus: 'bjj', priority: 'Primary' },
    { id: 'visual-running', name: 'Complete a 10K', type: 'Cardio', status: 'Active', focus: 'running' },
    { id: 'visual-cycling', name: 'Ride 100 miles', type: 'Cardio', status: 'Active', focus: 'cycling', target: 100, current: 30 },
    { id: 'visual-shared', name: 'Reach my target weight', type: 'Body', status: 'Active', focus: 'general', start: 205, target: 165, current: 195, relatedFocuses: ['bjj', 'running'] }
  ])));
  await page.reload();
  await page.locator('aside').getByRole('button', { name: 'Goals', exact: true }).first().click();
  await expect(page.locator('.arc-goal-focus-section')).toHaveCount(4);

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      headerHeight: document.querySelector('.arc-goals-page-header')?.getBoundingClientRect().height ?? Infinity
    }));
    expect(dimensions.scrollWidth, `No horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewportWidth);
    if (width === 390) {
      expect(dimensions.headerHeight, 'Mobile Goals header should not contain excess vertical space').toBeLessThan(210);
      await expect(page.getByRole('button', { name: 'New goal' })).toBeVisible();
    }
  }
});
