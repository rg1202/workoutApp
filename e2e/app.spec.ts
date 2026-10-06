import{test,expect,Page}from'@playwright/test';

const nav=(page:Page,name:string)=>
 page.locator('aside nav').getByRole('button',{name,exact:true});

test.beforeEach(async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
});

test('app shell loads and primary navigation works',async({page})=>{
 await expect(page.getByText('WorkoutApp')).toBeVisible();
 for(const name of['Goals','Calendar','BJJ','Programs','Analytics']){
  await nav(page,name).click();
  await expect(page.locator('main h1').first()).toContainText(
   name==='BJJ'?/BJJ|Jiu/i:name==='Analytics'?/Performance/i:new RegExp(name,'i')
  );
 }
});

test('created goal appears on dashboard',async({page})=>{
 await nav(page,'Goals').click();
 await page.getByRole('button',{name:/Add goal/i}).click();
 await page.getByLabel(/Event name/i).fill('E2E Tournament');
 await page.getByRole('button',{name:/Create competition goal/i}).click();
 await expect(page.getByText('E2E Tournament')).toBeVisible();
 await nav(page,'Dashboard').click();
 await expect(page.getByText('E2E Tournament')).toBeVisible();
});

test('planned activity survives navigation and appears on dashboard',async({page})=>{
 await nav(page,'Calendar').click();
 await page.getByRole('button',{name:/Plan activity/i}).click();
 await page.getByPlaceholder(/Gi BJJ/i).fill('E2E Training');
 await page.getByRole('button',{name:/Add to calendar/i}).click();
 await expect(page.getByText('E2E Training')).toBeVisible();
 await nav(page,'Dashboard').click();
 await expect(page.getByText('E2E Training')).toBeVisible();
});

test('daily check-in persists after navigation',async({page})=>{
 const energy=page.locator('.dashboard-checkin input[type=range]').first();
 await energy.fill('5');
 await nav(page,'Goals').click();
 await nav(page,'Dashboard').click();
 await expect(page.locator('.dashboard-checkin input[type=range]').first()).toHaveValue('5');
});
