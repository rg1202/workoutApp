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
