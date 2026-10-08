import {uniqueActivities} from './uniqueActivities';
import type {Goal} from '../goals';
import type {PlannedActivity} from '../plans';

export type GoalSignal={
 planned:number;completed:number;skipped:number;upcoming:number;
 actualMinutes:number;missingMinutes:number;completionRate:number|null;
 weeklyTarget:number;weeklyCompleted:number;weeklyPlanned:number;
 direction:'On pace'|'Needs attention'|'No schedule'|'Not enough evidence';
 explanation:string;
};
const day=(date:string)=>new Date(date+'T12:00:00').getTime();
export function goalSignal(goal:Goal,plans:PlannedActivity[],today:string):GoalSignal{
 const linked=uniqueActivities(plans).filter(p=>(p.goalIds?.includes(goal.id)||p.sourceType==='Goal'&&p.sourceId===goal.id));
 const now=day(today),start=now-6*86400000,end=now+7*86400000;
 const recent=linked.filter(p=>day(p.date)>=start&&day(p.date)<=now);
 const upcoming=linked.filter(p=>day(p.date)>now&&day(p.date)<=end&&p.status==='Planned');
 const completed=recent.filter(p=>p.status==='Completed');
 const skipped=recent.filter(p=>p.status==='Skipped');
 const scheduled=recent.filter(p=>p.status!=='Skipped');
 // Weekly targets use the same Sunday-Saturday calendar week as weeklyCoverage.
 // Rolling seven-day activity summaries above remain separate from weekly adherence.
 const weekStart=new Date(today+'T12:00:00');
 weekStart.setDate(weekStart.getDate()-weekStart.getDay());
 const weekEnd=new Date(weekStart);
 weekEnd.setDate(weekEnd.getDate()+6);
 const iso=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const week=linked.filter(p=>p.date>=iso(weekStart)&&p.date<=iso(weekEnd));
 const weeklyTarget=(goal.supportingTargets??[]).reduce((sum,t)=>sum+Math.max(0,t.frequencyPerWeek||0),0);
 const weeklyCompleted=week.filter(p=>p.status==='Completed').length;
 const weeklyPlanned=week.filter(p=>p.status==='Planned').length;
 const remainingThisWeek=week.filter(p=>p.status==='Planned'&&p.date>=today).length;
 const actualMinutes=completed.reduce((sum,p)=>sum+(p.actuals?.actualDurationMinutes??0),0);
 const missingMinutes=completed.filter(p=>p.actuals?.actualDurationMinutes===undefined).length;
 const completionRate=completed.length+skipped.length?Math.round(100*completed.length/(completed.length+skipped.length)):null;
 let direction:GoalSignal['direction']='Not enough evidence';
 let explanation='Not enough completed or skipped sessions to assess execution.';
 if(!linked.length){direction='No schedule';explanation='No Calendar activities linked to this goal yet.'}
 else if(weeklyTarget>0&&weeklyCompleted>=weeklyTarget){direction='On pace';explanation='Completed this week’s supporting-session target.'}
 else if(weeklyTarget>0&&weeklyCompleted+remainingThisWeek<weeklyTarget){direction='Needs attention';explanation='Completed and upcoming sessions are below the weekly target.'}
 else if(weeklyTarget>0){direction='On pace';explanation='The remaining scheduled sessions can meet the weekly target.'}
 else if(skipped.length>0){direction='Needs attention';explanation='Some scheduled supporting sessions were skipped.'}
 else if(completed.length){direction='On pace';explanation='Supporting activity was completed in the past seven days.'}
 return{planned:linked.length,completed:completed.length,skipped:skipped.length,upcoming:upcoming.length,actualMinutes,missingMinutes,completionRate,weeklyTarget,weeklyCompleted,weeklyPlanned,direction,explanation};
}
