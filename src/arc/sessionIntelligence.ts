import type{PlannedActivity,SessionMovement,SessionPrescription}from'../plans';

export type MovementSuggestion={movementId:string;name:string;sourceActivityId:string;sourceDate:string;previous:SessionMovement;proposed:SessionMovement;reason:string};
const normalized=(name:string)=>name.trim().toLocaleLowerCase().replace(/\\s+/g,' ');
/** Conservative opt-in suggestions. Never change prescribed work without user approval. */
export function sessionSuggestions(target:PlannedActivity,history:PlannedActivity[]):MovementSuggestion[]{
 if(!target.prescription||target.status!=='Planned')return[];
 const prior=history.filter(p=>p.id!==target.id&&p.status==='Completed'&&p.execution?.finishedAt&&p.prescription&&p.date<=target.date).sort((a,b)=>b.date.localeCompare(a.date));
 return target.prescription.movements.flatMap(m=>{
  const found=prior.map(p=>({activity:p,movement:p.prescription!.movements.find(x=>normalized(x.name)===normalized(m.name)),result:p.execution!.movements})).find(x=>x.movement&&x.result.some(r=>r.movementId===x.movement!.id&&r.completed));
  if(!found||!found.movement)return[];
  const actual=found.result.find(r=>r.movementId===found.movement!.id)!;
  const proposed:SessionMovement={...m};
  const changed:string[]=[];
  for(const [planned,recorded,label] of [['sets','actualSets','sets'],['reps','actualReps','reps'],['holdSeconds','actualHoldSeconds','hold seconds']] as const){
   const value=actual[recorded];
   if(typeof value==='number'&&Number.isFinite(value)&&value>0&&value!==m[planned]){
    // Avoid recommending increases beyond 20% from the current prescription.
    if(m[planned]!=null&&value>m[planned]! *1.2)continue;
    proposed[planned]=value;changed.push(label);
   }
  }
  return changed.length?[{movementId:m.id,name:m.name,sourceActivityId:found.activity.id,sourceDate:found.activity.date,previous:m,proposed,reason:'Last completed '+found.activity.type.toLowerCase()+' session recorded different '+changed.join(', ')+'. Review before applying.'}]:[];
 });
}
export function applySessionSuggestions(prescription:SessionPrescription,suggestions:MovementSuggestion[]):SessionPrescription{
 const selected=new Map(suggestions.map(s=>[s.movementId,s.proposed]));
 return {...prescription,movements:prescription.movements.map(m=>selected.has(m.id)?{...m,...selected.get(m.id),id:m.id}:m)};
}
