import{test,expect}from'@playwright/test';

test('Today suggests prior movement results only after user approval',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.evaluate(()=>{
  const day=new Date().toLocaleDateString('en-CA');
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
  const earlier=yesterday.toLocaleDateString('en-CA');
  const movement={id:'hip-9090',name:'90/90 hip switches',sets:2,reps:10};
  const prescription={version:1,movements:[movement]};
  localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([
   {id:'intelligence:prior',date:earlier,title:'Previous mobility',type:'Mobility',status:'Completed',prescription,execution:{finishedAt:new Date().toISOString(),movements:[{movementId:'hip-9090',completed:true,actualSets:2,actualReps:12}]}},
   {id:'intelligence:next',date:day,time:new Date().toTimeString().slice(0,5),title:'Next mobility',type:'Mobility',status:'Planned',prescription}
  ]));
 });
 await page.reload();
 await page.getByRole('button',{name:'Today',exact:true}).first().click();
 await page.getByRole('button',{name:'View details'}).click();
 await expect(page.getByText('Suggested from your history')).toBeVisible();
 await expect(page.getByText('2 sets · 10 reps → 2 sets · 12 reps')).toBeVisible();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').find((p:{id:string})=>p.id==='intelligence:next').prescription.movements[0].reps);
 expect(before).toBe(10);
 await page.getByRole('button',{name:'Apply suggestion'}).click();
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').find((p:{id:string})=>p.id==='intelligence:next').prescription.movements[0].reps);
 expect(after).toBe(12);
});
