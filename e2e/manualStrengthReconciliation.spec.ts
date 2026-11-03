import {test,expect} from '@playwright/test';
import {reconcileStrengthPlans} from '../src/arc/reconcileStrengthPlans';
import type {PlannedActivity} from '../src/plans';
import type {SessionRecord} from '../src/storage';

const plan=(id:string):PlannedActivity=>({id,date:'2026-11-02',title:'Strength',type:'Strength',status:'Planned',goalIds:['goal-1']});
const record=(id:string,plannedActivityId?:string):SessionRecord=>({id,name:'Strength',completedAt:'2026-11-02T12:00:00Z',durationMinutes:42,sets:[],...(plannedActivityId?{plannedActivityId}:{})});

test('explicitly completed manual strength plan retains goal and recorded duration',()=>{
 const result=reconcileStrengthPlans([plan('manual-1')],[record('session-1','manual-1')]);
 expect(result[0]).toMatchObject({status:'Completed',linkedActivityId:'strength:session-1',goalIds:['goal-1'],actuals:{actualDurationMinutes:42}});
});

test('unlinked and mismatched strength history cannot complete manual plan',()=>{
 const result=reconcileStrengthPlans([plan('manual-1')],[record('legacy'),record('other','manual-2')]);
 expect(result[0].status).toBe('Planned');
});

test('reconciliation is idempotent and leaves skipped plans untouched',()=>{
 const skipped={...plan('manual-1'),status:'Skipped' as const};
 const first=reconcileStrengthPlans([skipped,plan('manual-2')],[record('session-1','manual-1'),record('session-2','manual-2')]);
 expect(first[0].status).toBe('Skipped');
 expect(reconcileStrengthPlans(first,[record('session-1','manual-1'),record('session-2','manual-2')])).toEqual(first);
});

test('partial strength history does not falsely complete a planned session',()=>{
 const partial={...record('partial','manual-1'),outcome:'Partial' as const};
 expect(reconcileStrengthPlans([plan('manual-1')],[partial])[0].status).toBe('Planned');
});
