import{test,expect}from'@playwright/test';

test('Completed Today prescription stays completed on Calendar after reload',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.getByRole('button',{name:'Today',exact:true}).first().click();
 await page.evaluate(async()=>{
  const {bjjMobilityTemplate}=await import('/src/arc/sessionPrescriptions.ts');
  const date=new Date().toLocaleDateString('en-CA');
  const activity={id:'demo:bjj-mobility:'+date,date,time:'23:45',title:'BJJ Mobility & Recovery · Session A',type:'Mobility',durationMinutes:20,status:'Planned',sourceType:'Manual',prescription:bjjMobilityTemplate()};
  localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([activity]));
 });
 await page.reload();
 await page.getByRole('button',{name:'Today',exact:true}).first().click();
 await page.getByRole('button',{name:'View details'}).click();
 const checks=page.locator('.arc-session-movement input[type=checkbox]');
 for(let i=0;i<5;i++)await checks.nth(i).check();
 await page.getByRole('button',{name:'Finish and record session'}).click();
 await page.reload();
 await page.getByRole('button',{name:'Calendar',exact:true}).first().click();
 const completed=page.locator('.cal-plan-complete').filter({has:page.getByRole('button',{name:/Edit activity:.*Mobility/i})});
 await expect(completed).toHaveCount(1);
 await expect(completed.getByRole('switch',{name:/Still planned:/})).not.toBeChecked();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').filter((p:{id:string})=>p.id.startsWith('demo:bjj-mobility:')));
 expect(saved).toHaveLength(1);
 expect(saved[0].status).toBe('Completed');
 expect(saved[0].execution.finishedAt).toBeTruthy();
});
