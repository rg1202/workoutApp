import { test, expect } from '@playwright/test';

test('temporary visual preview of Progress execution evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
  const date = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };
  await page.evaluate(({ today, recent, previous }) => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'visual-bjj', name: 'Build my BJJ competition game', type: 'BJJ', focus: 'bjj', status: 'Active', current: 3, target: 10,
        supportingTargets: [{ id: 't-bjj', name: 'Gi drilling', activityType: 'BJJ', frequencyPerWeek: 3 }] },
      { id: 'visual-run', name: 'Run a faster 10K', type: 'Cardio', focus: 'running', status: 'Active',
        supportingTargets: [{ id: 't-run', name: 'Easy run', activityType: 'Cardio', frequencyPerWeek: 2 }] },
      { id: 'visual-weight', name: 'Reach target weight', type: 'Body', focus: 'general', status: 'Active', start: 205, current: 195, target: 165, unit: 'lb' }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'bjj1', date: today, time: '18:00', title: 'Open mat', type: 'BJJ', status: 'Completed', goalIds: ['visual-bjj'], actuals: { actualDurationMinutes: 75 }, sessionResult: 'Great' },
      { id: 'bjj2', date: recent, title: 'Competition drills', type: 'BJJ', status: 'Completed', goalIds: ['visual-bjj'], actuals: { actualDurationMinutes: 50 } },
      { id: 'bjj3', date: previous, title: 'Gi class', type: 'BJJ', status: 'Completed', goalIds: ['visual-bjj'] },
      { id: 'run1', date: today, title: 'Easy aerobic run', type: 'Cardio', status: 'Planned', goalIds: ['visual-run'], durationMinutes: 45 }
    ]));
  }, { today: date(0), recent: date(-2), previous: date(-9) });
  await page.reload();
  await page.locator('aside').getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(page.locator('.arc-progress-goal')).toHaveCount(3);
  await expect(page.locator('.arc-progress-goal-evidence').first()).toBeVisible();
  const desktop = await page.screenshot({ type: 'jpeg', quality: 38 });
  console.log('ARC_PROGRESS_DESKTOP_JPEG=' + desktop.toString('base64'));

  await page.setViewportSize({ width: 390, height: 844 });
  const top = await page.screenshot({ type: 'jpeg', quality: 38 });
  console.log('ARC_PROGRESS_MOBILE_TOP_JPEG=' + top.toString('base64'));
  await page.locator('.arc-progress-goal-evidence').first().scrollIntoViewIfNeeded();
  const card = await page.screenshot({ type: 'jpeg', quality: 42 });
  console.log('ARC_PROGRESS_MOBILE_CARD_JPEG=' + card.toString('base64'));
});
