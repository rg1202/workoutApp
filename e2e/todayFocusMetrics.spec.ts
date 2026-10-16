import {test,expect} from '@playwright/test';

test('Today focus metrics retain planned targets and actual results across Calendar and reload',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 const today=await page.evaluate(()=>new Date().toLocaleDateString('en-CA'));
 await page.evaluate(date=>{
  localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([{
   id:'e2e:focus-run',date,time:'23:45',title:'Focus Running Session',type:'Cardio',
   durationMinutes:40,status:'Planned',sourceType:'Manual',
   specificPlan:{discipline:'Running',format:'Easy aerobic',distanceKm:5},
   plannedMetrics:{distanceKm:5,effort:4}
  }]));
 },today);
 await page.reload();
 await page.getByRole('button',{name:'Today',exact:true}).first().click();
 await page.getByRole('button',{name:'View details'}).click();
 const metrics=page.getByRole('region',{name:'Session measurements'});
 await expect(metrics).toContainText('Running');
 await expect(metrics.locator('.arc-plan-actual-row').filter({hasText:'Distance'}).locator('output')).toHaveText('5');
 await metrics.getByLabel('Today actual Distance').fill('5.4');
 await metrics.getByLabel('Today actual Duration').fill('42');
 await metrics.getByRole('button',{name:'Save session results'}).click();
 const record=async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').find((p:{id:string})=>p.id==='e2e:focus-run'));
 expect((await record()).actuals.distanceKm).toBe(5.4);
 expect((await record()).actuals.actualDurationMinutes).toBe(42);
 expect((await record()).plannedMetrics.distanceKm).toBe(5);
 expect((await record()).durationMinutes).toBe(40);
 expect((await record()).status).toBe('Planned');
 await page.reload();
 await page.getByRole('button',{name:'Calendar',exact:true}).first().click();
 await page.getByRole('button',{name:/Edit activity:.*Focus Running Session/}).first().click();
 const dialog=page.getByRole('dialog',{name:'Edit activity'});
 await expect(dialog.getByLabel('Distance (km)')).toHaveValue('5.4');
 await expect(dialog.getByLabel('Actual minutes')).toHaveValue('42');
 await expect(dialog.getByLabel('Planned Distance')).toHaveValue('5');
});
