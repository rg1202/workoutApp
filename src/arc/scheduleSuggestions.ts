import{recoverySignals}from'./recoveryScheduling';
import type{DailyState}from'./dailyState';
import type{StateObservation}from'./stateHistory';
import type {PlannedActivity,PlannedActivityType} from '../plans';
const iso=(d:Date)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const parse=(date:string)=>new Date(date+'T12:00:00');
const add=(date:string,days:number)=>{const d=parse(date);d.setDate(d.getDate()+days);return iso(d)};
export type ScheduleSuggestion={date:string;dayLabel:string;plannedCount:number;plannedMinutes:number;reason:string;warnings:string[];score:number;weekMinutes:number;weekSessions:number;focusMinutes:number};
export function suggestScheduleDays(plans:PlannedActivity[],today:string,limit=4,activityType?:PlannedActivityType,durationMinutes=60,states:DailyState[]=[],history:StateObservation[]=[]):ScheduleSuggestion[]{
 const now=parse(today),weekEnd=new Date(now);weekEnd.setDate(now.getDate()+(6-now.getDay()));
 const end=iso(weekEnd),results:ScheduleSuggestion[]=[];
 const active=plans.filter(p=>p.status!=='Skipped');
 for(let date=today;date<=end;date=add(date,1)){
  const d=parse(date),dayPlans=active.filter(p=>p.date===date),previous=active.filter(p=>p.date===add(date,-1));
  const plannedMinutes=dayPlans.reduce((n,p)=>n+(p.durationMinutes??0),0);
  const weekStart=new Date(d);weekStart.setDate(d.getDate()-d.getDay());const weekEndDate=new Date(weekStart);weekEndDate.setDate(weekStart.getDate()+6);
  const weekPlans=active.filter(p=>p.date>=iso(weekStart)&&p.date<=iso(weekEndDate));
  const weekMinutes=weekPlans.reduce((n,p)=>n+(p.durationMinutes??0),0),weekSessions=weekPlans.length;
  const focusMinutes=weekPlans.filter(p=>p.type===activityType).reduce((n,p)=>n+(p.durationMinutes??0),0);
  const nextDay=active.filter(p=>p.date===add(date,1));
  const warnings:string[]=recoverySignals(plans,date,states,history);
  if(dayPlans.some(p=>p.durationMinutes===undefined))warnings.push('Some sessions have no planned duration');
  if(dayPlans.some(p=>!p.time))warnings.push('Some sessions have no start time; conflicts cannot be checked');
  if(dayPlans.some(p=>p.type===activityType)&&activityType)warnings.push('Another '+activityType+' session is already planned');
  if(previous.some(p=>p.type==='BJJ'||p.type==='Strength')&&(activityType==='BJJ'||activityType==='Strength'))warnings.push('Demanding training on the previous day; check recovery');
  if(plannedMinutes+durationMinutes>150)warnings.push('Would exceed 150 planned minutes today');
  if(weekMinutes+durationMinutes>600)warnings.push('Would bring weekly planned training above 600 minutes; review capacity');
  if((activityType==='BJJ'||activityType==='Strength')&&nextDay.some(p=>p.type==='BJJ'||p.type==='Strength'))warnings.push('Demanding training follows the next day; check recovery');
  if(activityType==='Cardio'&&dayPlans.some(p=>p.type==='BJJ'||p.type==='Strength'))warnings.push('Cardio and demanding training on the same day; review intensity');
  const score=dayPlans.length*20+plannedMinutes/10+warnings.length*15+Math.max(0,weekMinutes+durationMinutes-450)/15;
  results.push({date,dayLabel:d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}),plannedCount:dayPlans.length,plannedMinutes,reason:dayPlans.length===0?'No sessions currently planned':dayPlans.length+' sessions · '+plannedMinutes+' planned min',warnings,score,weekMinutes,weekSessions,focusMinutes});
 }
 return results.sort((a,b)=>a.score-b.score||a.date.localeCompare(b.date)).slice(0,limit);
}
