import {useState} from 'react';
import type {PlannedActivity} from './plans';
import type {ActivityActuals} from './arc/activityActuals';
export type EditableActivity=PlannedActivity & {actuals?:ActivityActuals};
export default function CalendarActivityEditor({activity,onSave,onClose}:{activity:EditableActivity;onSave:(a:EditableActivity)=>void;onClose:()=>void}){
const [draft,setDraft]=useState(activity);
const [actuals,setActuals]=useState<ActivityActuals>(activity.actuals??{});
const change=(field:keyof ActivityActuals,value:string)=>setActuals(a=>({...a,[field]:value===''?undefined:Number(value)}));
const metric=(label:string,field:keyof ActivityActuals,max?:number)=><label>{label}<input type="number" min="0" max={max} value={typeof actuals[field]==='number'?actuals[field] as number:''} onChange={e=>change(field,e.target.value)}/></label>;
return <section role="dialog" aria-label="Edit activity"><h2>Edit activity</h2><label>Title<input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><button onClick={onClose}>Cancel</button><button onClick={()=>onSave({...draft,actuals})}>Save</button></section>;
}
