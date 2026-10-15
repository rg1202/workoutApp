import {test,expect} from '@playwright/test';

test('Arc backup export excludes credential-like keys and preserves ordinary activity records',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 const result=await page.evaluate(async()=>{
  localStorage.setItem('arc.goals-test.v1',JSON.stringify([{id:'safe-record'}]));
  localStorage.setItem('arc.auth.token','do-not-export');
  localStorage.setItem('workoutapp.refresh-token.v1','do-not-export');
  localStorage.setItem('arc.password.v1','do-not-export');
  const {createArcBackup}=await import('/src/arc/dataBackup.ts');
  const backup=createArcBackup(localStorage);
  return backup.data;
 });
 expect(result['arc.goals-test.v1']).toContain('safe-record');
 expect(result).not.toHaveProperty('arc.auth.token');
 expect(result).not.toHaveProperty('workoutapp.refresh-token.v1');
 expect(result).not.toHaveProperty('arc.password.v1');
});

test('Arc backup refuses to report success when stored data changes during export',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 const result=await page.evaluate(async()=>{
  const {createArcBackup}=await import('/src/arc/dataBackup.ts');
  const entries=new Map([['arc.sample.v1','first']]);
  let reads=0;
  const storage={
   get length(){return entries.size},
   key(index:number){return [...entries.keys()][index]??null},
   getItem(key:string){reads++;return reads>1?'changed':entries.get(key)??null}
  } as Storage;
  try{createArcBackup(storage);return 'unexpected-success'}catch(e){return (e as Error).message}
 });
 expect(result).toMatch(/changed during backup/);
});

test('Arc backup fails safely when an enumerated storage record becomes unreadable',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 const message=await page.evaluate(async()=>{
  const {createArcBackup}=await import('/src/arc/dataBackup.ts');
  const storage={length:1,key:()=> 'arc.missing.v1',getItem:()=>null} as unknown as Storage;
  try{createArcBackup(storage);return 'unexpected-success'}catch(error){return (error as Error).message}
 });
 expect(message).toMatch(/became unavailable during backup/);
});

test('Read-only storage inspection flags malformed goals without changing stored bytes',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 const result=await page.evaluate(async()=>{
  const {inspectArcStorage}=await import('/src/arc/dataBackup.ts');
  const original='{malformed';
  localStorage.setItem('workoutapp.goals.v2',original);
  const report=inspectArcStorage(localStorage);
  return {report,unchanged:localStorage.getItem('workoutapp.goals.v2')===original};
 });
 expect(result.report.ok).toBe(false);
 expect(result.report.issues).toEqual(expect.arrayContaining([expect.objectContaining({key:'workoutapp.goals.v2'})]));
 expect(result.unchanged).toBe(true);
});

test('Corrupted browser data displays a non-destructive warning on next load',async({page})=>{
 await page.goto('/');
 await page.getByRole('checkbox',{name:/I have read and understand this private beta notice/i}).check();
 await page.getByRole('button',{name:'Continue to Arc'}).click();
 await page.evaluate(()=>localStorage.setItem('workoutapp.goals.v2','{broken'));
 await page.reload();
 const warning=page.getByRole('alert').filter({hasText:'Arc found a problem reading saved data'});
 await expect(warning).toBeVisible();
 await warning.getByText(/Show affected records/).click();
 await expect(warning.getByText(/workoutapp.goals.v2/)).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('workoutapp.goals.v2'))).toBe('{broken');
});
