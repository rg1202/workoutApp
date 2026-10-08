import type {PlannedActivity} from '../plans';
export const timeMinutes=(value:string)=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return null;const [h,m]=value.split(':').map(Number);return h*60+m};
export function timeConflicts(plans:PlannedActivity[],date:string,time:string,duration:number){
 const start=timeMinutes(time);if(start===null||!Number.isFinite(duration)||duration<=0)return [];
 return plans.filter(p=>p.date===date&&p.status!=='Skipped'&&p.time&&p.durationMinutes&&timeMinutes(p.time)!==null).filter(p=>{
  const other=timeMinutes(p.time!)!;return start<other+p.durationMinutes!&&other<start+duration;
 });
}
export function candidateTimes(plans:PlannedActivity[],date:string,duration:number){
 return ['06:00','07:00','08:00','12:00','16:00','17:00','18:00','19:00'].map(time=>({time,conflicts:timeConflicts(plans,date,time,duration)}));
}
