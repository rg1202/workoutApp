import type {ActivityActuals} from './activityActuals';
import type {PlannedSessionMetrics} from './sessionMetricFields';
import {sessionMetricFields} from './sessionMetricFields';
import type {SessionDomain} from './focusSessionRegistry';

export default function SessionPlanActualFields({domain,durationMinutes,onDurationChange,planned,onPlannedChange,actual,onActualChange}:{domain:SessionDomain;durationMinutes?:number;onDurationChange:(value:number|undefined)=>void;planned:PlannedSessionMetrics;onPlannedChange:(value:PlannedSessionMetrics)=>void;actual:ActivityActuals;onActualChange:(value:ActivityActuals)=>void}){
 const fields=sessionMetricFields(domain);
 return <section className="arc-plan-actual"><h3>{domain} session: plan vs. actual</h3><p className="arc-activity-hint">Plan and record the same measurements. Actual results are independent of targets.</p><div className="arc-plan-actual-head"><strong>Measurement</strong><strong>Planned</strong><strong>Actual</strong></div>{fields.map(field=>{
 const plannedValue=field.key==='actualDurationMinutes'?durationMinutes:planned[field.key as keyof PlannedSessionMetrics];
 const actualValue=actual[field.key];
 const parse=(raw:string)=>field.kind==='text'?raw:raw===''?undefined:Math.max(0,Number(raw));
 return <div className="arc-plan-actual-row" key={field.key}><span>{field.label}{field.unit?' ('+field.unit+')':''}</span><label><span className="arc-visually-hidden">Planned {field.label}</span><input aria-label={'Planned '+field.label} type={field.kind==='number'?'number':'text'} min={field.kind==='number'?'0':undefined} max={field.key==='effort'?'10':undefined} value={plannedValue??''} onChange={e=>field.key==='actualDurationMinutes'?onDurationChange(e.target.value===''?undefined:Number(e.target.value)):onPlannedChange({...planned,[field.key]:parse(e.target.value)})}/></label><label><span className="arc-visually-hidden">Actual {field.label}</span><input aria-label={field.key==='actualDurationMinutes'?'Actual minutes':field.key==='distanceKm'?'Distance (km)':field.key==='elevationMeters'?'Elevation gain (m)':'Actual '+field.label} type={field.kind==='number'?'number':'text'} min={field.kind==='number'?'0':undefined} max={field.key==='effort'?'10':undefined} value={actualValue??''} onChange={e=>onActualChange({...actual,[field.key]:parse(e.target.value)})}/></label></div>})}</section>;
}
