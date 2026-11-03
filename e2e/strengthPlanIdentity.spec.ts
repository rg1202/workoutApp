import {test,expect} from '@playwright/test';
import {matchPlans} from '../src/planMatching';
import type {PlannedActivity} from '../src/plans';
import type {UnifiedActivity} from '../src/activities';

const plan=(id:string,date='2026-11-02'):PlannedActivity=>({id,date,title:'Strength',type:'Strength',status:'Planned'});
const activity=(id:string,plannedActivityId?:string,date='2026-11-02'):UnifiedActivity=>({
 id:'strength:'+id,sourceId:id,kind:'Strength',date,startDate:date+'T12:00:00Z',title:'Strength',subtitle:'1 logged set',
 strength:{id,name:'Strength',completedAt:date+'T12:00:00Z',sets:[],...(plannedActivityId?{plannedActivityId}:{})}
});

test('explicit plan identity takes priority over date and plan order',()=>{
 const result=matchPlans([plan('other'),plan('target')],[activity('session-1','target')]);
 expect(result[0].status).toBe('Planned');
 expect(result[1].linkedActivityId).toBe('strength:session-1');
 expect(result[1].status).toBe('Completed');
});

test('explicitly linked workout is not stolen by another same-day plan',()=>{
 const result=matchPlans([plan('other')],[activity('session-1','target')]);
 expect(result[0].status).toBe('Planned');
 expect(result[0].linkedActivityId).toBeUndefined();
});

test('legacy unlinked workout retains heuristic matching',()=>{
 const result=matchPlans([plan('legacy')],[activity('session-1')]);
 expect(result[0].linkedActivityId).toBe('strength:session-1');
 expect(result[0].status).toBe('Completed');
});

test('explicit identity survives rescheduling to another day',()=>{
 const result=matchPlans([plan('target','2026-11-03')],[activity('session-1','target')]);
 expect(result[0].linkedActivityId).toBe('strength:session-1');
});
