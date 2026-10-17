import {test,expect} from '@playwright/test';

test('Progress focus comparisons pair completed measurements and avoid double counting',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.evaluate(()=>{
  const date=new Date().toLocaleDateString('en-CA');
  const base={date,time:'09:00',type:'Cardio',status:'Completed',sourceType:'Manual',goalIds:['goal-a','goal-b']};
  const plans=[
   {...base,id:'e2e:run',title:'Running intervals',specificPlan:{discipline:'Running'},durationMinutes:40,plannedMetrics:{distanceKm:5},actuals:{distanceKm:5.4,actualDurationMinutes:42}},
   {...base,id:'e2e:run',title:'Running intervals',specificPlan:{discipline:'Running'},durationMinutes:40,plannedMetrics:{distanceKm:5},actuals:{distanceKm:5.4,actualDurationMinutes:42}},
   {...base,id:'e2e:missing',title:'Running recovery',specificPlan:{discipline:'Running'},durationMinutes:20,plannedMetrics:{distanceKm:3}},
   {...base,id:'e2e:planned',title:'Cycling planned',status:'Planned',specificPlan:{discipline:'Cycling'},durationMinutes:60,plannedMetrics:{distanceKm:20},actuals:{distanceKm:21}},
   {...base,id:'e2e:bjj',title:'BJJ class',type:'BJJ',durationMinutes:60,plannedMetrics:{rounds:5},actuals:{rounds:6,actualDurationMinutes:65}}
  ];
  localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify(plans));
 });
 await page.reload();
 await page.getByRole('button',{name:'Progress',exact:true}).first().click();
 const comparison=page.locator('.arc-focus-comparisons');
 await expect(comparison.getByRole('heading',{name:'Planned vs. actual'})).toBeVisible();
 const running=comparison.locator('article').filter({has:page.getByRole('heading',{name:'Running',exact:true})});
 await expect(running).toContainText('2 completed sessions');
 await expect(running).toContainText('5 → 5.4 km');
 await expect(running).toContainText('40 → 42 min');
 await expect(running).toContainText('1 paired sessions');
 const cycling=comparison.locator('article').filter({has:page.getByRole('heading',{name:'Cycling',exact:true})});
 await expect(cycling).toContainText('0 completed sessions');
 await expect(cycling).toContainText('No comparable measurements');
 const bjj=comparison.locator('article').filter({has:page.getByRole('heading',{name:'BJJ',exact:true})});
 await expect(bjj).toContainText('5 → 6');
 await expect(bjj).toContainText('60 → 65 min');
});

test('Calendar goal support keeps focus metrics when scheduled',async({page})=>{
 await test.step('Open Arc with a clean goal-support fixture',async()=>{
  await page.goto('/');
  await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
  await page.getByRole('button',{name:'Continue to Arc'}).click();
  await page.evaluate(()=>{
   localStorage.setItem('workoutapp.goals.v2',JSON.stringify([{
    id:'test-run-goal',name:'Test running goal',type:'Cardio',status:'Active',
    goalTypeV2:'Consistency',priority:'Primary',focus:'running',
    supportingTargets:[{name:'Run support',activityType:'Cardio',frequencyPerWeek:1,durationMinutes:40}]
   }]));
   localStorage.setItem('workoutapp.planned-activities.v1','[]');
  });
  await page.reload();
 });
 await test.step('Find the running goal in Calendar coverage',async()=>{
  await page.getByRole('button',{name:'Calendar',exact:true}).first().click();
  await page.locator('.cal-switch').getByRole('button',{name:'Week',exact:true}).click();
  const coverage=page.locator('.cal-goal-coverage');
  await expect(coverage.getByText('Test running goal',{exact:true})).toBeVisible({timeout:5000});
  await coverage.getByRole('button',{name:'Manage support for Test running goal'}).click();
  await expect(page.getByRole('dialog',{name:'Manage support for Test running goal'})).toBeVisible({timeout:5000});
 });
 await test.step('Configure focus-specific goal support',async()=>{
  const manager=page.getByRole('dialog',{name:'Manage support for Test running goal'});
  await manager.locator('.arc-goal-manage-targets button').filter({hasText:'Run support'}).click();
  await expect(page.getByText('ADD GOAL SUPPORT')).toBeVisible({timeout:5000});
  await page.getByLabel('Session focus discipline').selectOption('Running');
  await expect(page.getByLabel('Planned distance km')).toBeVisible({timeout:5000});
  await page.getByLabel('Planned distance km').fill('5');
  await page.getByLabel('Goal plan Effort / RPE (1–10)').fill('4');
 });
 await test.step('Schedule a date and persist the session',async()=>{
  await page.locator('.cal-place-days button:not([disabled])').first().click();
  await expect(page.getByRole('button',{name:'Add 1 session'})).toBeEnabled({timeout:5000});
  await page.getByRole('button',{name:'Add 1 session'}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').length),{timeout:5000}).toBe(1);
 });
 await test.step('Verify the saved goal association and planned metrics',async()=>{
  const plans=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]'));
  const item=plans[0];
  expect(item.goalIds).toContain('test-run-goal');
  expect(item.specificPlan.discipline).toBe('Running');
  expect(item.plannedMetrics.distanceKm).toBe(5);
  expect(item.plannedMetrics.effort).toBe(4);
 });
});
