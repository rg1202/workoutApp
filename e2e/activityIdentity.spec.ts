import {test,expect} from '@playwright/test';
import {uniqueActivities} from '../src/arc/uniqueActivities';
import {weeklyCoverage} from '../src/arc/goalCoverage';
import {goalSignal} from '../src/arc/goalIntelligence';
import type {PlannedActivity} from '../src/plans';
import type {Goal} from '../src/goals';

const goal={id:'goal-1',supportingTargets:[{activityType:'BJJ',frequencyPerWeek:2}]} as Goal;
const session=(id:string,status:PlannedActivity['status'],linkedActivityId?:string):PlannedActivity=>({
 id,date:'2026-10-07',title:'BJJ',type:'BJJ',status,linkedActivityId,goalIds:['goal-1'],
 actuals:status==='Completed'?{actualDurationMinutes:60}:undefined
});

test('one linked activity counts once in weekly goal progress',()=>{
 const plans=[session('calendar','Planned','session-1'),session('history','Completed','session-1')];
 expect(uniqueActivities(plans)).toHaveLength(1);
 expect(weeklyCoverage(goal,plans,'2026-10-07')[0].completed).toBe(1);
 expect(goalSignal(goal,plans,'2026-10-07').weeklyCompleted).toBe(1);
 expect(goalSignal(goal,plans,'2026-10-07').actualMinutes).toBe(60);
});

test('distinct completed sessions remain distinct',()=>{
 const plans=[session('one','Completed','session-1'),session('two','Completed','session-2')];
 expect(uniqueActivities(plans)).toHaveLength(2);
 expect(weeklyCoverage(goal,plans,'2026-10-07')[0].completed).toBe(2);
});

test('duplicate plan ID and skipped sessions do not inflate completion',()=>{
 const plans=[session('one','Planned'),session('one','Completed'),session('two','Skipped')];
 expect(uniqueActivities(plans)).toHaveLength(2);
 expect(goalSignal(goal,plans,'2026-10-07').weeklyCompleted).toBe(1);
});
