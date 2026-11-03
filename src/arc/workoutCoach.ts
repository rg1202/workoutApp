import type {StoredSet,SessionRecord} from '../storage';
import type {Prescription,Program} from '../programs';
export type Readiness={energy:number;soreness:number;sleep:number};
export type CoachInput={prescription:Prescription;program:Program;exerciseId:string;current:StoredSet[];history:SessionRecord[];readiness?:Readiness;restPreset:number;isStrength:boolean};
const working=(sets:StoredSet[])=>sets.filter(s=>(s.kind??'Working')==='Working');
const volume=(sets:StoredSet[])=>working(sets).reduce((n,s)=>n+Math.max(0,s.weight)*Math.max(0,s.reps),0);
export function coachDecision({prescription:p,program,exerciseId,current,history,readiness,restPreset,isStrength}:CoachInput){
 const sets=working(current),last=sets[sets.length-1];
 const sessions=history.filter(s=>s.sets.some(x=>x.exerciseId===exerciseId&&(x.set.kind??'Working')==='Working')).sort((a,b)=>Date.parse(b.completedAt)-Date.parse(a.completedAt));
 const previous=working(sessions[0]?.sets.filter(x=>x.exerciseId===exerciseId).map(x=>x.set)??[]);
 const previousLoad=previous[previous.length-1]?.weight;
 const baseline=last?.weight??previousLoad??(exerciseId===p.exerciseId?p.weight:0);
 const drop=sets.length>1&&sets[0].reps>0?(sets[0].reps-last.reps)/sets[0].reps:0;
 const missed=!!last&&(last.reps<p.minReps||last.rir<Math.max(0,p.rir-1));
 const fatigue=missed&&drop>=.2?'Elevated':missed||drop>=.2?'Possible':'None';
 const deload=program.progression.type!=='None'&&program.progression.deloadEvery>0&&program.activeWeek>1&&program.activeWeek%program.progression.deloadEvery===0;
 const phase=deload?'Scheduled deload':program.progression.type==='Block Periodization'?'Block periodization':program.goal+' emphasis';
 const step=Math.max(2.5,program.progression.loadStep||5);
 const load=isStrength?Math.max(0,missed&&last?last.weight-step:deload&&!sets.length?Math.round(baseline*(1-Math.min(.6,Math.max(0,program.progression.deloadPercent)/100))*2)/2:baseline):baseline;
 const restSeconds=Math.max(restPreset,missed?120:0,program.goal==='Strength'&&isStrength?120:0,fatigue==='Elevated'?180:0);
 const reason=missed?'Last set missed the rep or effort floor.':deload?'Scheduled deload load.':previous.length&&!sets.length?'Based on previous working-set performance.':last?'Hold working load; progress between sessions.':'Establish and confirm a starting load.';
 const currentVolume=volume(current),previousVolume=volume(previous);
 const all=sessions.flatMap(s=>working(s.sets.filter(x=>x.exerciseId===exerciseId).map(x=>x.set)));
 const records:string[]=[];
 if(all.length&&last&&last.weight>0&&last.reps>0){if(last.weight>Math.max(0,...all.map(x=>x.weight)))records.push('Weight PR');if(last.reps>Math.max(0,...all.map(x=>x.reps)))records.push('Rep PR');if(last.weight*last.reps>Math.max(0,...all.map(x=>x.weight*x.reps)))records.push('Set volume PR');if(last.weight*(1+last.reps/30)>Math.max(0,...all.map(x=>x.weight*(1+x.reps/30))))records.push('Estimated 1RM PR');if(currentVolume>Math.max(0,...sessions.map(s=>volume(s.sets.filter(x=>x.exerciseId===exerciseId).map(x=>x.set)))))records.push('Session volume PR');}
 const intervention=fatigue==='Elevated'?'Reps declined across sets. Consider a longer rest or lighter load.':missed?'Consider more rest or less load.':sets.length>=p.sets?'Prescribed working sets complete.':'Continue toward the rep and RIR targets.';
 const readinessNote=!readiness?'Readiness not recorded':readiness.energy<=2||readiness.sleep<=2||readiness.soreness>=4?'Lower reported readiness; monitor effort and recovery.':'Readiness recorded.';
 return {load,reps:p.minReps,restSeconds,reason,fatigue,phase,intervention,records,currentVolume,previousVolume,volumeDelta:previousVolume?Math.round((currentVolume-previousVolume)/previousVolume*100):null,readinessNote};
}
