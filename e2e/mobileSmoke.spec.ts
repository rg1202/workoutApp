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

for(const width of [390,768]){
 test('Core pages do not overflow horizontally at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('/');
  await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
  await page.getByRole('button',{name:'Continue to Arc'}).click();
  for(const name of ['Today','Goals','Calendar','Progress']){
   await page.getByRole('button',{name,exact:true}).first().click();
   const overflow=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}));
   if(overflow.document>overflow.viewport+2){
    const offenders=await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).map(el=>({tag:el.tagName,classes:typeof el.className==='string'?el.className.slice(0,100):'',width:Math.round(el.getBoundingClientRect().width),right:Math.round(el.getBoundingClientRect().right),scroll:el.scrollWidth})).filter(x=>x.right>document.documentElement.clientWidth+2&&x.width>0).sort((a,b)=>b.right-a.right).slice(0,12));
    console.log('Horizontal overflow diagnostics',name,width,JSON.stringify(offenders));
   }
   expect(overflow.document, name+' overflow at '+width+'px').toBeLessThanOrEqual(overflow.viewport+2);
  }
 });
}

test('Phone navigation exposes accessible active tabs with touch-sized targets',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 const nav=page.getByRole('navigation',{name:'Primary navigation'});
 for(const name of ['Goals','Calendar','Today','Progress']){
  const tab=nav.getByRole('button',{name,exact:true});
  await tab.click();
  await expect(tab).toHaveAttribute('aria-current','page');
  const bounds=await tab.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.height).toBeGreaterThanOrEqual(44);
  expect(bounds!.width).toBeGreaterThanOrEqual(44);
 }
});
