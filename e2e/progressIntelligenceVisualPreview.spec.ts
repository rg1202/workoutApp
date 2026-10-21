import { test, expect } from '@playwright/test';
const date = (n = 0) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};
test('temporary Progress Intelligence desktop/mobile visual preview', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
  await page.evaluate(({ today, old, prior, recent }) => {
    localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
      { id: 'bjj', name: 'Build my BJJ competition game', type: 'BJJ', focus: 'bjj', status: 'Active', current: 3, target: 10,
        supportingTargets: [{ id: 't1', name: 'Gi practice', activityType: 'BJJ', frequencyPerWeek: 3 }] },
      { id: 'run', name: 'Run a faster 10K', type: 'Cardio', focus: 'running', status: 'Active',
        supportingTargets: [{ id: 't2', name: 'Easy run', activityType: 'Cardio', frequencyPerWeek: 2 }] },
      { id: 'weight', name: 'Reach my target weight', type: 'Body', focus: 'general', status: 'Active', start: 205, current: 195, target: 165 }
    ]));
    localStorage.setItem('workoutapp.planned-activities.v1', JSON.stringify([
      { id: 'bjj1', date: today, title: 'Open mat', type: 'BJJ', status: 'Completed', goalIds: ['bjj'],
        recoveryBody: 'Concern', recoveryNeed: 'High', recoveryNote: 'Rest and reassess', actuals: { actualDurationMinutes: 75 } },
      { id: 'bjj2', date: recent, title: 'Competition drills', type: 'BJJ', status: 'Completed', goalIds: ['bjj'], actuals: { actualDurationMinutes: 50 } },
      { id: 'bjj3', date: prior, title: 'Gi class', type: 'BJJ', status: 'Completed', goalIds: ['bjj'] },
      { id: 'run1', date: old, title: 'Tempo run', type: 'Cardio', status: 'Completed', goalIds: ['run'] }
    ]));
  }, { today: date(), old: date(-18), prior: date(-9), recent: date(-2) });
  await page.reload();
  await page.locator('aside').getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(page.locator('.arc-progress-next-item')).toHaveCount(2);
  console.log('ARC_INTELLIGENCE_DESKTOP_JPEG=' + (await page.screenshot({ type: 'jpeg', quality: 38 })).toString('base64'));
  await page.locator('.arc-progress-intelligence').first().scrollIntoViewIfNeeded();
  console.log('ARC_INTELLIGENCE_DESKTOP_CARD_JPEG=' + (await page.screenshot({ type: 'jpeg', quality: 38 })).toString('base64'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  console.log('ARC_INTELLIGENCE_MOBILE_TOP_JPEG=' + (await page.screenshot({ type: 'jpeg', quality: 40 })).toString('base64'));
  await page.locator('.arc-progress-intelligence').first().scrollIntoViewIfNeeded();
  console.log('ARC_INTELLIGENCE_MOBILE_CARD_JPEG=' + (await page.screenshot({ type: 'jpeg', quality: 42 })).toString('base64'));
});
