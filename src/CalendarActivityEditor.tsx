import {useState} from 'react';
import type {PlannedActivity} from './plans';
import type {ActivityActuals} from './arc/activityActuals';
export type EditableActivity=PlannedActivity & {actuals?:ActivityActuals};
export default function CalendarActivityEditor({activity,onSave,onClose}:{activity:EditableActivity;onSave:(a:EditableActivity)=>void;onClose:()=>void}){
const [draft,setDraft]=useState(activity);
const [actuals,setActuals]=useState<ActivityActuals>(activity.actuals??{});
return <section role="dialog" aria-label="Edit activity"><h2>Edit activity</h2><label>Title<input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><button onClick={onClose}>Cancel</button><button onClick={()=>onSave({...draft,actuals})}>Save</button></section>;
}
