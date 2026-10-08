import type{Goal}from'../goals';
export type GoalTrackerId='body.measurements.v1';
export type GoalTrackerDefinition={id:GoalTrackerId;label:string;matches:(goal:Goal)=>boolean};
export const goalTrackerRegistry:GoalTrackerDefinition[]=[{
 id:'body.measurements.v1',label:'Body measurements',
 matches:g=>g.status==='Active'&&(g.type==='Body'||g.goalTypeV2==='Body Composition')
}];
export const activeGoalTrackers=(goals:Goal[])=>goalTrackerRegistry.filter(t=>goals.some(t.matches));
