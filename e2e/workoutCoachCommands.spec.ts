import {test,expect} from '@playwright/test';

test('Workout coach accepts conversational set logging and rest commands',async({page})=>{
  await page.goto('/');
  const notice=page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i});
  if(await notice.isVisible()){await notice.check();await page.getByRole('button',{name:'Continue to Arc'}).click();}
  await page.getByRole('button',{name:'Today',exact:true}).first().click();
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
