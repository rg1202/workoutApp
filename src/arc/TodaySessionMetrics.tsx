import {useState} from 'react';
import type {PlannedActivity} from '../plans';
import type {ActivityActuals} from './activityActuals';
import {inferSessionDomain} from './focusSessionRegistry';
import {sessionMetricFields} from './sessionMetricFields';

export default function TodaySessionMetrics({activity,onSave}:{activity:PlannedActivity;onSave:(activity:PlannedActivity)=>void}){
 const [actual,setActual]=useState<ActivityActuals>(activity.actuals??{});
 const domain=inferSessionDomain(activity.type,activity.title,activity.specificPlan?.discipline);
 const fields=sessionMetricFields(domain);
 const planned=activity.plannedMetrics??{};
 return <section className="arc-today-metrics" aria-label="Session measurements">
 <h4>{domain} · Planned and actual</h4>
 <div className="arc-plan-actual-head"><strong>Measurement</strong><strong>Planned</strong><strong>Actual</strong></div>
 {fields.map(field=>{
  const target=field.key==='actualDurationMinutes'?activity.durationMinutes:planned[field.key as keyof typeof planned];
  return <div className="arc-plan-actual-row" key={field.key}>
   <span>{field.label}{field.unit?' ('+field.unit+')':''}</span><output>{target??'—'}</output>
   <input aria-label={'Today actual '+field.label} type={field.kind==='number'?'number':'text'} min={field.kind==='number'?'0':undefined} max={field.key==='effort'?'10':undefined} value={actual[field.key]??''} onChange={e=>{const raw=e.target.value;setActual(current=>({...current,[field.key]:raw===''?undefined:field.kind==='number'?Number(raw):raw}))}}/>
  </div>
 })}
 <button type="button" className="arc-ui-button arc-ui-button--primary" onClick={()=>onSave({...activity,actuals:actual})}>Save session results</button>
 </section>;
}
