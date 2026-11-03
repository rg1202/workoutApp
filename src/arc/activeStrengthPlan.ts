import type {PlannedActivity} from '../plans';
import type {SessionRecord} from '../storage';

export const ACTIVE_STRENGTH_PLAN_KEY='arc.active-strength-plan.v1';
export type ActiveStrengthPlan={planId:string;programId:string;week:number;dayId:string};

/** A selected program workout is stable across date changes and page reloads. */
export function activeStrengthPlanForSession(
 selection:ActiveStrengthPlan|null,
 programId:string,
 week:number,
 dayId:string,
 plans:PlannedActivity[],
 history:SessionRecord[]
):PlannedActivity|undefined{
 if(!selection||selection.programId!==programId||selection.week!==week||selection.dayId!==dayId)return;
 const plan=plans.find(p=>p.id===selection.planId&&p.type==='Strength'&&p.status==='Planned');
 if(!plan||history.some(h=>h.plannedActivityId===plan.id))return;
 return plan;
}
