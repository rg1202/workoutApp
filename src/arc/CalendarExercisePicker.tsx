import {useState} from 'react';
import {exercises} from '../data';
import type {SessionMovement} from '../plans';

export default function CalendarExercisePicker({type,onAdd}:{type:'Strength'|'Mobility';onAdd:(movement:SessionMovement)=>void}){
 const [query,setQuery]=useState('');
 const matches=exercises.filter(ex=>(type==='Strength'?ex.category==='Strength':ex.category==='Mobility'||ex.category==='Stretching')&&[ex.name,ex.muscle,ex.equipment].join(' ').toLowerCase().includes(query.toLowerCase())).slice(0,10);
 return <div className="cal-exercise-picker">
  <label>Find an exercise<input type="search" aria-label="Search exercise library" placeholder="Search name, muscle, or equipment" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  {query.trim()&&<div className="cal-exercise-results">{matches.map(ex=><button type="button" key={ex.id} onClick={()=>{onAdd({id:crypto.randomUUID(),name:ex.name,sets:2,...(ex.defaultUnit==='seconds'?{holdSeconds:30}:{reps:10}),instructions:ex.instructions?.join(' ')});setQuery('')}}><strong>{ex.name}</strong><small>{ex.muscle} · {ex.equipment}</small></button>)}{!matches.length&&<small>No matches. Use Add exercise to enter a custom movement.</small>}</div>}
 </div>
}
