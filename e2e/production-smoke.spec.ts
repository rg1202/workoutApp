import {test,expect} from '@playwright/test';
// The settings navigation is responsive; use a deterministic desktop viewport.
test('integration entry is accessible in development',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 const entry=page.getByRole('button',{name:/integrations/i}).first();
 await expect(entry).toBeAttached();
 await entry.evaluate((element:HTMLElement)=>element.click());
 await expect(page.getByRole('heading',{name:'Integrations'})).toBeVisible();
});
