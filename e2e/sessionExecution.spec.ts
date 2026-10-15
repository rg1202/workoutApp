import{test,expect}from'@playwright/test';

test('Today mobility prescription records movement actuals and completion without duplicate activity',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.getByRole('button',{name:'Today',exact:true}).first().click();
 await page.getByRole('button',{name:'Add example mobility session'}).click();
 const details=page.getByRole('heading',{name:'Record your session'});
 if(!await details.isVisible())await page.getByRole('button',{name:'View details'}).click();
 await expect(page.getByRole('heading',{name:'Record your session'})).toBeVisible();
 await page.getByLabel('90/90 hip switches actual reps').fill('12');
 await page.locator('.arc-session-movement input[type=checkbox]').first().check();
 await expect(page.getByText('1 of 5 movements recorded')).toBeVisible();
 await expect(page.getByRole('button',{name:'Finish and record session'})).toBeDisabled();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]'));
 const demo=stored.filter((p:{id:string})=>p.id.startsWith('demo:bjj-mobility:'));
 expect(demo).toHaveLength(1);
 expect(demo[0].execution.movements.find((m:{movementId:string})=>m.movementId==='hip-9090').actualReps).toBe(12);
 await page.locator('.arc-session-movement input[type=checkbox]').nth(1).check();
 await page.locator('.arc-session-movement input[type=checkbox]').nth(2).check();
 await page.locator('.arc-session-movement input[type=checkbox]').nth(3).check();
 await page.locator('.arc-session-movement input[type=checkbox]').nth(4).check();
 await page.getByRole('button',{name:'Finish and record session'}).click();
 const finished=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]'));
 expect(finished.filter((p:{id:string})=>p.id===demo[0].id)).toHaveLength(1);
 expect(finished.find((p:{id:string})=>p.id===demo[0].id).status).toBe('Completed');
 expect(finished.find((p:{id:string})=>p.id===demo[0].id).execution.finishedAt).toBeTruthy();
});


test('Completed prescribed session survives reload and appears in Progress history',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.getByRole('button',{name:'Today',exact:true}).first().click();
 await page.getByRole('button',{name:'Add example mobility session'}).click();
 await expect(page.getByRole('heading',{name:'Record your session'})).toBeVisible();
 await page.getByLabel('90/90 hip switches actual reps').fill('12');
 const checks=page.locator('.arc-session-movement input[type=checkbox]');
 for(let i=0;i<5;i++)await checks.nth(i).check();
 await page.getByRole('button',{name:'Finish and record session'}).click();
 await page.reload();
 await page.getByRole('button',{name:'Progress',exact:true}).first().click();
 await expect(page.getByRole('heading',{name:'Recorded prescriptions'})).toBeVisible();
 const history=page.locator('.arc-recorded-session').filter({hasText:'BJJ Mobility'});
 await expect(history).toHaveCount(1);
 await history.getByText('View recorded movements').click();
 await expect(history.getByText('12 reps').first()).toBeVisible();
});
