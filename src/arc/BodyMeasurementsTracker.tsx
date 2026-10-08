import{useState}from'react';
import type{BodyMetric}from'../storage';
type Props={entries:BodyMetric[];onSave:(entry:BodyMetric)=>void};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
export default function BodyMeasurementsTracker({entries,onSave}:Props){
 const[date,setDate]=useState(today),[weight,setWeight]=useState(''),[waist,setWaist]=useState(''),[chest,setChest]=useState(''),[arms,setArms]=useState(''),[thighs,setThighs]=useState('');
 const values={weight,waist,chest,arms,thighs};
 const valid=Object.values(values).some(v=>v.trim()!==''&&Number.isFinite(Number(v))&&Number(v)>0);
 const save=()=>{if(!date||!valid)return;const parsed=Object.fromEntries(Object.entries(values).filter(([,v])=>v.trim()!==''&&Number(v)>0&&Number.isFinite(Number(v))).map(([k,v])=>[k,Number(v)]));if(!Object.keys(parsed).length)return;onSave({id:crypto.randomUUID(),date,...parsed});setWeight('');setWaist('');setChest('');setArms('');setThighs('')};
 const fields=[['Weight',weight,setWeight],['Waist',waist,setWaist],['Chest',chest,setChest],['Arms',arms,setArms],['Thighs',thighs,setThighs]] as const;
 return <section className="builder-card arc-goal-tracker" data-tracker-id="body.measurements.v1"><span className="eyebrow">GOAL TRACKER · BODY MEASUREMENTS</span><h2>Record your measurements</h2><p>Track progress toward your active body goal.</p><div className="arc-tracker-fields"><label>Date<input id="bm-date" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>{fields.map(([label,value,set])=><label key={label}>{label} <small>{label==='Weight'?'lb':'in'}</small><input id={label==='Weight'?'bm-weight':undefined} type="number" min="0" step=".1" value={value} onChange={e=>set(e.target.value)}/></label>)}</div><button className="primary" type="button" disabled={!valid||!date} onClick={save}>Save measurements</button><div className="arc-tracker-history">{entries.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(e=><span key={e.id}>{e.date} · {e.weight!==undefined?e.weight+' lb':'Measurements'}{e.waist!==undefined?' · Waist '+e.waist+' in':''}</span>)}</div></section>;
}
