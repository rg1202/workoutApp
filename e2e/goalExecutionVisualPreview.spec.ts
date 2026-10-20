import { test, expect } from '@playwright/test';

test('temporary Progress visual preview', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
  const today = new Date().toLocaleDateString('en-CA');
  await page.evaluate(date => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'preview-bjj', name: 'Earn my blue belt', type: 'BJJ', focus: 'bjj', status: 'Active', priority: 'Primary', supportingTargets: [{ id: 'a', name: 'Gi training', activityType: 'BJJ', frequencyPerWeek: 3 }] },
      { id: 'preview-run', name: 'Complete a 10K', type: 'Cardio', focus: 'running', status: 'Active', priority: 'Supporting', supportingTargets: [{ id: 'b', name: 'Easy run', activityType: 'Cardio', frequencyPerWeek: 2 }] }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'preview-session', date, title: 'Gi training', type: 'BJJ', status: 'Completed', goalIds: ['preview-bjj'] },
      { id: 'preview-next', date, title: 'Easy run', type: 'Cardio', status: 'Planned', goalIds: ['preview-run'] }
    ]));
  }, today);
  await page.reload();
  await page.locator('aside').getByRole('button', { name: 'Progress', exact: true }).first().click();
  await expect(page.locator('.arc-progress-goal')).toHaveCount(2);
  for (const [name, width, height] of [['DESKTOP', 1440, 900], ['MOBILE', 390, 844]] as const) {
    await page.setViewportSize({ width, height });
    const dims = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, pageHeight: document.documentElement.scrollHeight }));
    console.log('ARC_PROGRESS_METRICS_' + name + '=' + JSON.stringify(dims));
    const b64 = (await page.screenshot({ type: 'jpeg', quality: 48, fullPage: true, animations: 'disabled' })).toString('base64');
    for (let i = 0, part = 0; i < b64.length; i += 1500, part++) console.log('ARC_PROGRESS_IMAGE_' + name + '_' + String(part).padStart(4, '0') + '=' + b64.slice(i, i + 1500));
  }
});
