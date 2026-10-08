import {test,expect} from '@playwright/test';
// This suite runs against the Vite development server; production checks require a separate preview job.
test('integration entry is accessible in development',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/integrations/i}).first().click();
 await expect(page.getByRole('heading',{name:'Integrations'})).toBeVisible();
});
