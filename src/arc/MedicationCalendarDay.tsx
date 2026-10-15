import{medicationDoses,formatDoseTime,type MedicationStore}from'./medications';
export default function MedicationCalendarDay({date,store,onChange}:{date:string;store:MedicationStore;onChange:(next:MedicationStore)=>void}){
 const doses=medicationDoses(store,date,true);if(!doses.length)return null;
 return <div className="arc-calendar-medications" aria-label={'Medication doses for '+date}>{doses.map(({medication:m,time,log})=><button key={m.id+time} type="button" className={'arc-calendar-dose'+(log?' is-taken':'')} title={m.name+' · '+m.strength+' · '+m.dose+' · '+formatDoseTime(time)+(log?' · taken':' · pending')} aria-label={(log?'Undo taken':'Mark taken')+': '+m.name+' '+formatDoseTime(time)+' on '+date} aria-pressed={!!log} onClick={()=>onChange({...store,logs:log?store.logs.filter(x=>x.id!==log.id):[...store.logs,{id:crypto.randomUUID(),medicationId:m.id,date,time,takenAt:new Date().toISOString()}]})}>{log?'✓':'○'} {m.name} · {formatDoseTime(time)}</button>)}</div>
}
