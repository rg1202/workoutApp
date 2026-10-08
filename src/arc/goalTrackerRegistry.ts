import type {Goal} from '../goals';
import type {BodyMetric} from '../storage';

/** Stable tracker IDs are persisted identifiers, not presentation labels. */
export type GoalTrackerId='body.measurements.v1'|'running.performance.v1'|'cycling.performance.v1'|'bjj.progress.v1'|'strength.performance.v1';
export type BodyMetricField='weight'|'waist'|'chest'|'arms'|'thighs';
export type TrackerMetric={id:string;label:string;unit:string;source:'body'|'activity';bodyField?:BodyMetricField};
export type GoalTrackerDefinition={id:GoalTrackerId;label:string;metrics:readonly TrackerMetric[];matches:(goal:Goal)=>boolean;enabled:boolean};
const bodyMetrics:readonly TrackerMetric[]=[
 {id:'weight',label:'Weight',unit:'lb',source:'body',bodyField:'weight'},
 {id:'waist',label:'Waist',unit:'in',source:'body',bodyField:'waist'},
 {id:'chest',label:'Chest',unit:'in',source:'body',bodyField:'chest'},
 {id:'arms',label:'Arms',unit:'in',source:'body',bodyField:'arms'},
 {id:'thighs',label:'Thighs',unit:'in',source:'body',bodyField:'thighs'}
];
export const goalTrackerRegistry:readonly GoalTrackerDefinition[]=[
 {id:'body.measurements.v1',label:'Body measurements',enabled:true,metrics:bodyMetrics,matches:g=>g.status==='Active'&&(g.type==='Body'||g.goalTypeV2==='Body Composition')},
 {id:'running.performance.v1',label:'Running performance',enabled:false,metrics:[{id:'pace',label:'Pace',unit:'min/km',source:'activity'},{id:'distance',label:'Distance',unit:'km',source:'activity'}],matches:g=>g.status==='Active'&&g.type==='Cardio'&&/run/i.test(g.activity??g.name)},
 {id:'cycling.performance.v1',label:'Cycling performance',enabled:false,metrics:[{id:'distance',label:'Distance',unit:'km',source:'activity'}],matches:g=>g.status==='Active'&&g.type==='Cardio'&&/cycl|bike/i.test(g.activity??g.name)},
 {id:'bjj.progress.v1',label:'BJJ progress',enabled:false,metrics:[{id:'sessions',label:'Sessions',unit:'sessions',source:'activity'}],matches:g=>g.status==='Active'&&g.type==='BJJ'},
 {id:'strength.performance.v1',label:'Strength performance',enabled:false,metrics:[{id:'load',label:'Load',unit:'lb',source:'activity'}],matches:g=>g.status==='Active'&&g.type==='Strength'}
];
export const activeGoalTrackers=(goals:Goal[])=>goalTrackerRegistry.filter(t=>t.enabled&&goals.some(t.matches));
export function trackerForGoal(goal:Goal){return goalTrackerRegistry.find(t=>t.enabled&&t.matches(goal))??null}
export function metricForGoal(goal:Goal):TrackerMetric|null{
 const tracker=trackerForGoal(goal);if(!tracker)return null;
 const label=(goal.metric??goal.name).toLowerCase();
 return tracker.metrics.find(m=>new RegExp('\\b'+m.id+'\\b','i').test(label))??null;
}
export const goalBodyMetricField=(goal:Goal):BodyMetricField|null=>metricForGoal(goal)?.bodyField??null;
export function latestBodyMetric(entries:BodyMetric[],field:BodyMetricField):number|undefined{
 return entries.filter(e=>typeof e[field]==='number'&&Number.isFinite(e[field])).slice().sort((a,b)=>b.date.localeCompare(a.date))[0]?.[field];
}
export function bodyMetricHistory(entries:BodyMetric[],field:BodyMetricField){
 return entries.filter(e=>typeof e[field]==='number'&&Number.isFinite(e[field])).slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>({id:e.id,date:e.date,value:e[field]!}));
}
