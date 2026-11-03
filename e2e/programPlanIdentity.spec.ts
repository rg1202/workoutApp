import {test,expect} from '@playwright/test';
import {completeProgramPlans} from '../src/programSync';
import type {PlannedActivity} from '../src/plans';
import type {SessionRecord} from '../src/storage';

const plan=(id:string):PlannedActivity=>({id,date:'2026-11-02',title:'Strength',type:'Strength',status:'Planned',programId:'p'});
const record=(id:string,plannedActivityId?:string):SessionRecord=>({id,name:'Strength',programId:'p',week:1,dayId:'day',completedAt:'2026-11-02T12:00:00Z',sets:[],...(plannedActivityId?{plannedActivityId}:{})});

test('generated program completion prioritizes explicit identity over same slot',()=>{
 const result=completeProgramPlans([plan('program:p:1:day')],[record('wrong','program:p:2:day'),record('right','program:p:1:day')]);
 expect(result[0].linkedActivityId).toBe('strength:right');
});

test('explicitly assigned session cannot complete a different program plan',()=>{
 const result=completeProgramPlans([plan('program:p:1:day')],[record('other','program:p:2:day')]);
 expect(result[0].status).toBe('Planned');
 expect(result[0].linkedActivityId).toBeUndefined();
});

test('legacy program history still completes the matching plan',()=>{
 const result=completeProgramPlans([plan('program:p:1:day')],[record('legacy')]);
 expect(result[0].status).toBe('Completed');
 expect(result[0].linkedActivityId).toBe('strength:legacy');
});
