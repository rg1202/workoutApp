import type {PlannedActivity} from '../plans';
import type {DailyState} from './dailyState';
import type {StateObservation} from './stateHistory';
const previous=(date:string,n:number)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
export function recoverySignals(plans:PlannedActivity[],date:string,states:DailyState[]=[],history:StateObservation[]=[]){
 const warnings:string[]=[];
 const recent=plans.filter(p=>p.status==='Completed'&&p.date<date&&p.date>=previous(date,3));
 const effort=recent.filter(p=>p.sessionEffort!==undefined||p.actuals?.effort!==undefined);
 const demanding=effort.filter(p=>(p.sessionEffort??p.actuals?.effort??0)>=8);
 if(demanding.length)warnings.push(demanding.length+' high-effort completed session(s) in previous 3 days');
 const actualMinutes=recent.reduce((n,p)=>n+(p.actuals?.actualDurationMinutes??p.durationMinutes??0),0);
 if(actualMinutes>=240)warnings.push(actualMinutes+' recorded/reported training minutes in previous 3 days; check recovery');
 const recentStates=states.filter(s=>s.date<=date&&s.date>=previous(date,2)).sort((a,b)=>b.date.localeCompare(a.date));
 const observations=history.filter(s=>s.date<=date&&s.date>=previous(date,2)).sort((a,b)=>b.recordedAt.localeCompare(a.recordedAt));
 const state=recentStates[0];const observed=observations[0];
 const energy=observed?.ratings.energy??state?.energy,soreness=observed?.ratings.soreness??state?.soreness,stress=observed?.ratings.stress??state?.stress;
 if(energy!==undefined&&energy<=2)warnings.push('Recent low energy reported');
 if(soreness!==undefined&&soreness>=4)warnings.push('Recent high soreness reported');
 if(stress!==undefined&&stress>=4)warnings.push('Recent high stress reported');
 if(state?.sleepHours!==undefined&&state.sleepHours<6)warnings.push('Recent short sleep reported');
 return warnings;
}
