import {test,expect} from '@playwright/test';
test('production build serves Arc and blocks development-only Strava connection',async({page})=>{
 const calls:string[]=[];
 page.on('request',request=>{if(request.url().includes(':8787/api/strava/'))calls.push(request.url())});
 await page.goto('/');
 await expect(page).toHaveTitle(/Arc/);
 await expect(page.locator('body')).toContainText('Arc');
 await expect(page.getByRole('button',{name:/integrations/i}).first()).toBeAttached();
 await page.getByRole('button',{name:/integrations/i}).first().evaluate((element:HTMLElement)=>element.click());
 await expect(page.getByText('External account connections are unavailable in this release.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Connect Strava'})).toHaveCount(0);
 expect(calls).toEqual([]);
});
