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
 await page.getByLabel(/Event name/i).selectOption('__other');
 await page.getByLabel('Other Event name').fill('E2E Tournament');
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
 await page.getByRole('button',{name:/Log set/i}).first().click();
 await page.getByRole('button',{name:/Finish workout/i}).click();
 await nav(page,'History').click();
 await expect(page.getByText('E2E Flow Workout')).toBeVisible();
 await nav(page,'Calendar').click();
 await expect(page.getByText('E2E Flow Workout').first()).toBeVisible();
 await expect(page.getByText(/✓ E2E Flow Workout/)).toBeVisible();
 await nav(page,'Analytics').click();
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
 await nav(page,'Analytics').click();
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
 await page.getByRole('button',{name:/Add goal/i}).click();
 await page.getByRole('button',{name:'Body',exact:true}).click();
 await page.getByLabel(/Goal name/i).selectOption('__other');
 await page.getByLabel('Other Goal name').fill('Competition Cut');
 await page.getByLabel('Metric').selectOption({label:'Bodyweight'});
 await page.getByLabel('Target').fill('194');
 await page.getByLabel('Unit').selectOption({label:'lb'});
 await page.getByRole('button',{name:/Create body goal/i}).click();
 await expect(page.getByText(/198/).first()).toBeVisible();
 await expect(page.getByText(/^0%/)).toBeVisible();
 await nav(page,'Dashboard').click();
 const goals=page.locator('.overview-goals');
 await expect(goals.getByText('Competition Cut')).toBeVisible();
 await expect(goals.getByText(/198 \/ 194 lb/)).toBeVisible();
 await expect(goals.getByText(/^0%/)).toBeVisible();
 await nav(page,'Analytics').click();
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
 await nav(page,'Analytics').click();
 await page.locator('#bm-weight').fill('197');
 await page.getByRole('button',{name:/Save measurements/i}).click();
 await nav(page,'Goals').click();
 await page.getByRole('button',{name:/Add goal/i}).click();
 await page.getByRole('button',{name:'Body',exact:true}).click();
 await page.getByLabel('Target').fill('190');
 await page.getByRole('button',{name:/Create body goal/i}).click();
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


test('adherence KPIs use current calendar week month quarter and year',async({page})=>{
 const now=new Date(),iso=(d:Date)=>d.toLocaleDateString('en-CA');
 const monday=new Date(now);monday.setDate(now.getDate()-((now.getDay()+6)%7));
 const priorWeek=new Date(monday);priorWeek.setDate(monday.getDate()-1);
 const priorMonth=new Date(now.getFullYear(),now.getMonth()-1,15);
 const priorQuarter=new Date(now.getFullYear(),Math.floor(now.getMonth()/3)*3-1,15);
 const priorYear=new Date(now.getFullYear()-1,6,15);
 await page.evaluate(({current,priorWeek,priorMonth,priorQuarter,priorYear})=>localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify([
  {id:'a1',date:current,title:'Current',type:'BJJ',status:'Completed'},
  {id:'a2',date:current,title:'Current missed',type:'BJJ',status:'Planned'},
  {id:'a3',date:priorWeek,title:'Earlier week',type:'BJJ',status:'Completed'},
  {id:'a4',date:priorMonth,title:'Earlier month',type:'BJJ',status:'Completed'},
  {id:'a5',date:priorQuarter,title:'Earlier quarter',type:'BJJ',status:'Completed'},
  {id:'a6',date:priorYear,title:'Earlier year',type:'BJJ',status:'Planned'}
 ])),{current:iso(now),priorWeek:iso(priorWeek),priorMonth:iso(priorMonth),priorQuarter:iso(priorQuarter),priorYear:iso(priorYear)});
 await page.reload();
 const kpis=page.locator('.overview-adherence .adherence-kpi');
 await expect(kpis).toHaveCount(5);
 const week=kpis.filter({hasText:'Week'});await expect(week).toContainText('50%');await expect(week).toContainText('1/2 complete');
 const all=kpis.filter({hasText:'All history'});await expect(all).toContainText('67%');await expect(all).toContainText('4/6 complete');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('workoutapp.planned-activities.v1')||'[]'));
 expect(stored).toHaveLength(6);
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


test('adherence includes the final day of calendar periods',async({page})=>{
 const now=new Date(),key=(d:Date)=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
 const monthEnd=new Date(now.getFullYear(),now.getMonth()+1,0);
 const quarterStartMonth=Math.floor(now.getMonth()/3)*3,quarterEnd=new Date(now.getFullYear(),quarterStartMonth+3,0);
 const yearEnd=new Date(now.getFullYear(),11,31);
 await page.evaluate(({monthEnd,quarterEnd,yearEnd})=>{
  const plans=[
   {id:'boundary-month',date:monthEnd,title:'Month boundary',type:'BJJ',status:'Planned'},
   {id:'boundary-quarter',date:quarterEnd,title:'Quarter boundary',type:'BJJ',status:'Planned'},
   {id:'boundary-year',date:yearEnd,title:'Year boundary',type:'BJJ',status:'Planned'}
  ];
  localStorage.setItem('workoutapp.planned-activities.v1',JSON.stringify(plans));
 },{monthEnd:key(monthEnd),quarterEnd:key(quarterEnd),yearEnd:key(yearEnd)});
 await page.reload();
 const card=page.locator('.overview-adherence');
 const total=async(label:string)=>{const text=await card.locator('.adherence-kpi').filter({hasText:label}).locator('small').innerText();return Number(text.match(/\/(\d+) complete$/)?.[1]??-1)};
 const expected=(start:Date,end:Date)=>[monthEnd,quarterEnd,yearEnd].filter(d=>d>=start&&d<=end).length;
 const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
 const quarterStart=new Date(now.getFullYear(),quarterStartMonth,1);
 const yearStart=new Date(now.getFullYear(),0,1);
 expect(await total('Month')).toBe(expected(monthStart,monthEnd));
 expect(await total('Quarter')).toBe(expected(quarterStart,quarterEnd));
 expect(await total('Year')).toBe(expected(yearStart,yearEnd));
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
