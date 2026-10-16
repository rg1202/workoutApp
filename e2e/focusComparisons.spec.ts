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
