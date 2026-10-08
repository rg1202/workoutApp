import type{Goal}from'../goals';
export type GoalTrackerId='body.measurements.v1';
export type GoalTrackerDefinition={id:GoalTrackerId;label:string;matches:(goal:Goal)=>boolean};
export const goalTrackerRegistry:GoalTrackerDefinition[]=[{
 id:'body.measurements.v1',label:'Body measurements',
 matches:g=>g.status==='Active'&&(g.type==='Body'||g.goalTypeV2==='Body Composition')
}];
export const activeGoalTrackers=(goals:Goal[])=>goalTrackerRegistry.filter(t=>goals.some(t.matches));

export type BodyMetricField='weight'|'waist'|'chest'|'arms'|'thighs';
export function goalBodyMetricField(goal:Goal):BodyMetricField|null{
 if(!goalTrackerRegistry[0].matches(goal))return null;
 const metric=(goal.metric??goal.name).toLowerCase();
 if(/waist/.test(metric))return'waist';
 if(/chest/.test(metric))return'chest';
 if(/arm|bicep/.test(metric))return'arms';
 if(/thigh|leg circumference/.test(metric))return'thighs';
 if(/weight|bodyweight|weigh/.test(metric))return'weight';
 return null;
}
