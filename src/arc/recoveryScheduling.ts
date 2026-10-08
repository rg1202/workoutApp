import type {PlannedActivity} from '../plans';
import type {DailyState} from './dailyState';
import type {StateObservation} from './stateHistory';
const previous=(date:string,n:number)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
export type RecoveryAssessment={warnings:string[];missing:string[];actualMinutes:number;estimatedMinutes:number;effortSessions:number};
export function recoveryAssessment(plans:PlannedActivity[],date:string,states:DailyState[]=[],history:StateObservation[]=[]){
 const warnings:string[]=[];
 const recent=plans.filter(p=>p.status==='Completed'&&p.date<date&&p.date>=previous(date,3));
 const actualMinutes=recent.reduce((n,p)=>n+(p.actuals?.actualDurationMinutes??0),0);
 const estimatedMinutes=recent.filter(p=>p.actuals?.actualDurationMinutes===undefined).reduce((n,p)=>n+(p.durationMinutes??0),0);
 const missing:string[]=[];
 if(recent.some(p=>p.actuals?.actualDurationMinutes===undefined))missing.push('Some completed sessions lack actual duration');
 if(recent.length===0)missing.push('No completed Calendar sessions recorded in previous 3 days');
 const effort=recent.filter(p=>p.sessionEffort!==undefined||p.actuals?.effort!==undefined);
 const demanding=effort.filter(p=>(p.sessionEffort??p.actuals?.effort??0)>=8);
 if(demanding.length)warnings.push(demanding.length+' high-effort completed session(s) in previous 3 days');

 if(actualMinutes>=240)warnings.push(actualMinutes+' actual training minutes in previous 3 days; check recovery');
 if(estimatedMinutes>0)warnings.push(estimatedMinutes+' planned minutes substituted only for context, not counted as actual load');
 if(recent.length>effort.length)missing.push('Some completed sessions lack recorded effort');
 const recentStates=states.filter(s=>s.date<=date&&s.date>=previous(date,2)).sort((a,b)=>b.date.localeCompare(a.date));
 const observations=history.filter(s=>s.date<=date&&s.date>=previous(date,2)).sort((a,b)=>b.recordedAt.localeCompare(a.recordedAt));
 const state=recentStates[0];const observed=observations[0];
 const energy=observed?.ratings.energy??state?.energy,soreness=observed?.ratings.soreness??state?.soreness,stress=observed?.ratings.stress??state?.stress;
 if(energy===undefined&&soreness===undefined&&stress===undefined)missing.push('No recent energy, soreness or stress check-in');
 if(state?.sleepHours===undefined)missing.push('No recent sleep duration');
 if(energy!==undefined&&energy<=2)warnings.push('Recent low energy reported');
 if(soreness!==undefined&&soreness>=4)warnings.push('Recent high soreness reported');
 if(stress!==undefined&&stress>=4)warnings.push('Recent high stress reported');
 if(state?.sleepHours!==undefined&&state.sleepHours<6)warnings.push('Recent short sleep reported');
 return {warnings,missing,actualMinutes,estimatedMinutes,effortSessions:effort.length};
}
export function recoverySignals(plans:PlannedActivity[],date:string,states:DailyState[]=[],history:StateObservation[]=[]){return recoveryAssessment(plans,date,states,history).warnings}

