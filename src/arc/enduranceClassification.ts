import type {Goal} from '../goals';
import type {PlannedActivity} from '../plans';
export type EnduranceFocus='running'|'cycling';
const runningWords=['run','running','runner','jog','jogging','sprint','sprints','marathon','5k','10k'];
const cyclingWords=['cycling','cycle','bike','biking','bicycle','ride','riding','spin','spinning','peloton'];
const contains=(text:string,words:string[])=>text.toLowerCase().split(/[^a-z0-9]+/).some(word=>words.includes(word));
export function enduranceFocusForActivity(plan:PlannedActivity,goals:Goal[]):EnduranceFocus|null{
 if(plan.type!=='Cardio')return null;
 const linked=goals.filter(g=>plan.goalIds?.includes(g.id)||(plan.sourceType==='Goal'&&plan.sourceId===g.id));
 const focused=new Set(linked.map(g=>g.focus).filter((f):f is EnduranceFocus=>f==='running'||f==='cycling'));
 if(focused.size===1)return [...focused][0];
 if(focused.size>1)return null;
 const text=[plan.title,plan.sourceLabel].filter(Boolean).join(' ');
 const isRun=contains(text,runningWords),isRide=contains(text,cyclingWords);
 return isRun!==isRide?(isRun?'running':'cycling'):null;
}
