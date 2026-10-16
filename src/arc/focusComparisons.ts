import type {PlannedActivity} from '../plans';
import {uniqueActivities} from './uniqueActivities';
import {inferSessionDomain,type FocusId} from './focusSessionRegistry';

type MetricKey='actualDurationMinutes'|'distanceKm'|'rounds'|'liveMinutes'|'effort';
export type FocusComparison={focus:FocusId;sessionCount:number;metrics:{key:MetricKey;label:string;unit:string;plannedTotal:number|null;actualTotal:number|null;pairedCount:number}[]};
const keys:Record<FocusId,{key:MetricKey;label:string;unit:string}[]>={
 BJJ:[{key:'actualDurationMinutes',label:'Training time',unit:'min'},{key:'rounds',label:'Rounds',unit:''},{key:'liveMinutes',label:'Live time',unit:'min'}],
 Running:[{key:'distanceKm',label:'Distance',unit:'km'},{key:'actualDurationMinutes',label:'Duration',unit:'min'}],
 Cycling:[{key:'distanceKm',label:'Distance',unit:'km'},{key:'actualDurationMinutes',label:'Duration',unit:'min'}]
};
export function focusComparisons(plans:PlannedActivity[],start:string,end:string):FocusComparison[]{
 const completed=uniqueActivities(plans).filter(p=>p.status==='Completed'&&p.date>=start&&p.date<=end);
 return (['BJJ','Running','Cycling'] as const).map(focus=>{
  const sessions=completed.filter(p=>inferSessionDomain(p.type,p.title,p.specificPlan?.discipline)===focus);
  return {focus,sessionCount:sessions.length,metrics:keys[focus].map(metric=>{
   const pairs=sessions.map(p=>{
    const planned=metric.key==='actualDurationMinutes'?p.durationMinutes:metric.key==='distanceKm'?(p.plannedMetrics?.distanceKm??p.specificPlan?.distanceKm):p.plannedMetrics?.[metric.key];
    const actual=p.actuals?.[metric.key];
    return {planned,actual};
   }).filter((pair):pair is {planned:number;actual:number}=>typeof pair.planned==='number'&&Number.isFinite(pair.planned)&&typeof pair.actual==='number'&&Number.isFinite(pair.actual));
   return {...metric,pairedCount:pairs.length,plannedTotal:pairs.length?Math.round(pairs.reduce((sum,p)=>sum+p.planned,0)*10)/10:null,actualTotal:pairs.length?Math.round(pairs.reduce((sum,p)=>sum+p.actual,0)*10)/10:null};
  })};
 });
}
