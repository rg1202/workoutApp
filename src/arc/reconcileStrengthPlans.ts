import type {PlannedActivity} from '../plans';
import type {SessionRecord} from '../storage';

/** Reconcile completed strength history against persisted manual calendar plans.
 * Generated program plans are derived from program history separately.
 * Explicit IDs are authoritative; legacy history is intentionally not assigned here.
 */
export function reconcileStrengthPlans(plans:PlannedActivity[],history:SessionRecord[]):PlannedActivity[]{
 const byPlan=new Map<string,SessionRecord>();
 for(const session of history){
  if(!session.plannedActivityId)continue;
  const previous=byPlan.get(session.plannedActivityId);
  if(!previous||session.completedAt>previous.completedAt)byPlan.set(session.plannedActivityId,session);
 }
 return plans.map(plan=>{
  if(plan.type!=='Strength'||plan.id.startsWith('program:')||plan.status==='Skipped')return plan;
  const session=byPlan.get(plan.id);
  if(!session)return plan;
  const linkedActivityId='strength:'+session.id;
  if(plan.status==='Completed'&&plan.linkedActivityId===linkedActivityId)return plan;
  return {...plan,status:'Completed',linkedActivityId,actuals:{...plan.actuals,...(session.durationMinutes!==undefined?{actualDurationMinutes:session.durationMinutes}:{})}};
 });
}
