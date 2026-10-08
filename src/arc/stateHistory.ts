import type {DailyState} from './dailyState';
export const STATE_HISTORY_KEY='arc.state-history.v1';
export type StateRatingKey='mood'|'energy'|'motivation'|'soreness'|'stress';
export type StateObservation={id:string;date:string;recordedAt:string;ratings:Partial<Pick<DailyState,StateRatingKey>>};
export const stateKeys:StateRatingKey[]=['mood','energy','motivation','soreness','stress'];
export function latestState(history:StateObservation[],date:string):Partial<DailyState>{
 const entries=history.filter(x=>x.date===date).sort((a,b)=>a.recordedAt.localeCompare(b.recordedAt));
 return entries.reduce<Partial<DailyState>>((current,entry)=>({...current,...entry.ratings}),{});
}
