import type{PlannedActivity}from'../plans';
import type{UnitPreferences}from'./units';
import{endurancePerformance}from'./endurancePerformance';
import{distanceLabel}from'./units';

const iso=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
export type TrendWindow=7|30|90;
export function enduranceTrend(plans:PlannedActivity[],units:UnitPreferences,days:TrendWindow,now=new Date()){
 const end=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const start=new Date(end);start.setDate(end.getDate()-days+1);
 const previousStart=new Date(start);previousStart.setDate(start.getDate()-days);
 const completed=plans.filter(p=>p.status==='Completed'&&p.date<=iso(end));
 const current=completed.filter(p=>p.date>=iso(start));
 const previous=completed.filter(p=>p.date>=iso(previousStart)&&p.date<iso(start));
 const totalDistance=(items:PlannedActivity[])=>items.reduce((n,p)=>n+(typeof p.actuals?.distanceKm==='number'&&Number.isFinite(p.actuals.distanceKm)&&p.actuals.distanceKm>0?p.actuals.distanceKm:0),0);
 const totalMinutes=(items:PlannedActivity[])=>items.reduce((n,p)=>n+(typeof p.actuals?.actualDurationMinutes==='number'&&Number.isFinite(p.actuals.actualDurationMinutes)&&p.actuals.actualDurationMinutes>0?p.actuals.actualDurationMinutes:0),0);
 const measured=endurancePerformance(current,units);
 const earlier=endurancePerformance(previous,units);
 const buckets=Array.from({length:Math.min(days,14)},(_,i)=>{
  const count=Math.min(days,14),from=new Date(start);
  from.setDate(start.getDate()+Math.floor(i*days/count));
  const to=new Date(start);to.setDate(start.getDate()+Math.floor((i+1)*days/count));
  const items=current.filter(p=>p.date>=iso(from)&&p.date<iso(to));
  return {label:iso(from).slice(5),distanceKm:totalDistance(items),sessions:items.length};
 });
 return {days,sessions:current.length,previousSessions:previous.length,distance:distanceLabel(totalDistance(current),units.distance),previousDistance:distanceLabel(totalDistance(previous),units.distance),minutes:Math.round(totalMinutes(current)),previousMinutes:Math.round(totalMinutes(previous)),measured,earlier,buckets};
}
