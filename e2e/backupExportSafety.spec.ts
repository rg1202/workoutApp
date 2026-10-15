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
