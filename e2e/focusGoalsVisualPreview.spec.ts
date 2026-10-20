import { test, expect } from '@playwright/test';

// Temporary visual review fixture for PR #2. Uses synthetic goals only.
test('capture Focus-first Goals at desktop and mobile sizes', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('checkbox', { name: /I have read and understand this private beta notice/i }).check();
  await page.getByRole('button', { name: 'Continue to Arc' }).click();
  await page.evaluate(() => localStorage.setItem('workoutapp.goals.v2', JSON.stringify([
    { id: 'v-bjj', name: 'Earn my blue belt', type: 'BJJ', status: 'Active', focus: 'bjj', priority: 'Primary', goalTypeV2: 'Skill' },
    { id: 'v-run', name: 'Complete a 10K', type: 'Cardio', status: 'Active', focus: 'running', priority: 'Supporting', goalTypeV2: 'Event' },
    { id: 'v-cycle', name: 'Ride 100 miles', type: 'Cardio', status: 'Active', focus: 'cycling', priority: 'Maintenance', goalTypeV2: 'Performance', metric: 'Distance', unit: 'mi', target: 100, current: 30 },
    { id: 'v-shared', name: 'Reach my target weight', type: 'Body', status: 'Active', focus: 'general', priority: 'Primary', goalTypeV2: 'Body Composition', metric: 'Bodyweight', unit: 'lb', target: 165, current: 195, relatedFocuses: ['bjj', 'running'] }
  ])));
  await page.reload();
  await page.locator('aside').getByRole('button', { name: 'Goals', exact: true }).first().click();
  await expect(page.getByRole('region', { name: 'Brazilian Jiu-Jitsu goals' }).locator('.goal-card')).toHaveCount(1);

  const capture = async (name: string, width: number, height: number) => {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      pageHeight: document.documentElement.scrollHeight
    }));
    console.log('ARC_VISUAL_METRICS_' + name + '=' + JSON.stringify(dimensions));
    const headerDebug = await page.evaluate(() => {
      const el = document.querySelector('.arc-goals-page-header');
      const children = Array.from(el?.children ?? []);
      const describe = (node: Element) => {
        const rect = node.getBoundingClientRect();
        const css = getComputedStyle(node);
        return { tag: node.tagName, className: node.className, x: rect.x, y: rect.y, w: rect.width, h: rect.height, marginTop: css.marginTop, marginBottom: css.marginBottom, minHeight: css.minHeight, height: css.height, alignContent: css.alignContent, alignItems: css.alignItems, flex: css.flex, position: css.position };
      };
      return el ? { header: describe(el), children: children.map(describe) } : null;
    });
    console.log('ARC_VISUAL_HEADER_' + name + '=' + JSON.stringify(headerDebug));
    const bytes = await page.screenshot({ type: 'jpeg', quality: 48, fullPage: true, animations: 'disabled' });
    const base64 = bytes.toString('base64');
    for (let offset = 0, part = 0; offset < base64.length; offset += 1500, part++) {
      console.log('ARC_VISUAL_IMAGE_' + name + '_' + String(part).padStart(4, '0') + '=' + base64.slice(offset, offset + 1500));
    }
  };

  await capture('DESKTOP', 1440, 900);
  await capture('MOBILE', 390, 844);
});
