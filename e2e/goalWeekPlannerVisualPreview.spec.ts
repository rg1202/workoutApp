import { test, expect } from '@playwright/test';

test('temporary smart planner visual preview', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
  const today = new Date().toLocaleDateString('en-CA');
  await page.evaluate(date => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'visual-bjj', name: 'Earn my blue belt', type: 'BJJ', focus: 'bjj', status: 'Active',
        supportingTargets: [
          { id: 'gi', name: 'Gi training', activityType: 'BJJ', frequencyPerWeek: 3, durationMinutes: 90 },
          { id: 'mobility', name: 'Mobility and stretching', activityType: 'Mobility', frequencyPerWeek: 2, durationMinutes: 20 }
        ] }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'busy', date, title: 'Strength training', type: 'Strength', status: 'Planned', durationMinutes: 60 }
    ]));
  }, today);
  await page.reload();
  await page.locator('aside').getByRole('button', { name: 'Goals', exact: true }).first().click();
  await page.locator('.goal-card').getByRole('button', { name: 'Plan on Calendar' }).click();
  await expect(page.getByRole('dialog', { name: 'Plan your supporting activities' })).toBeVisible();
  for (const [name, width, height] of [['DESKTOP', 1440, 900], ['MOBILE', 390, 844]] as const) {
    await page.setViewportSize({ width, height });
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      dialogWidth: document.querySelector('.arc-week-planner')!.getBoundingClientRect().width
    }));
    console.log('ARC_WEEK_PLANNER_METRICS_' + name + '=' + JSON.stringify(dims));
    const b64 = (await page.screenshot({ type: 'jpeg', quality: 48, animations: 'disabled' })).toString('base64');
    for (let i = 0, part = 0; i < b64.length; i += 1500, part++)
      console.log('ARC_WEEK_PLANNER_IMAGE_' + name + '_' + String(part).padStart(4, '0') + '=' + b64.slice(i, i + 1500));
  }
});
