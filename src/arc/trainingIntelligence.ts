import type {PlannedActivity} from '../plans';
import type {Goal} from '../goals';
import type {DailyState} from './dailyState';
import type {StateObservation} from './stateHistory';
import {weeklyCoverage} from './goalCoverage';
import {recoveryAssessment} from './recoveryScheduling';
const iso=(d:Date)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const shift=(date:string,days:number)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return iso(d)};
export function trainingIntelligence(plans:PlannedActivity[],goals:Goal[],today:string,states:DailyState[]=[],history:StateObservation[]=[]){
 const start=shift(today,-6),end=shift(today,6);
 const past=plans.filter(p=>p.date>=start&&p.date<=today&&p.status!=='Skipped');
 const completed=past.filter(p=>p.status==='Completed');
 const upcoming=plans.filter(p=>p.date>today&&p.date<=end&&p.status==='Planned').sort((a,b)=>a.date.localeCompare(b.date)||(a.time??'').localeCompare(b.time??''));
 const plannedMinutes=past.reduce((n,p)=>n+(p.durationMinutes??0),0);
 const measured=completed.filter(p=>p.actuals?.actualDurationMinutes!==undefined);
 const actualMinutes=measured.reduce((n,p)=>n+(p.actuals?.actualDurationMinutes??0),0);
 const effort=completed.filter(p=>p.sessionEffort!==undefined||p.actuals?.effort!==undefined);
 const load=effort.filter(p=>p.actuals?.actualDurationMinutes!==undefined).reduce((n,p)=>n+(p.actuals!.actualDurationMinutes??0)*(p.sessionEffort??p.actuals?.effort??0),0);
 const linked=completed.filter(p=>goals.some(g=>g.status==='Active'&&(p.goalIds?.includes(g.id)||(p.sourceType==='Goal'&&p.sourceId===g.id))));
 const gaps=goals.filter(g=>g.status==='Active').flatMap(g=>weeklyCoverage(g,plans,today).filter(row=>row.missing>0).map(row=>({goal:g.name,type:row.type,missing:row.missing})));
 const recovery=recoveryAssessment(plans,today,states,history);
 const insight=recovery.warnings[0]??(gaps.length?gaps[0].goal+' needs '+gaps[0].missing+' more '+gaps[0].type+' session(s) this week':upcoming.length?'Next: '+upcoming[0].title:'No upcoming sessions scheduled');
 return {plannedMinutes,actualMinutes,measuredSessions:measured.length,completedSessions:completed.length,effortSessions:effort.length,measuredLoad:load,loadSessions:effort.filter(p=>p.actuals?.actualDurationMinutes!==undefined).length,linkedSessions:linked.length,gaps,upcoming,recovery,insight};
}
