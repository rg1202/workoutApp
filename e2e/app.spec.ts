import{test,expect,Page}from'@playwright/test';

const nav=(page:Page,name:string)=>
 page.locator('aside').getByRole('button',{name,exact:true}).first();

test.beforeEach(async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
});

test('app shell loads and primary navigation works',async({page})=>{
 await expect(page.getByText('Arc',{exact:true})).toBeVisible();
 for(const name of['Goals','Calendar','BJJ','Programs','Progress']){
  await nav(page,name).click();
  await expect(page.locator('main h1').first()).toContainText(
   name==='BJJ'?/BJJ|Jiu/i:name==='Progress'?/Performance/i:new RegExp(name,'i')
  );
 }
});

test('created goal appears on dashboard',async({page})=>{
 await nav(page,'Goals').click();
 await page.getByRole('button',{name:/New goal/i}).click();
 await page.getByRole('button',{name:'Event',exact:true}).click();
 await page.getByLabel('Goal name').fill('E2E Tournament');
 await page.getByRole('button',{name:/Continue/i}).click();
 await page.getByRole('button',{name:/Continue/i}).click();
 await page.getByRole('button',{name:/Continue/i}).click();
 await page.getByRole('button',{name:/Create goal/i}).click();
 await page.getByRole('button',{name:/Not now/i}).click();
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
 await expect(page.locator('.today-activity-list').getByText('E2E Training',{exact:true})).toBeVisible();
});

test('daily check-in persists after navigation',async({page})=>{
 const energy=page.locator('.dashboard-checkin input[type=range]').first();
 await energy.fill('5');
 await nav(page,'Goals').click();
 await nav(page,'Dashboard').click();
 await expect(page.locator('.dashboard-checkin input[type=range]').first()).toHaveValue('5');
});


test('active program schedules into Calendar and Today',async({page})=>{
 const today=new Date();
 const date=today.toLocaleDateString('en-CA');
 const weekday=today.getDay();
 await page.evaluate(({date,weekday})=>{
  const p={id:'e2e-program',name:'E2E Strength',goal:'Strength',weeks:4,activeWeek:1,activeDayId:'e2e-day',status:'Active',createdAt:new Date().toISOString(),startDate:date,progression:{type:'None',loadStep:5,startRir:3,endRir:1,deloadEvery:4,deloadPercent:15},days:[{id:'e2e-day',name:'E2E Lower',type:'Lower Body',weekday,prescriptions:[{id:'e2e-rx',exerciseId:'back-squat',sets:1,minReps:5,maxReps:5,rir:2,weight:135}]}]};
  localStorage.setItem('workoutapp.programs.v3',JSON.stringify({activeProgramId:p.id,programs:[p]}));
 },{date,weekday});
 await page.reload();
 await nav(page,'Calendar').click();
 await expect(page.getByText('E2E Lower').first()).toBeVisible();
 await nav(page,'Today').click();
 await expect(page.locator('main h1').first()).toHaveText('E2E Lower');
 await expect(page.getByText(/E2E Strength · Week 1/)).toBeVisible();
});

test('finishing Today workout syncs History Calendar and Analytics',async({page})=>{
 const today=new Date();
 const date=today.toLocaleDateString('en-CA');
 const weekday=today.getDay();
 await page.evaluate(({date,weekday})=>{
  const p={id:'e2e-flow',name:'E2E Flow Program',goal:'Strength',weeks:2,activeWeek:1,activeDayId:'flow-day',status:'Active',createdAt:new Date().toISOString(),startDate:date,progression:{type:'None',loadStep:5,startRir:3,endRir:1,deloadEvery:4,deloadPercent:15},days:[{id:'flow-day',name:'E2E Flow Workout',type:'Lower Body',weekday,prescriptions:[{id:'flow-rx',exerciseId:'back-squat',sets:1,minReps:5,maxReps:5,rir:2,weight:135}]}]};
  localStorage.setItem('workoutapp.programs.v3',JSON.stringify({activeProgramId:p.id,programs:[p]}));
 },{date,weekday});
 await page.reload();
 await nav(page,'Today').click();
 await page.getByRole('button',{name:/Working set/i}).first().click();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:/Finish workout/i}).click();
 await nav(page,'History').click();
 await expect(page.getByText('E2E Flow Workout')).toBeVisible();
 await nav(page,'Calendar').click();
 await expect(page.getByText('E2E Flow Workout').first()).toBeVisible();
 await expect(page.getByText(/✓ E2E Flow Workout/)).toBeVisible();
 await nav(page,'Progress').click();
 await expect(page.getByText('ALL TRAINING · 7D')).toBeVisible();
 await expect(page.locator('.analytics-summary article').first().locator('b')).toHaveText('1');
});


test('latest body weight drives weight-loss goal progress',async({page})=>{
 await page.evaluate(()=>{
  localStorage.setItem('workoutapp.goals.v2',JSON.stringify([{id:'weight-goal',name:'Weight Cut',type:'Body',status:'Active',metric:'Bodyweight',start:200,current:200,target:190,unit:'lb'}]));
  localStorage.setItem('workoutapp.body-metrics.v1',JSON.stringify([{id:'weight-1',date:new Date().toLocaleDateString('en-CA'),weight:195}]));
 });
 await page.reload();
 await nav(page,'Goals').click();
 await expect(page.getByText('195', {exact:false}).first()).toBeVisible();
 await expect(page.getByText(/^50%/)).toBeVisible();
 const initialBar=page.locator('.goal-progress');
 const initialFill=initialBar.locator('i');
 const initialWidths=await Promise.all([initialBar,initialFill].map(async x=>(await x.boundingBox())?.width??0));
 expect(initialWidths[1]/initialWidths[0]).toBeGreaterThan(.45);
 expect(initialWidths[1]/initialWidths[0]).toBeLessThan(.55);
 await nav(page,'Progress').click();
 await page.locator('#bm-weight').fill('192');
 await page.getByRole('button',{name:/Save measurements/i}).click();
 await nav(page,'Goals').click();
 await expect(page.getByText('192', {exact:false}).first()).toBeVisible();
 await expect(page.getByText(/^80%/)).toBeVisible();
 const bar=page.locator('.goal-progress');
 const fill=bar.locator('i');
 const widths=await Promise.all([bar,fill].map(async x=>(await x.boundingBox())?.width??0));
 expect(widths[1]/widths[0]).toBeGreaterThan(.75);
 expect(widths[1]/widths[0]).toBeLessThan(.85);
});


test('creating a weight goal uses Analytics weight and syncs Dashboard progress',async({page})=>{
 const date=new Date().toLocaleDateString('en-CA');
 await page.evaluate(date=>localStorage.setItem('workoutapp.body-metrics.v1',JSON.stringify([{id:'baseline-weight',date,weight:198}])),date);
 await page.reload();
 await nav(page,'Goals').click();
 await page.getByRole('button',{name:/New goal/i}).click();
 await page.getByRole('button',{name:'Body Composition',exact:true}).click();
 await page.getByLabel('Goal name').fill('Competition Cut');
 await page.getByLabel('Metric').fill('Bodyweight');
 await page.getByLabel('Target value').fill('194');
 await page.getByLabel('Unit').fill('lb');
 await page.getByRole('button',{name:/Continue/i}).click();await page.getByRole('button',{name:/Continue/i}).click();await page.getByRole('button',{name:/Create goal/i}).click();await page.getByRole('button',{name:/Not now/i}).click();
 await expect(page.getByText(/198/).first()).toBeVisible();
 await expect(page.getByText(/^0%/)).toBeVisible();
 await nav(page,'Dashboard').click();
 const goals=page.locator('.overview-goals');
 await expect(goals.getByText('Competition Cut')).toBeVisible();
 await expect(goals.getByText(/198 \/ 194 lb/)).toBeVisible();
 await expect(goals.getByText(/^0%/)).toBeVisible();
 await nav(page,'Progress').click();
 await page.locator('#bm-weight').fill('196');
 await page.getByRole('button',{name:/Save measurements/i}).click();
 await nav(page,'Dashboard').click();
 await expect(goals.getByText(/196 \/ 194 lb/)).toBeVisible();
 await expect(goals.getByText(/^50%/)).toBeVisible();
 const track=goals.locator('.overview-progress').first(),fill=track.locator('i');
 const widths=await Promise.all([track,fill].map(async x=>(await x.boundingBox())?.width??0));
 expect(widths[1]/widths[0]).toBeGreaterThan(.45);
 expect(widths[1]/widths[0]).toBeLessThan(.55);
});


test('moves one program workout without changing its recurring weekday',async({page})=>{
 const today=new Date(),date=today.toLocaleDateString('en-CA'),weekday=today.getDay(),tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);const moved=tomorrow.toLocaleDateString('en-CA');
 await page.evaluate(({date,weekday})=>{const p={id:'move-program',name:'Move Test',goal:'Strength',weeks:2,activeWeek:1,activeDayId:'move-day',status:'Active',createdAt:new Date().toISOString(),startDate:date,progression:{type:'None',loadStep:5,startRir:3,endRir:1,deloadEvery:4,deloadPercent:15},days:[{id:'move-day',name:'Move Me',type:'Full Body',weekday,prescriptions:[]}]};localStorage.setItem('workoutapp.programs.v3',JSON.stringify({activeProgramId:p.id,programs:[p]}))},{date,weekday});
 await page.reload();await nav(page,'Calendar').click();await page.getByRole('button',{name:'Move Move Me'}).first().click();await page.getByLabel('New date').fill(moved);await page.getByRole('button',{name:'Move workout'}).click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 expect(stored.programs[0].scheduleOverrides['program:move-program:1:move-day']).toBe(moved);
 expect(stored.programs[0].days[0].weekday).toBe(weekday);
});


test('shared state changes propagate once without persistence churn',async({page})=>{
 await nav(page,'Progress').click();
 await page.locator('#bm-weight').fill('197');
 await page.getByRole('button',{name:/Save measurements/i}).click();
 await nav(page,'Goals').click();
 await page.getByRole('button',{name:/New goal/i}).click();
 await page.getByRole('button',{name:'Body Composition',exact:true}).click();
 await page.getByLabel('Target value').fill('190');
 await page.getByRole('button',{name:/Continue/i}).click();await page.getByRole('button',{name:/Continue/i}).click();await page.getByRole('button',{name:/Create goal/i}).click();await page.getByRole('button',{name:/Not now/i}).click();
 await nav(page,'Dashboard').click();
 const goals=page.locator('.overview-goals');
 await expect(goals.getByText(/197 \/ 190 lb/)).toBeVisible();
 const snapshot=await page.evaluate(()=>({goals:localStorage.getItem('workoutapp.goals.v2'),body:localStorage.getItem('workoutapp.body-metrics.v1')}));
 await page.waitForTimeout(300);
 const stable=await page.evaluate(()=>({goals:localStorage.getItem('workoutapp.goals.v2'),body:localStorage.getItem('workoutapp.body-metrics.v1')}));
 expect(stable).toEqual(snapshot);
});


test('can delete the only program and keep the library empty after reload',async({page})=>{
 const date=new Date().toLocaleDateString('en-CA');
 await page.evaluate(date=>{const p={id:'only-program',name:'Only Program',goal:'Strength',weeks:4,activeWeek:1,activeDayId:'only-day',status:'Active',createdAt:new Date().toISOString(),startDate:date,progression:{type:'None',loadStep:5,startRir:3,endRir:1,deloadEvery:4,deloadPercent:15},days:[{id:'only-day',name:'Only Day',type:'Full Body',weekday:new Date().getDay(),prescriptions:[]}]};localStorage.setItem('workoutapp.programs.v3',JSON.stringify({activeProgramId:p.id,programs:[p]}))},date);
 await page.reload();await nav(page,'Programs').click();
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('.program-tile',{hasText:'Only Program'}).getByRole('button').click();
 await expect(page.getByText('No programs yet')).toBeVisible();
 await page.reload();await nav(page,'Programs').click();
 await expect(page.getByText('No programs yet')).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}').programs.length)).toBe(0);
});


test('expanded library creates every configured training day',async({page})=>{
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:'Program Library',exact:true}).click();
 await expect(page.getByText('BJJ Strength — 2 Day Minimal')).toBeVisible();
 const pplCard=page.locator('.published-card').filter({has:page.getByRole('heading',{name:'Push / Pull / Legs Hypertrophy'})});
 await expect(pplCard).toBeVisible();
 await pplCard.getByRole('button',{name:/Set up program/i}).click();
 await expect(page.getByText(/6 days\/week/).first()).toBeVisible();
 await page.getByRole('button',{name:/Create program/i}).click();
 await expect(page.getByText('Push / Pull / Legs Hypertrophy').first()).toBeVisible();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 const p=stored.programs.find((x:any)=>x.name==='Push / Pull / Legs Hypertrophy');
 expect(p.days).toHaveLength(6);
 expect(new Set(p.days.map((d:any)=>d.weekday)).size).toBeGreaterThan(3);
});


test('strength library setup uses multiple lift baselines and previews prescriptions',async({page})=>{
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:'Program Library',exact:true}).click();
 const card=page.locator('.published-card').filter({has:page.getByRole('heading',{name:'BJJ Strength — 3 Day'})});
 await card.getByRole('button',{name:/Set up program/i}).click();
 await expect(page.getByLabel('Back squat max')).toBeVisible();
 await expect(page.getByLabel('Bench press max')).toBeVisible();
 await expect(page.getByLabel('Deadlift max')).toBeVisible();
 await expect(page.getByLabel('Overhead press max')).toBeVisible();
 await page.getByLabel('Back squat max').fill('300');
 await page.getByLabel('Bench press max').fill('200');
 await expect(page.getByText(/Barbell Back Squat 3×5 @ 215 lb/)).toBeVisible();
 await expect(page.getByText(/Barbell Bench Press 3×5 @ 145 lb/)).toBeVisible();
 await page.getByRole('button',{name:/Create program/i}).click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 const p=stored.programs.find((x:any)=>x.name==='BJJ Strength — 3 Day');
 expect(p.days).toHaveLength(3);
 expect(p.days[0].prescriptions.map((x:any)=>x.exerciseId)).toEqual(['back-squat','bench','pullup']);
 expect(p.days[1].prescriptions.map((x:any)=>x.exerciseId)).toContain('deadlift');
});


test('BJJ setup suggests lower-conflict training days',async({page})=>{
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:'Program Library',exact:true}).click();
 const card=page.locator('.published-card').filter({has:page.getByRole('heading',{name:'BJJ Strength — 3 Day'})});
 await card.getByRole('button',{name:/Set up program/i}).click();
 const helper=page.locator('.bjj-schedule-helper');
 for(const day of['Mon','Tue','Wed','Thu','Sat'])await helper.getByRole('button',{name:day,exact:true}).click();
 await helper.getByRole('button',{name:'Suggest lifting days'}).click();
 const selects=page.locator('.setup-weekdays select');
 await expect(selects.nth(0)).toHaveValue('0');
 await expect(selects.nth(1)).toHaveValue('5');
});


test('BJJ program setup detects planned Calendar training days',async({page})=>{
 const base=new Date(),dates=[1,3,6].map(target=>{const d=new Date(base);d.setDate(d.getDate()+((target-d.getDay()+7)%7));return d.toLocaleDateString('en-CA')});
 await page.evaluate(dates=>localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify(dates.map((date,i)=>({id:'bjj-plan-'+i,date,title:'Planned BJJ',type:'BJJ',status:'Planned'})))),dates);
 await page.reload();
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:'Program Library',exact:true}).click();
 const card=page.locator('.published-card').filter({has:page.getByRole('heading',{name:'BJJ Strength — 3 Day'})});
 await card.getByRole('button',{name:/Set up program/i}).click();
 const helper=page.locator('.bjj-schedule-helper');
 await expect(helper).toContainText('BJJ days detected from your Calendar');
 for(const day of['Mon','Wed','Sat'])await expect(helper.getByRole('button',{name:day,exact:true})).toHaveAttribute('aria-pressed','true');
 await helper.getByRole('button',{name:'Suggest lifting days'}).click();
 const values=await page.locator('.setup-weekdays select').evaluateAll(xs=>xs.map(x=>(x as HTMLSelectElement).value));
 expect(new Set(values).size).toBe(values.length);
 expect(values.slice(0,2).sort()).toEqual(['4','5']);
});


test('smart generator adds recurring BJJ block to Calendar',async({page})=>{
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:/Build program/i}).click();
 await page.getByText('Add BJJ training block').click();
 const block=page.locator('.generator-bjj-block');
 await block.getByRole('button',{name:'Tue',exact:true}).click();
 await block.getByRole('button',{name:'Thu',exact:true}).click();
 await page.getByLabel('BJJ session name').fill('Gi BJJ');
 await page.getByLabel('BJJ session minutes').fill('90');
 await page.getByRole('button',{name:'Generate',exact:true}).click();
 const plans=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]'));
 expect(plans).toHaveLength(16);
 expect(new Set(plans.map((p:any)=>new Date(p.date+'T12:00:00').getDay()))).toEqual(new Set([2,4]));
 expect(plans.every((p:any)=>p.type==='BJJ'&&p.title==='Gi BJJ'&&p.durationMinutes===90)).toBeTruthy();
 await nav(page,'Calendar').click();
 await expect(page.getByText('Gi BJJ').first()).toBeVisible();
});


test('drags a planned activity to another Calendar day',async({page})=>{
 const today=new Date(),tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);
 const from=today.toLocaleDateString('en-CA'),to=tomorrow.toLocaleDateString('en-CA');
 await page.evaluate(from=>localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([{id:'drag-plan',date:from,title:'Drag BJJ',type:'BJJ',status:'Planned'}])),from);
 await page.reload();await nav(page,'Calendar').click();
 const card=page.getByText('Drag BJJ').first(),target=page.locator('[data-date="'+to+'"]').first();
 await card.dragTo(target);
 const plans=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]'));
 expect(plans.find((p:any)=>p.id==='drag-plan').date).toBe(to);
});

test('drags one program workout without changing recurring weekday',async({page})=>{
 const today=new Date(),from=today.toLocaleDateString('en-CA'),weekday=today.getDay(),tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);const to=tomorrow.toLocaleDateString('en-CA');
 await page.evaluate(({from,weekday})=>{const p={id:'drag-program',name:'Drag Program',goal:'Strength',weeks:2,activeWeek:1,activeDayId:'drag-day',status:'Active',createdAt:new Date().toISOString(),startDate:from,progression:{type:'None',loadStep:5,startRir:3,endRir:1,deloadEvery:4,deloadPercent:15},days:[{id:'drag-day',name:'Drag Strength',type:'Full Body',weekday,prescriptions:[]}]};localStorage.setItem('workoutapp.programs.v3',JSON.stringify({activeProgramId:p.id,programs:[p]}))},{from,weekday});
 await page.reload();await nav(page,'Calendar').click();
 const card=page.getByText('Drag Strength').first(),target=page.locator('[data-date="'+to+'"]').first();
 await card.dragTo(target);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 expect(stored.programs[0].scheduleOverrides['program:drag-program:1:drag-day']).toBe(to);
 expect(stored.programs[0].days[0].weekday).toBe(weekday);
});


test('smart generator schedules strength around BJJ and previews the whole week',async({page})=>{
 await nav(page,'Programs').click();await page.getByRole('button',{name:/Build program/i}).click();
 await page.getByText('Add BJJ training block').click();
 const block=page.locator('.generator-bjj-block');
 for(const day of['Mon','Wed','Sat'])await block.getByRole('button',{name:day,exact:true}).click();
 const preview=page.locator('.generator-week-preview');
 await expect(preview).toContainText('Strength');await expect(preview).toContainText('BJJ');
 await page.getByRole('button',{name:'Generate',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}').activeProgramId||'')).not.toBe('');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 const p=stored.programs[stored.programs.length-1],strengthDays=p.days.map((d:any)=>d.weekday);
 expect(p.status).toBe('Active');
 expect(stored.activeProgramId).toBe(p.id);
 expect(new Set(strengthDays).size).toBe(strengthDays.length);
 expect(strengthDays.some((d:number)=>[1,3,6].includes(d))).toBeFalsy();
 await nav(page,'Calendar').click();
 await expect(page.getByText('BJJ').first()).toBeVisible();
 const firstStrengthDate=await page.evaluate(()=>{const store=JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'),p=store.programs[store.programs.length-1],start=new Date(p.startDate+'T12:00:00'),weekday=p.days[0].weekday,offset=(weekday-start.getDay()+7)%7,d=new Date(start);d.setDate(d.getDate()+offset);return d.toLocaleDateString('en-CA')});

 const strengthCell=page.locator('[data-date="'+firstStrengthDate+'"]').first();
 await expect(strengthCell).toHaveCount(1);
 const strengthEvent=strengthCell.locator('.cal-event.cal-planned').filter({hasText:p.days[0].name});
 await expect(strengthEvent).toHaveCount(1);
 await expect(strengthEvent).toContainText(p.days[0].name);
});


test('deleting generated program removes its generated BJJ Calendar plans',async({page})=>{
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:/Build program/i}).click();
 await page.getByText('Add BJJ training block').click();
 const block=page.locator('.generator-bjj-block');
 await block.getByRole('button',{name:'Tue',exact:true}).click();
 await page.getByLabel('BJJ session name').fill('Lifecycle BJJ');
 await page.getByRole('button',{name:'Generate',exact:true}).click();
 const generated=await page.evaluate(()=>{const store=JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}');return store.programs.find((p:any)=>p.id===store.activeProgramId)});
 const before=await page.evaluate(id=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').filter((p:any)=>p.programId===id),generated.id);
 expect(before.length).toBeGreaterThan(0);
 const tile=page.locator('.program-tile').filter({hasText:generated.name}).last();
 page.once('dialog',d=>d.accept());
 await tile.locator('.icon-button').click();
 await expect.poll(()=>page.evaluate(id=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').filter((p:any)=>p.programId===id).length,generated.id)).toBe(0);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 expect(stored.programs.some((p:any)=>p.id===generated.id)).toBeFalsy();
});


test('editing generated program dates resyncs future BJJ plans',async({page})=>{
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:/Build program/i}).click();
 await page.getByText('Add BJJ training block').click();
 const block=page.locator('.generator-bjj-block');
 await block.getByRole('button',{name:'Tue',exact:true}).click();
 await block.getByRole('button',{name:'Thu',exact:true}).click();
 await page.getByLabel('BJJ session name').fill('Synced BJJ');
 await page.getByRole('button',{name:'Generate',exact:true}).click();
 const generated=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}');return s.programs.find((p:any)=>p.id===s.activeProgramId)});
 const editor=page.locator('.program-editor-v2');
 const oldPlans=await page.evaluate(id=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').filter((p:any)=>p.programId===id),generated.id);
 expect(oldPlans).toHaveLength(generated.weeks*2);
 const newStart='2026-10-13';
 await editor.getByLabel('Start').fill(newStart);
 await editor.getByLabel('Weeks').fill('2');
 await expect.poll(()=>page.evaluate(id=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').filter((p:any)=>p.programId===id&&p.status!=='Completed').length,generated.id)).toBe(4);
 const plans=await page.evaluate(id=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').filter((p:any)=>p.programId===id),generated.id);
 expect(plans).toHaveLength(4);
 expect(new Set(plans.map((p:any)=>new Date(p.date+'T12:00:00').getDay()))).toEqual(new Set([2,4]));
 expect(plans.every((p:any)=>p.date>='2026-10-13'&&p.title==='Synced BJJ')).toBeTruthy();
});


test('editable generator preview changes generated strength weekday',async({page})=>{
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:/Build program/i}).click();
 await page.getByText('Add BJJ training block').click();
 const block=page.locator('.generator-bjj-block');
 for(const day of['Mon','Wed','Sat'])await block.getByRole('button',{name:day,exact:true}).click();
 const preview=page.locator('.generator-week-preview');
 const strength=preview.locator('.generator-strength-slot').first();
 const before=await strength.getAttribute('aria-label');
 expect(before).toBeTruthy();
 const fromDay=(before||'').replace(/Move strength \d+ from /,'');
 await strength.click();
 await expect(preview.locator('.generator-strength-slot').filter({has:page.locator('[aria-label$="from '+fromDay+'"]')})).toHaveCount(0);
 await page.getByRole('button',{name:'Generate',exact:true}).click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 const p=stored.programs.find((x:any)=>x.id===stored.activeProgramId);
 const oldDayIndex=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(fromDay);
 expect(p.days.some((d:any)=>d.weekday===oldDayIndex)).toBeFalsy();
 expect(new Set(p.days.map((d:any)=>d.weekday)).size).toBe(p.days.length);
});


test('activating a program archives the previous active program everywhere',async({page})=>{
 await nav(page,'Programs').click();
 await page.getByRole('button',{name:/Build program/i}).click();
 await page.getByRole('button',{name:'Generate',exact:true}).click();
 const first=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}');return s.programs.find((p:any)=>p.id===s.activeProgramId)});
 await page.getByRole('button',{name:/Build program/i}).click();
 await page.getByRole('button',{name:'Generate',exact:true}).click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 const active=state.programs.filter((p:any)=>p.status==='Active');
 expect(active).toHaveLength(1);
 expect(active[0].id).toBe(state.activeProgramId);
 expect(state.programs.find((p:any)=>p.id===first.id)?.status).toBe('Archived');
 await nav(page,'Today').click();
 const todayState=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.programs.v3')||'{}'));
 expect(todayState.programs.filter((p:any)=>p.status==='Active')).toHaveLength(1);
 expect(todayState.programs.find((p:any)=>p.id===todayState.activeProgramId)?.status).toBe('Active');
});


test('BJJ technique library supports search detail and mastery persistence',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 await expect(page.getByRole('button',{name:/Scissor Sweep/})).toBeVisible();
 await page.getByLabel('Search techniques').fill('mount');
 await page.getByRole('button',{name:/Mount Control Cycle/}).click();
 await expect(page.getByRole('heading',{name:'Mount Control Cycle'})).toBeVisible();
 await page.getByLabel('Mastery').selectOption('Drilling');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.bjj-techniques.v1')||'[]').find((t:any)=>t.id==='mount-control')?.status)).toBe('Drilling');
 await page.getByRole('button').filter({has:page.locator('svg')}).last().press('Escape').catch(()=>{});
});


test('BJJ competencies are belt agnostic and update independently of mastery',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Competencies',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Build a complete grappling skill set'})).toBeVisible();
 await expect(page.getByText('Movement',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Review skills'}).first().click();
 await page.getByRole('button',{name:/Hip escape · shrimp/}).click();
 await page.getByLabel('Competency').selectOption('Functional');
 await expect(page.getByLabel('Personal mastery')).toHaveValue('Learning');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.bjj-techniques.v1')||'[]').find((t:any)=>t.id==='movement-1')?.competency)).toBe('Functional');
});


test('scissor sweep teaches grips mechanics execution and troubleshooting',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 await page.getByRole('button',{name:/Scissor Sweep/}).click();
 await expect(page.getByRole('heading',{name:'Grips / connections'})).toBeVisible();
 await expect(page.getByText(/control your opponent’s left sleeve/)).toBeVisible();
 await expect(page.getByRole('heading',{name:'Why it works'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Troubleshooting'})).toBeVisible();
 await expect(page.getByText('They catch themselves with a hand.')).toBeVisible();
 await expect(page.getByRole('heading',{name:'How to drill it'})).toBeVisible();
});


test('Guard bottom curriculum exposes complete instructional records',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 await page.getByPlaceholder(/search/i).fill('Triangle from closed guard');
 await page.getByRole('button',{name:/Triangle from closed guard/}).click();
 await expect(page.getByRole('heading',{name:'Grips / connections'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Break posture / base'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Why it works'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Troubleshooting'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'How to drill it'})).toBeVisible();
});


test('Guard top curriculum exposes passing and submission-defense instruction',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 const search=page.getByPlaceholder(/search/i);
 await search.fill('Knee slice pass');
 await page.getByRole('button',{name:/Knee slice pass/}).click();
 await expect(page.getByRole('heading',{name:'Grips / connections'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Why it works'})).toBeVisible();
 await expect(page.getByText(/Upper body before lower body/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Triangle defense');
 await page.getByRole('button',{name:/Triangle defense/}).click();
 await expect(page.getByRole('heading',{name:'Troubleshooting'})).toBeVisible();
 await expect(page.getByText(/One arm in = immediate danger/)).toBeVisible();
});


test('Half guard top and Side control bottom expose full instruction',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 const search=page.getByPlaceholder(/search/i);
 await search.fill('Knee slice from half guard');
 await page.getByRole('button',{name:/Knee slice from half guard/}).click();
 await expect(page.getByText(/Knee clears before foot/)).toBeVisible();
 await expect(page.getByRole('heading',{name:'Troubleshooting'})).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Replace guard from side control');
 await page.getByRole('button',{name:/Replace guard from side control/}).click();
 await expect(page.getByText(/Frame, bridge, hip escape, knee inside/)).toBeVisible();
 await expect(page.getByRole('heading',{name:'How to drill it'})).toBeVisible();
});


test('Side control top exposes control-first submission instruction',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 const search=page.getByPlaceholder(/search/i);
 await search.fill('Arm triangle from side control');
 await page.getByRole('button',{name:/Arm triangle from side control/}).click();
 await expect(page.getByText(/Angle before squeeze/)).toBeVisible();
 await expect(page.getByRole('heading',{name:'Why it works'})).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Knee-on-belly to mount transition');
 await page.getByRole('button',{name:/Knee-on-belly to mount transition/}).click();
 await expect(page.getByText(/Settle mount before attack/)).toBeVisible();
 await expect(page.getByRole('heading',{name:'Reactions / counters'})).toBeVisible();
});


test('North-south and Turtle domains expose detailed instruction',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 const search=page.getByPlaceholder(/search/i);
 await search.fill('Shoulder-roll back take');
 await page.getByRole('button',{name:/Shoulder-roll back take/}).click();
 await expect(page.getByText(/Shoulder, never neck/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Back take from turtle');
 await page.getByRole('button',{name:/Back take from turtle/}).click();
 await expect(page.getByText(/Hooks after control/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Anaconda choke');
 await page.getByRole('button',{name:/Anaconda choke/}).click();
 await expect(page.getByRole('heading',{name:'Why it works'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'How to drill it'})).toBeVisible();
});


test('Mount Technical mount and Back domains expose detailed instruction',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 const search=page.getByPlaceholder(/search/i);
 await search.fill('Upa escape');
 await page.getByRole('button',{name:/Upa escape/}).click();
 await expect(page.getByText(/Trap arm and foot on same side/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Gift-wrap back take');
 await page.getByRole('button',{name:/Gift-wrap back take/}).click();
 await expect(page.getByText(/Seatbelt before release/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Rear naked choke defense');
 await page.getByRole('button',{name:/Rear naked choke defense/}).click();
 await expect(page.getByText(/Hands fight choke first/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Rear naked choke');
 await page.getByRole('button',{name:/Back · attacks · Competency/}).click();
 await expect(page.getByRole('heading',{name:'Why it works'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'How to drill it'})).toBeVisible();
});


test('Self-defense Standing and Takedown domains expose detailed instruction',async({page})=>{
 await page.getByRole('button',{name:'BJJ',exact:true}).click();
 await page.getByRole('button',{name:'Techniques',exact:true}).click();
 const search=page.getByPlaceholder(/search/i);
 await search.fill('Standing guillotine defense');
 await page.getByRole('button',{name:/Standing guillotine defense/}).click();
 await expect(page.getByText(/Hands on choke first/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Snap down · sprawl · take the back');
 await page.getByRole('button',{name:/Snap down · sprawl · take the back/}).click();
 await expect(page.getByText(/Hips heavy on sprawl/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Body lock · head in front takedown');
 await page.getByRole('button',{name:/Body lock · head in front takedown/}).click();
 await expect(page.getByText(/Move their feet/)).toBeVisible();
 await page.keyboard.press('Escape');
 await search.fill('Uchi mata');
 await page.getByRole('button',{name:/Uchi mata/}).click();
 await expect(page.getByText(/Kuzushi before leg/)).toBeVisible();
 await expect(page.getByRole('heading',{name:'How to drill it'})).toBeVisible();
});


test('BJJ Current Focus is deliberate and shows focus note',{tag:'@bjj'},async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'Techniques',exact:true}).click();const search=page.getByLabel('Search techniques');await search.fill('Underhook Knee Pick');await page.getByRole('button',{name:/Underhook Knee Pick/}).click();const focus=page.getByLabel('Current Focus');if(!(await focus.isChecked()))await focus.check();await page.getByPlaceholder('e.g. Move their weight before attacking the leg').fill('Move their feet first');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Overview'}).click();await expect(page.getByText('Move their feet first')).toBeVisible();});


test('BJJ My Game exposes pathway architecture',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game'}).click();await expect(page.getByRole('heading',{name:'Your grappling system'})).toBeVisible();await expect(page.getByRole('navigation',{name:'My Game strategic framework'})).toBeVisible();});


test('BJJ techniques can define personal My Game connections',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'Techniques',exact:true}).click();await page.getByLabel('Search techniques').fill('Underhook Knee Pick');await page.getByRole('button',{name:/Underhook Knee Pick/}).click();await expect(page.getByText('MY GAME BRANCHES')).toBeVisible();await expect(page.getByLabel('My response')).toBeVisible();});


test('BJJ My Game supports reaction-specific decision branches',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'Techniques',exact:true}).click();await page.getByLabel('Search techniques').fill('Underhook Knee Pick');await page.getByRole('button',{name:/Underhook Knee Pick/}).click();await expect(page.getByText('MY GAME BRANCHES')).toBeVisible();await page.getByPlaceholder('e.g. They post the far hand or turn away').fill('They turn away');const response=page.getByLabel('My response');const backTake=await response.locator('option').filter({hasText:'Back take from turtle'}).first().getAttribute('value');expect(backTake).toBeTruthy();await response.selectOption(backTake!);await page.getByRole('button',{name:'Add branch'}).click();await expect(page.getByText('They turn away')).toBeVisible();await expect(page.getByText(/→ Back take from turtle/)).toBeVisible();});


test('BJJ technique modal preserves the originating tab',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game'}).click();await expect(page.getByRole('button',{name:'My Game',exact:true})).toHaveClass(/active/);const technique=page.locator('.my-game-primary').first();if(await technique.count()){await technique.locator('b').click();await expect(page.locator('.bjj-tech-modal')).toBeVisible();await expect(page.getByRole('button',{name:'My Game',exact:true})).toHaveClass(/active/);await page.keyboard.press('Escape');await expect(page.locator('.bjj-tech-modal')).toBeHidden();await expect(page.getByRole('heading',{name:'Your grappling system'})).toBeVisible();}});


test('BJJ My Game surfaces route health and gaps',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game'}).click();const stats=page.locator('.my-game-stats');await expect(stats).toBeVisible();await expect(stats.getByText('techniques')).toBeVisible();await expect(stats.getByText('branches')).toBeVisible();await expect(stats.getByText('gaps')).toBeVisible();await expect(stats.getByText('focus')).toBeVisible();});


test('BJJ My Game uses streamlined strategic route workspace',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game'}).click();await expect(page.getByRole('heading',{name:'Your grappling system'})).toBeVisible();await expect(page.getByRole('navigation',{name:'My Game strategic framework'})).toBeVisible();await expect(page.getByText('Create top position from the feet.').first()).toBeVisible();await expect(page.getByText('Advance control toward a finish.').first()).toBeVisible();await expect(page.getByText('Escape danger and recover offense.').first()).toBeVisible();await expect(page.getByText('Survive, escape and rebuild position.').first()).toBeVisible();});


test('Every BJJ technique exposes suggested next moves',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'Techniques',exact:true}).click();const cards=page.locator('.bjj-tech-card');const count=await cards.count();expect(count).toBeGreaterThan(0);for(let i=0;i<Math.min(count,12);i++){await cards.nth(i).click();await expect(page.getByRole('heading',{name:'Suggested next moves'})).toBeVisible();await expect(page.locator('.bjj-suggested-next').locator('button, .bjj-next-unlinked').first()).toBeVisible();await page.keyboard.press('Escape');}});


test('BJJ My Game can add a defense recovery technique directly',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game'}).click();const picker=page.getByLabel('Add technique to Defense / recovery');await expect(picker).toBeVisible();const option=picker.locator('option').filter({hasText:'Rear naked choke defense'}).first();const value=await option.getAttribute('value');expect(value).toBeTruthy();await picker.selectOption(value!);const route=page.locator('#game-route-3');await expect(route.getByText('Rear naked choke defense')).toBeVisible();});


test('BJJ My Game can remove a technique without deleting it from the library',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game'}).click();const picker=page.getByLabel('Add technique to Defense / recovery');const option=picker.locator('option').filter({hasText:'Rear naked choke defense'}).first();const value=await option.getAttribute('value');if(value){await picker.selectOption(value);const route=page.locator('#game-route-3');await expect(route.getByText('Rear naked choke defense')).toBeVisible();await page.getByRole('button',{name:'Remove Rear naked choke defense from My Game'}).click();await expect(route.getByText('Rear naked choke defense')).toBeHidden();await page.getByRole('button',{name:'Techniques',exact:true}).click();await page.getByLabel('Search techniques').fill('Rear naked choke defense');await expect(page.getByRole('button',{name:/Rear naked choke defense/})).toBeVisible();}});


test('BJJ My Game techniques can be prioritized within a route',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game',exact:true}).click();const route=page.locator('#game-route-2');const rows=route.locator('.my-game-row');if(await rows.count()>1){const second=rows.nth(1);const name=(await second.locator('.my-game-primary b').textContent())!;await second.getByRole('button',{name:'Move '+name+' up'}).click();await expect(route.locator('.my-game-row').first().locator('.my-game-primary b')).toHaveText(name);}});


test('BJJ My Game techniques can be assigned strategic roles',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game',exact:true}).click();const row=page.locator('.my-game-row').first();if(await row.count()){const name=(await row.locator('.my-game-primary b').textContent())!;const role=page.getByLabel('Role for '+name);await role.selectOption('Primary');await expect(role).toHaveValue('Primary');await page.reload();await page.getByRole('button',{name:'BJJ'}).click();await page.getByRole('button',{name:'My Game',exact:true}).click();await expect(page.getByLabel('Role for '+name)).toHaveValue('Primary');}});


test('Dashboard surfaces upcoming training as part of the daily workflow',async({page})=>{await page.goto('/');await expect(page.getByText('UP NEXT',{exact:true})).toBeVisible();await expect(page.locator('.dashboard-up-next')).toBeVisible();await expect(page.locator('.dashboard-up-next').getByRole('button',{name:/Calendar/})).toBeVisible();});




test('Dashboard can complete a due planned activity directly',async({page})=>{await page.addInitScript(()=>{const d=new Date(),date=d.toLocaleDateString('en-CA');localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([{id:'dashboard-action',date,title:'Dashboard Action',type:'Mobility',status:'Planned'}]));});await page.goto('/');await page.getByRole('button',{name:'Mark Dashboard Action complete'}).click();await expect(page.getByRole('button',{name:'Mark Dashboard Action planned'})).toBeVisible();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').find((p:any)=>p.id==='dashboard-action')?.status)).toBe('Completed');});


test('Dashboard surfaces the latest completed training and links to History',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'Today',exact:true}).click();const first=page.locator('.exercise-card').first();if(await first.count()){await first.getByRole('button',{name:/start/i}).click().catch(()=>{});}await page.getByRole('button',{name:'Dashboard',exact:true}).click();const card=page.locator('.dashboard-last-session');if(await card.count()){await expect(card).toBeVisible();await card.getByRole('button',{name:'History'}).click();await expect(page.getByRole('button',{name:'History',exact:true})).toHaveClass(/active/);}});


test('Analytics supports 7 30 and 90 day training ranges',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'Progress',exact:true}).click();await expect(page.getByText('ALL TRAINING · 7D')).toBeVisible();await page.getByRole('button',{name:'30D'}).click();await expect(page.getByText('ALL TRAINING · 30D')).toBeVisible();await page.getByRole('button',{name:'90D'}).click();await expect(page.getByText('ALL TRAINING · 90D')).toBeVisible();});


test('Analytics compares current training with the previous period',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'Progress',exact:true}).click();const trends=page.locator('.analytics-trends');await expect(trends).toBeVisible();await expect(trends.getByRole('heading',{name:'Compared with previous 7 days'})).toBeVisible();await expect(trends.getByText('Training frequency')).toBeVisible();await expect(trends.getByText('Strength volume')).toBeVisible();await expect(trends.getByText('BJJ load')).toBeVisible();await expect(trends.getByText('Readiness')).toBeVisible();await page.getByRole('button',{name:'30D'}).click();await expect(trends.getByRole('heading',{name:'Compared with previous 30 days'})).toBeVisible();});


test('Editing a weight goal persists its target and goal fields',async({page})=>{await page.goto('/');await nav(page,'Goals').click();await page.getByRole('button',{name:'Add goal'}).click();await page.getByRole('button',{name:'Body Composition',exact:true}).click();const builder=page.locator('.typed-goal-builder');await builder.getByLabel('Target value').fill('190');await builder.getByRole('button',{name:'Create body goal'}).click();const card=page.locator('.goal-card').filter({hasText:'Weight Goal'});await card.getByRole('button',{name:'Edit goal'}).click();await builder.getByLabel('Target value').fill('185');await builder.getByRole('button',{name:/Continue/i}).click();await builder.getByRole('button',{name:/Continue/i}).click();await builder.getByRole('button',{name:/Continue/i}).click();await builder.getByRole('button',{name:'Save goal'}).click();await expect(card.getByText(/of 185 lb/)).toBeVisible();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.goals.v2')||'[]').find((g:any)=>g.name==='Weight Goal')?.target)).toBe(185);});
















test('BJJ calendar sessions remain manually completable while adherence requires attendance',async({page})=>{await page.addInitScript(()=>{const d=new Date();d.setDate(d.getDate()-1);const date=d.toLocaleDateString('en-CA');if(!localStorage.getItem('workoutapp.planned-activities.v1'))localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([{id:'calendar-toggle-bjj',date,title:'BJJ',type:'BJJ',status:'Planned'}]));if(!localStorage.getItem('workoutapp.bjj-sessions.v1'))localStorage.setItem('workoutapp.bjj-sessions.v1','[]');});await page.goto('/');await page.getByRole('button',{name:'Calendar',exact:true}).first().click();const plan=page.getByText('○ BJJ').first();await expect(plan).toBeVisible();await plan.click();await expect(page.getByText('✓ BJJ').first()).toBeVisible();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').find((p:any)=>p.id==='calendar-toggle-bjj')?.status)).toBe('Completed');await page.reload();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]').find((p:any)=>p.id==='calendar-toggle-bjj')?.status)).toBe('Completed');await page.getByRole('button',{name:'Calendar',exact:true}).first().click();await expect(page.getByText('✓ BJJ').first()).toBeVisible();await page.getByRole('button',{name:'Dashboard',exact:true}).first().click();await expect(page.getByText('Today',{exact:true}).first()).toBeVisible();});


test('Arc goal supporting targets can create a Calendar plan',async({page})=>{await nav(page,'Goals').click();await page.getByRole('button',{name:'New goal'}).click();await page.getByRole('button',{name:'Event',exact:true}).click();await page.getByLabel('Goal name').fill('Arc Test Event');await page.getByRole('button',{name:'Continue'}).click();await page.getByRole('button',{name:'Continue'}).click();await page.getByRole('button',{name:/Supporting target/i}).click();await page.getByLabel('Supporting target 1').fill('BJJ practice');await page.locator('.goal-support-list select').selectOption('BJJ');await page.getByRole('button',{name:'Continue'}).click();await page.getByRole('button',{name:'Create goal'}).click();await page.getByRole('button',{name:/Add to Calendar/i}).click();await expect(page.locator('main h1').first()).toHaveText('Calendar');await expect(page.getByText('BJJ practice').first()).toBeVisible();const plans=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]'));expect(plans.some((p:any)=>p.title==='BJJ practice'&&p.id.startsWith('goal:'))).toBeTruthy();});
