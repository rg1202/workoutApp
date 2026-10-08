import type {Goal} from '../goals';
import type {PlannedActivity,PlannedActivityType} from '../plans';
export type CoverageRow={type:PlannedActivityType;target:number;completed:number;scheduled:number;missing:number};
export function weeklyCoverage(goal:Goal,plans:PlannedActivity[],date:string):CoverageRow[]{
 const now=new Date(date+'T12:00:00'),start=new Date(now);start.setDate(now.getDate()-now.getDay());
 const end=new Date(start);end.setDate(start.getDate()+6);
 const iso=(d:Date)=>d.toLocaleDateString('en-CA');
 const linked=plans.filter(p=>p.goalIds?.includes(goal.id)||(p.sourceType==='Goal'&&p.sourceId===goal.id));
 const week=linked.filter(p=>p.date>=iso(start)&&p.date<=iso(end));
 const types=Array.from(new Set((goal.supportingTargets??[]).map(t=>t.activityType)));
 return types.map(type=>{
  const target=(goal.supportingTargets??[]).filter(t=>t.activityType===type).reduce((n,t)=>n+Math.max(0,t.frequencyPerWeek||0),0);
  const completed=week.filter(p=>p.type===type&&p.status==='Completed').length;
  const scheduled=week.filter(p=>p.type===type&&p.status==='Planned').length;
  return {type,target,completed,scheduled,missing:Math.max(0,target-completed-scheduled)};
 });
}
