import type {PlannedActivity} from '../plans';

/** Count a recorded activity once, even when the same session is represented by multiple plans.
 * Distinct plan IDs remain distinct unless they explicitly share a linked activity ID.
 * Prefer a completed representation over an unfinished duplicate.
 */
export function uniqueActivities(plans:PlannedActivity[]):PlannedActivity[]{
 const byKey=new Map<string,PlannedActivity>();
 for(const plan of plans){
  const key=plan.linkedActivityId?'activity:'+plan.linkedActivityId:'plan:'+plan.id;
  const previous=byKey.get(key);
  if(!previous||((plan.status==='Completed'?2:plan.status==='Skipped'?1:0)>(previous.status==='Completed'?2:previous.status==='Skipped'?1:0)))byKey.set(key,plan);
 }
 return [...byKey.values()];
}
