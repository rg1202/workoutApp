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
