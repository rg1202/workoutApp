import {inferSessionDomain,isFocusId} from './focusSessionRegistry';
export type SpecificSessionPlan={
 discipline:'BJJ'|'Running'|'Cycling';
 format?:string;
 focus?:string;
 distanceKm?:number;
 intensity?:'Easy'|'Moderate'|'Hard';
};
export function classifySession(type:string,title:string):SpecificSessionPlan['discipline']|null{
 const domain=inferSessionDomain(type as 'BJJ'|'Cardio'|'Strength'|'Mobility'|'Recovery'|'Other',title);
 return isFocusId(domain)?domain:null;
}
export default function EnduranceBjjSessionFields({discipline,value,onChange}:{discipline:SpecificSessionPlan['discipline'];value:SpecificSessionPlan;onChange:(v:SpecificSessionPlan)=>void}){
 const change=(patch:Partial<SpecificSessionPlan>)=>onChange({...value,...patch});
 return <div className="cal-specific-session">
 <strong>{discipline} session plan</strong>
 {discipline==='BJJ'?<>
 <label>Class format<select aria-label="BJJ class format" value={value.format??''} onChange={e=>change({format:e.target.value})}><option value="">Choose format</option><option>Gi</option><option>No-Gi</option><option>Open Mat</option><option>Competition Class</option><option>Private Lesson</option></select></label>
 <label>Technical focus<input aria-label="BJJ technical focus" value={value.focus??''} onChange={e=>change({focus:e.target.value})} placeholder="e.g. guard retention, passing, takedowns"/></label>
 </>:<>
 <label>Session objective<select aria-label="Endurance session objective" value={value.format??''} onChange={e=>change({format:e.target.value})}><option value="">Choose objective</option><option>Easy aerobic</option><option>Long endurance</option><option>Intervals</option><option>Tempo</option><option>Recovery</option><option>Race / event</option></select></label>
 <label>Planned distance (km)<input aria-label="Planned distance km" type="number" min="0" step="0.1" value={value.distanceKm??''} onChange={e=>change({distanceKm:e.target.value===''?undefined:Number(e.target.value)})}/></label>
 <label>Intensity<select aria-label="Planned intensity" value={value.intensity??''} onChange={e=>change({intensity:e.target.value as SpecificSessionPlan['intensity']||undefined})}><option value="">Choose intensity</option><option>Easy</option><option>Moderate</option><option>Hard</option></select></label>
 </>}
 </div>
}
