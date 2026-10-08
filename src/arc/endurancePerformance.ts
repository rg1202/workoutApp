import type{PlannedActivity}from'../plans';
import type{UnitPreferences}from'./units';
import{distanceLabel,speedLabel,kmToDistance}from'./units';

const valid=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>0;
export function endurancePerformance(plans:PlannedActivity[],units:UnitPreferences){
 const measured=plans.filter(p=>p.status==='Completed'&&valid(p.actuals?.distanceKm)&&valid(p.actuals?.actualDurationMinutes));
 const km=measured.reduce((sum,p)=>sum+p.actuals!.distanceKm!,0);
 const minutes=measured.reduce((sum,p)=>sum+p.actuals!.actualDurationMinutes!,0);
 const pace=km>0?minutes/km:null;
 const speed=minutes>0?km/(minutes/60):null;
 const paceUnit=units.pace;
 const paceMinutes=pace===null?null:pace/(paceUnit==='min/mi'?0.621371:1);
 const paceLabel=paceMinutes===null?'—':Math.floor(Math.round(paceMinutes*60)/60)+':'+String(Math.round(paceMinutes*60)%60).padStart(2,'0')+' '+paceUnit;
 return {sessions:measured.length,paceLabel,speedLabel:speed===null?'—':speedLabel(speed,units.speed),distanceLabel:distanceLabel(km,units.distance),distance:kmToDistance(km,units.distance)};
}
