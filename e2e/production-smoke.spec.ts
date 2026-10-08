import {test,expect} from '@playwright/test';
test('production preview keeps development integrations unavailable',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/integrations/i}).first().click();
 await expect(page.getByText('External account connections are unavailable in this release.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Connect Strava'})).toHaveCount(0);
});
