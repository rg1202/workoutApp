import {test,expect} from '@playwright/test';
import {activeStrengthPlanForSession} from '../src/arc/activeStrengthPlan';
import type {PlannedActivity} from '../src/plans';
import type {SessionRecord} from '../src/storage';

const plan:PlannedActivity={id:'program:p:1:d',date:'2026-11-02',title:'Strength',type:'Strength',status:'Planned'};
const selection={planId:plan.id,programId:'p',week:1,dayId:'d'};

test('explicit selection survives rescheduling',()=>{
 expect(activeStrengthPlanForSession(selection,'p',1,'d',[{...plan,date:'2026-11-05'}],[])?.id).toBe(plan.id);
});
test('selection never binds to another program day',()=>{
 expect(activeStrengthPlanForSession(selection,'p',1,'other',[plan],[])).toBeUndefined();
});
test('already recorded session cannot be reused',()=>{
 const history:SessionRecord[]=[{id:'done',plannedActivityId:plan.id,name:'Strength',completedAt:'2026-11-02T12:00:00Z',sets:[]}];
 expect(activeStrengthPlanForSession(selection,'p',1,'d',[plan],history)).toBeUndefined();
});
