import{useState}from'react';
import{localDay,type MedicationStore}from'./medications';

const shiftDay=(date:string,offset:number)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const ratio=(n:number,d:number)=>d?Math.round(n/d*100):null;
export default function MedicationAnalytics({store}:{store:MedicationStore}){
 const[windowDays,setWindowDays]=useState<7|30>(7);
 const today=localDay(),first=shiftDay(today,1-windowDays);
 const dates=Array.from({length:windowDays},(_,i)=>shiftDay(first,i));
 const now=new Date(),clock=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 const eligible=store.medications.flatMap(m=>m.active?dates.filter(date=>date>=m.startDate).flatMap(date=>m.times.filter(time=>date<today||(date===today&&time<=clock)).map(time=>({id:m.id,name:m.name,date,time,taken:store.logs.some(l=>l.medicationId===m.id&&l.date===date&&l.time===time)}))):[]);
 const taken=eligible.filter(d=>d.taken).length,unrecorded=eligible.length-taken;
 const names=store.medications.filter(m=>m.active&&eligible.some(d=>d.id===m.id));
 return <section className="arc-med-analytics"><div className="arc-med-analytics-head"><div><span className="eyebrow">MEDICATION TRACKING</span><h3>Recorded adherence</h3></div><div className="arc-med-analytics-period" role="group" aria-label="Medication analytics period">{([7,30] as const).map(days=><button type="button" key={days} className={'arc-ui-button arc-ui-button--quiet'+(windowDays===days?' selected':'')} aria-pressed={windowDays===days} onClick={()=>setWindowDays(days)}>{days} days</button>)}</div></div>
 <div className="arc-med-analytics-summary"><div><small>Recorded adherence</small><strong>{ratio(taken,eligible.length)===null?'—':ratio(taken,eligible.length)+'%'}</strong></div><div><small>Marked taken</small><strong>{taken}/{eligible.length}</strong></div><div><small>Unrecorded past doses</small><strong>{unrecorded}</strong></div></div>
 {eligible.length===0?<p>No eligible scheduled doses in this period.</p>:<><div className="arc-med-analytics-chart" role="img" aria-label={windowDays+'-day recorded medication adherence by day'}>{dates.map(date=>{const day=eligible.filter(d=>d.date===date),count=day.filter(d=>d.taken).length;return <div key={date} title={date+': '+count+'/'+day.length+' recorded'}><span style={{height:(day.length?Math.max(4,count/day.length*100):0)+'%'}} className={day.length?'has-schedule':'no-schedule'}/></div>})}</div><div className="arc-med-analytics-legend"><span>{first}</span><span>{today}</span></div><div className="arc-med-analytics-by-med">{names.map(m=>{const doses=eligible.filter(d=>d.id===m.id),done=doses.filter(d=>d.taken).length;return <div key={m.id}><span><b>{m.name}</b><small>{done}/{doses.length} recorded</small></span><strong>{ratio(done,doses.length)}%</strong></div>})}</div></>}
 <p className="arc-med-analytics-note">This measures doses marked taken, not confirmed ingestion. Unrecorded does not necessarily mean missed. Future doses are excluded. Paused medications are excluded because pause history is not yet recorded; historical results may change after pausing or editing a schedule.</p></section>
}
