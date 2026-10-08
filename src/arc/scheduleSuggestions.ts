import type {PlannedActivity} from '../plans';
const iso=(d:Date)=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
export type ScheduleSuggestion={date:string;dayLabel:string;plannedCount:number;plannedMinutes:number;reason:string};
export function suggestScheduleDays(plans:PlannedActivity[],today:string,limit=4):ScheduleSuggestion[]{
 const now=new Date(today+'T12:00:00'),end=new Date(now);end.setDate(now.getDate()+(6-now.getDay()));
 const candidates:ScheduleSuggestion[]=[];
 for(let offset=0;offset<=6;offset++){
  const d=new Date(now);d.setDate(now.getDate()+offset);if(d>end)break;
  const date=iso(d),dayPlans=plans.filter(p=>p.date===date&&p.status!=='Skipped');
  const plannedMinutes=dayPlans.reduce((n,p)=>n+(p.durationMinutes??0),0);
  candidates.push({date,dayLabel:d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}),plannedCount:dayPlans.length,plannedMinutes,reason:dayPlans.length===0?'No activities planned':dayPlans.length+' already planned · '+plannedMinutes+' planned min'});
 }
 return candidates.sort((a,b)=>a.plannedCount-b.plannedCount||a.plannedMinutes-b.plannedMinutes||a.date.localeCompare(b.date)).slice(0,limit);
}
