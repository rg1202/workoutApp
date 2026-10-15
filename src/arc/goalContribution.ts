import type{Goal}from'../goals';
import type{PlannedActivity}from'../plans';
import{uniqueActivities}from'./uniqueActivities';

/** Explicit activity-type attribution: supportive mobility is never BJJ attendance. */
export function goalContribution(goal:Goal,plans:PlannedActivity[],start:string,end:string){
 const linked=uniqueActivities(plans).filter(p=>p.date>=start&&p.date<=end&&(p.goalIds?.includes(goal.id)||(p.sourceType==='Goal'&&p.sourceId===goal.id)));
 const completed=linked.filter(p=>p.status==='Completed');
 const bjjClasses=completed.filter(p=>p.type==='BJJ');
 const supporting=completed.filter(p=>p.type!=='BJJ');
 const byType=completed.reduce<Record<string,number>>((counts,p)=>({...counts,[p.type]:(counts[p.type]??0)+1}),{});
 const byProgram=completed.reduce<Record<string,number>>((counts,p)=>p.programId?{...counts,[p.programId]:(counts[p.programId]??0)+1}:counts,{});
 return{linked:linked.length,completed:completed.length,bjjAttendance:bjjClasses.length,supportingSessions:supporting.length,byType,byProgram};
}
