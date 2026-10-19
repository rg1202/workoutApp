import{test,expect}from'@playwright/test';

test('BJJ goal progress separates class attendance from supporting mobility',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.evaluate(()=>{
  const day=new Date().toLocaleDateString('en-CA');
  localStorage.setItem('workoutapp.goals.v2',JSON.stringify([{id:'goal:bjj-test',name:'BJJ consistency test',type:'BJJ',status:'Active'}]));
  localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([
   {id:'bjj-class',date:day,title:'BJJ class',type:'BJJ',status:'Completed',goalIds:['goal:bjj-test']},
   {id:'mobility-session',date:day,title:'Mobility support',type:'Mobility',status:'Completed',goalIds:['goal:bjj-test']}
  ]));
 });
 await page.reload();
 await page.getByRole('button',{name:'Progress',exact:true}).first().click();
 await expect(page.getByText('1 BJJ classes attended · 1 other supporting sessions (7 days)')).toBeVisible();
});


test('Goal contribution counts rescheduled program session once and separates supporting work',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.evaluate(()=>{
  const day=new Date().toLocaleDateString('en-CA');
  localStorage.setItem('workoutapp.goals.v2',JSON.stringify([{id:'goal:integrity',name:'BJJ attribution integrity',type:'BJJ',status:'Active'}]));
  localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([
   {id:'program:mobility:1:day',date:day,title:'Mobility recovery',type:'Mobility',status:'Completed',goalIds:['goal:integrity'],programId:'mobility',linkedActivityId:'actual:mobility'},
   {id:'manual:rescheduled',date:day,title:'Mobility recovery',type:'Mobility',status:'Planned',goalIds:['goal:integrity'],programId:'mobility',linkedActivityId:'actual:mobility'},
   {id:'bjj:class',date:day,title:'BJJ class',type:'BJJ',status:'Completed',goalIds:['goal:integrity'],linkedActivityId:'actual:bjj'}
  ]));
 });
 await page.reload();
 await page.getByRole('button',{name:'Progress',exact:true}).first().click();
 await expect(page.getByText('1 BJJ classes attended · 1 other supporting sessions (7 days)')).toBeVisible();
 await expect(page.getByText('2 of 2 planned sessions completed')).toBeVisible();
});


test('BJJ weekly target does not treat completed mobility as attendance',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.evaluate(()=>{
  const day=new Date().toLocaleDateString('en-CA');
  localStorage.setItem('workoutapp.goals.v2',JSON.stringify([{id:'goal:weekly-bjj',name:'BJJ weekly attendance',type:'BJJ',status:'Active',supportingTargets:[{id:'attendance',frequencyPerWeek:3}]}]));
  localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([
   {id:'weekly:bjj',date:day,title:'BJJ class',type:'BJJ',status:'Completed',goalIds:['goal:weekly-bjj']},
   {id:'weekly:mobility:1',date:day,title:'Mobility 1',type:'Mobility',status:'Completed',goalIds:['goal:weekly-bjj']},
   {id:'weekly:mobility:2',date:day,title:'Mobility 2',type:'Mobility',status:'Completed',goalIds:['goal:weekly-bjj']}
  ]));
 });
 await page.reload();
 await page.getByRole('button',{name:'Progress',exact:true}).first().click();
 await expect(page.getByText('1/3 linked sessions this week')).toBeVisible();
 await expect(page.getByText('1 BJJ classes attended · 2 other supporting sessions (7 days)')).toBeVisible();
});


test('Goals organize primary and supporting objectives into full-width responsive rows',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.evaluate(()=>{
  localStorage.setItem('workoutapp.goals.v2',JSON.stringify([
   {id:'layout:bjj',name:'Primary BJJ objective',type:'Consistency',goalTypeV2:'Consistency',status:'Active',priority:'Primary',focus:'bjj',metric:'Sessions',current:2,target:12,unit:'sessions',supportingTargets:[{id:'bjj',name:'BJJ training',activityType:'BJJ',frequencyPerWeek:3}]},
   {id:'layout:milestone',name:'Primary milestone objective',type:'Milestone',goalTypeV2:'Outcome',status:'Active',priority:'Primary'},
   {id:'layout:cycling',name:'Supporting cycling objective',type:'Cardio',goalTypeV2:'Performance',status:'Active',priority:'Supporting',metric:'Distance',current:15,target:100,unit:'mi'}
  ]));
 });
 await page.reload();
 await page.getByRole('button',{name:'Goals',exact:true}).first().click();
 const primary=page.getByRole('region',{name:'Primary goals'});
 const supporting=page.getByRole('region',{name:'Supporting goals'});
 await expect(primary.locator('.goal-card')).toHaveCount(2);
 await expect(supporting.locator('.goal-card')).toHaveCount(1);
 await expect(primary.getByRole('heading',{name:'Primary BJJ objective'})).toBeVisible();
 await expect(supporting.getByRole('heading',{name:'Supporting cycling objective'})).toBeVisible();
 await expect(primary.getByText('Milestone',{exact:true})).toBeVisible();
 const first=await primary.locator('.goal-card').nth(0).boundingBox();
 const second=await primary.locator('.goal-card').nth(1).boundingBox();
 const support=await supporting.locator('.goal-card').boundingBox();
 expect(first&&second&&support).toBeTruthy();
 expect(Math.abs(first!.x-second!.x)).toBeLessThan(3);
 expect(second!.y).toBeGreaterThan(first!.y);
 expect(support!.y).toBeGreaterThan(second!.y);
 await page.setViewportSize({width:390,height:844});
 await expect(primary.getByRole('heading',{name:'Primary BJJ objective'})).toBeVisible();
 const body=primary.locator('.arc-goal-card-body').first();
 const dimensions=await body.evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
 expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width+1);
 await primary.getByRole('button',{name:'Edit goal'}).first().click();
 await expect(page.locator('.goal-wizard')).toBeVisible();
});
