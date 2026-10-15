import {test,expect} from '@playwright/test';
test('production build serves Arc and blocks development-only Strava connection',async({page})=>{
 const calls:string[]=[];
 page.on('request',request=>{if(request.url().includes(':8787/api/strava/'))calls.push(request.url())});
 await page.goto('/');
 await expect(page).toHaveTitle(/Arc/);
 await expect(page.locator('body')).toContainText('Arc');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await expect(page.getByRole('button',{name:/integrations/i}).first()).toBeAttached();
 await page.getByRole('button',{name:/integrations/i}).first().evaluate((element:HTMLElement)=>element.click());
 await expect(page.getByText('External account connections are unavailable in this release.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Connect Strava'})).toHaveCount(0);
 expect(calls).toEqual([]);
});

test('production app reload preserves local browser storage',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>localStorage.setItem('arc.release-smoke.v1',JSON.stringify({check:'persisted'})));
 await page.reload();
 const value=await page.evaluate(()=>localStorage.getItem('arc.release-smoke.v1'));
 expect(JSON.parse(value||'null')).toEqual({check:'persisted'});
 await page.evaluate(()=>localStorage.removeItem('arc.release-smoke.v1'));
});

test('production build retains pilot warning and supports core navigation on phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.getByText(/no cloud backup, Arc account, or cross-device sync/i)).toBeVisible();
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 const nav=page.getByRole('navigation',{name:'Primary navigation'});
 for(const name of ['Goals','Calendar','Today','Progress']){
  const tab=nav.getByRole('button',{name,exact:true});
  await tab.click();
  await expect(tab).toHaveAttribute('aria-current','page');
  await expect(page.locator('main h1').first()).toBeVisible();
 }
 const width=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
 expect(width.content).toBeLessThanOrEqual(width.viewport+2);
});
