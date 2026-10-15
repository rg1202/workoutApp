import{test,expect}from'@playwright/test';

for(const width of [390,768]){
 test('Core Arc screens remain accessible at '+width+'px viewport',async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('/');
  await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
  await page.getByRole('button',{name:'Continue to Arc'}).click();
  for(const name of ['Today','Goals','Calendar','Progress']){
   const navigation=page.getByRole('button',{name,exact:true}).first();
   await navigation.click();
   await expect(page.locator('main')).toBeVisible();
   await expect(page.locator('main h1').first()).toBeVisible();
  }
 });
}

test('Mobile prescription input fits viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.getByRole('button',{name:'Today',exact:true}).first().click();
 await page.getByRole('button',{name:'Add example mobility session'}).click();
 const input=page.getByLabel('90/90 hip switches actual reps');
 await expect(input).toBeVisible();
 const bounds=await input.boundingBox();
 expect(bounds).not.toBeNull();
 expect(bounds!.x).toBeGreaterThanOrEqual(0);
 expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(391);
 await input.fill('12');
 await expect(input).toHaveValue('12');
});
