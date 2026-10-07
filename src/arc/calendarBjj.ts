import type {BjjSession} from '../bjj';
import type {PlannedActivity} from '../plans';
export function syncCalendarBjj(sessions:BjjSession[],plan:PlannedActivity):BjjSession[]{
 const id=plan.linkedActivityId??'calendar:'+plan.id;
 const actuals=plan.actuals;
 if(plan.type!=='BJJ')return sessions;
 if(plan.status!=='Completed'||!actuals||actuals.actualDurationMinutes===undefined||actuals.effort===undefined){
  return sessions.filter(s=>s.id!==id||!s.id.startsWith('calendar:'));
 }
 const previous=sessions.find(s=>s.id===id);
 const next:BjjSession={
  id,date:plan.date,sessionType:previous?.sessionType??'Gi',
  durationMinutes:actuals.actualDurationMinutes,rpe:actuals.effort,
  rounds:actuals.rounds??previous?.rounds??0,
  liveMinutes:actuals.liveMinutes??previous?.liveMinutes??0,
  techniques:actuals.techniques??previous?.techniques??'',
  submissionsFor:actuals.submissionsFor??previous?.submissionsFor??0,
  submissionsAgainst:actuals.submissionsAgainst??previous?.submissionsAgainst??0,
  notes:plan.notes??previous?.notes??'',
 };
 return [...sessions.filter(s=>s.id!==id),next];
}
