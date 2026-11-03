import {test,expect} from '@playwright/test';

test('Workout coach accepts conversational set logging and rest commands',async({page})=>{
  await page.goto('/');
  const notice=page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i});
  if(await notice.isVisible()){await notice.check();await page.getByRole('button',{name:'Continue to Arc'}).click();}
  const today=new Date(),date=today.toLocaleDateString('en-CA'),weekday=today.getDay();
  await page.evaluate(({date,weekday})=>{
    const p={id:'coach-e2e',name:'Coach E2E Program',goal:'Strength',weeks:2,activeWeek:1,activeDayId:'coach-day',status:'Active',createdAt:new Date().toISOString(),startDate:date,progression:{type:'None',loadStep:5,startRir:3,endRir:1,deloadEvery:4,deloadPercent:15},days:[{id:'coach-day',name:'Coach E2E Workout',type:'Lower Body',weekday,prescriptions:[{id:'coach-rx',exerciseId:'back-squat',sets:2,minReps:5,maxReps:8,rir:2,weight:135}]}]};
    localStorage.setItem('workoutapp.programs.v3',JSON.stringify({activeProgramId:p.id,programs:[p]}));
  },{date,weekday});
  await page.reload();
  await page.getByRole('button',{name:'Today',exact:true}).first().click();
  await page.getByRole('button',{name:/Start workout/i}).click();
  const coach=page.getByRole('region',{name:'Workout coach'});
  await expect(coach).toBeVisible();
  const command=coach.getByRole('textbox',{name:'Coach command'});
  await command.fill('135 x 8, 2 RIR');
  await coach.getByRole('button',{name:'Send to coach'}).click();
  await expect(coach.getByRole('status')).toContainText('Recorded 135 × 8');
  await command.fill('rest 90 seconds');
  await command.press('Enter');
  await expect(coach.getByRole('status')).toContainText('Rest timer set for 90 seconds');
  await command.fill('stop rest');
  await command.press('Enter');
  await expect(coach.getByRole('status')).toContainText('Rest timer stopped');
});
