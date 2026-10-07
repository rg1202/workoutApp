import type{PlannedActivity,PlannedActivityType}from'../plans';
export type GoalV2Type='Outcome'|'Performance'|'Event'|'Consistency'|'Skill'|'Body Composition'|'Wellbeing'|'Lifestyle';
export type GoalPriority='Primary'|'Supporting'|'Maintenance';
export type GoalFocus='bjj'|'running'|'cycling'|'strength'|'mobility'|'recovery'|'general';
export type GoalMilestone={id:string;name:string;targetDate?:string;completed?:boolean};
export type SupportingTarget={id:string;name:string;activityType:PlannedActivityType;frequencyPerWeek:number;durationMinutes?:number;notes?:string};
export type GoalV2Fields={goalTypeV2?:GoalV2Type;priority?:GoalPriority;focus?:GoalFocus;startDate?:string;milestones?:GoalMilestone[];supportingTargets?:SupportingTarget[]};
export const goalV2Types:GoalV2Type[]=['Outcome','Performance','Event','Consistency','Skill','Body Composition','Wellbeing','Lifestyle'];
export const goalPriorities:GoalPriority[]=['Primary','Supporting','Maintenance'];
export const goalFocuses:{id:GoalFocus;name:string}[]=[{id:'bjj',name:'Brazilian Jiu-Jitsu'},{id:'running',name:'Running'},{id:'cycling',name:'Cycling'},{id:'strength',name:'Strength'},{id:'mobility',name:'Mobility'},{id:'recovery',name:'Recovery'},{id:'general',name:'General active life'}];
export const legacyGoalType=(type:GoalV2Type)=>type==='Event'?'Competition':type==='Body Composition'?'Body':type==='Consistency'?'Consistency':type==='Skill'?'Milestone':type==='Performance'?'Strength':type==='Wellbeing'?'Mobility':type==='Lifestyle'?'Milestone':'Milestone';
const iso=(d:Date)=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)};
export function goalPlanDraft(goalId:string,goalName:string,startDate:string|undefined,deadline:string|undefined,targets:SupportingTarget[]):PlannedActivity[]{if(!targets.length)return[];const start=new Date((startDate||iso(new Date()))+'T12:00:00'),end=deadline?new Date(deadline+'T12:00:00'):new Date(start.getTime()+28*86400000),out:PlannedActivity[]=[];targets.forEach((t,ti)=>{const count=Math.max(1,Math.min(7,t.frequencyPerWeek||1));for(let week=0;;week++){const weekStart=new Date(start);weekStart.setDate(start.getDate()+week*7);if(weekStart>end)break;for(let n=0;n<count;n++){const d=new Date(weekStart);d.setDate(weekStart.getDate()+Math.floor(n*7/count));if(d>end)continue;out.push({id:'goal:'+goalId+':'+t.id+':'+week+':'+n,date:iso(d),title:t.name||goalName,type:t.activityType,durationMinutes:t.durationMinutes,notes:[goalName,t.notes].filter(Boolean).join(' · '),status:'Planned'})}}});return out}
