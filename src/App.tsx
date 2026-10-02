import { useEffect, useMemo, useState } from 'react';
import { Activity, BookOpen, CalendarDays, Dumbbell, History, Plus, Search, Trash2 } from 'lucide-react';
import { exercises, Exercise } from './data';
import { loadJSON, saveJSON, SessionRecord, storageKeys, StoredSet } from './storage';

type Tab = 'Today' | 'Programs' | 'Exercises' | 'History';
type Prescription = { exercise: Exercise; sets: number; minReps: number; maxReps: number; rir: number; weight: number };
type Logs = Record<string, StoredSet[]>;

const starter: Prescription[] = [
  { exercise: exercises[0], sets: 4, minReps: 6, maxReps: 8, rir: 2, weight: 185 },
  { exercise: exercises[1], sets: 3, minReps: 8, maxReps: 10, rir: 2, weight: 185 },
  { exercise: exercises[2], sets: 3, minReps: 10, maxReps: 12, rir: 1, weight: 270 },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('Today');
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState('All');
  const [plan, setPlan] = useState<Prescription[]>(() => loadJSON(storageKeys.plan, starter));
  const [logs, setLogs] = useState<Logs>(() => loadJSON(storageKeys.session, {}));
  const [history, setHistory] = useState<SessionRecord[]>(() => loadJSON(storageKeys.history, []));

  useEffect(() => saveJSON(storageKeys.plan, plan), [plan]);
  useEffect(() => saveJSON(storageKeys.session, logs), [logs]);
  useEffect(() => saveJSON(storageKeys.history, history), [history]);

  const filtered = useMemo(() => exercises.filter((e) => {
    const haystack = `${e.name} ${e.muscle} ${e.group} ${e.movement} ${e.goals.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (equipment === 'All' || e.equipment === equipment);
  }), [query, equipment]);

  const setCount = Object.values(logs).flat().length;
  function logSet(p: Prescription) {
    const prior = logs[p.exercise.id] ?? [];
    if (prior.length >= p.sets) return;
    setLogs(current => ({ ...current, [p.exercise.id]: [...(current[p.exercise.id] ?? []), { weight: p.weight, reps: p.minReps, rir: p.rir, completedAt: new Date().toISOString() }] }));
  }
  function updateSet(exerciseId: string, index: number, field: 'weight'|'reps'|'rir', value: number) {
    setLogs(current => ({ ...current, [exerciseId]: (current[exerciseId] ?? []).map((s,i)=>i===index?{...s,[field]:value}:s) }));
  }
  function removeSet(exerciseId: string, index: number) {
    setLogs(current => ({ ...current, [exerciseId]: (current[exerciseId] ?? []).filter((_,i)=>i!==index) }));
  }
  function finishWorkout() {
    if (!setCount) return;
    const sets = plan.flatMap(p => (logs[p.exercise.id] ?? []).map(set => ({ exerciseId:p.exercise.id, exerciseName:p.exercise.name, set })));
    setHistory(current => [{ id: crypto.randomUUID(), name:'Lower A', completedAt:new Date().toISOString(), sets }, ...current]);
    setLogs({});
    setTab('History');
  }

  return <div className="app-shell"><aside><div className="brand"><Dumbbell size={22}/><span>WorkoutApp</span></div><nav>
    {([['Today',Activity],['Programs',CalendarDays],['Exercises',BookOpen],['History',History]] as const).map(([name,Icon])=><button className={tab===name?'active':''} onClick={()=>setTab(name)} key={name}><Icon size={18}/>{name}</button>)}
  </nav><div className="aside-foot">MVP · Persistent local workspace</div></aside><main>

  {tab==='Today'&&<><header><div><span className="eyebrow">TODAY'S TRAINING</span><h1>Lower A</h1><p>Strength + hypertrophy · {plan.reduce((n,p)=>n+p.sets,0)} working sets</p></div><button className="primary" onClick={finishWorkout}>Finish workout</button></header>
  <section className="hero-card"><div><span className="eyebrow">8-WEEK HYPERTROPHY BLOCK</span><h2>Week 1 · Day 1</h2><p>Your active session now survives page reloads.</p></div><div className="metric"><strong>{setCount}</strong><span>sets logged</span></div></section>
  <div className="stack">{plan.map((p,i)=><article className="workout-card" key={p.exercise.id}><div className="exercise-number">{String(i+1).padStart(2,'0')}</div><div className="exercise-main"><h3>{p.exercise.name}</h3><p>{p.exercise.muscle} · {p.exercise.movement} · {p.exercise.equipment}</p><div className="prescription"><span><b>{p.sets}</b> sets</span><span><b>{p.minReps}–{p.maxReps}</b> reps</span><span><b>{p.rir}</b> RIR</span><span><b>{p.weight}</b> lb</span></div>
  {(logs[p.exercise.id]??[]).map((s,n)=><div className="logged editable" key={n}><span>Set {n+1}</span><label><input type="number" value={s.weight} onChange={e=>updateSet(p.exercise.id,n,'weight',+e.target.value)}/> lb</label><label><input type="number" value={s.reps} onChange={e=>updateSet(p.exercise.id,n,'reps',+e.target.value)}/> reps</label><label><input type="number" step="0.5" value={s.rir} onChange={e=>updateSet(p.exercise.id,n,'rir',+e.target.value)}/> RIR</label><button className="icon-button" onClick={()=>removeSet(p.exercise.id,n)}><Trash2 size={14}/></button></div>)}</div>
  <button className="log-button" disabled={(logs[p.exercise.id]??[]).length>=p.sets} onClick={()=>logSet(p)}><Plus size={18}/> Log set</button></article>)}</div></>}

  {tab==='Exercises'&&<><header><div><span className="eyebrow">KNOWLEDGE BASE</span><h1>Exercise Library</h1><p>Find movements by anatomy, equipment, movement pattern, or training goal.</p></div></header><div className="filters"><label className="search"><Search size={18}/><input placeholder="Search biceps, hamstrings, hypertrophy…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select value={equipment} onChange={e=>setEquipment(e.target.value)}><option>All</option><option>Free Weight</option><option>Machine</option><option>Bodyweight</option></select></div><div className="exercise-grid">{filtered.map(e=><article className="library-card" key={e.id}><div className="tag">{e.equipment}</div><h3>{e.name}</h3><p>{e.muscle} · {e.group}</p><div className="chips"><span>{e.movement}</span>{e.goals.map(g=><span key={g}>{g}</span>)}</div><button onClick={()=>setPlan(p=>p.some(x=>x.exercise.id===e.id)?p:[...p,{exercise:e,sets:3,minReps:8,maxReps:12,rir:2,weight:0}])}><Plus size={16}/> Add to workout</button></article>)}</div></>}

  {tab==='Programs'&&<><header><div><span className="eyebrow">PROGRAMMING</span><h1>Programs</h1><p>Persistent prescriptions are now in place; full editing comes next.</p></div><button className="primary"><Plus size={18}/> New program</button></header><section className="program-card"><div><span className="status">ACTIVE</span><h2>8-Week Hypertrophy Block</h2><p>Week 1 of 8 · {plan.length} exercises in today's session</p></div><div className="weekbar">{Array.from({length:8},(_,i)=><span className={i===0?'current':''} key={i}>W{i+1}</span>)}</div></section></>}

  {tab==='History'&&<><header><div><span className="eyebrow">PERFORMANCE</span><h1>Training History</h1><p>Completed sessions are stored separately from planned prescriptions.</p></div></header>{history.length===0?<section className="empty"><History size={34}/><h2>Your training record starts here.</h2><p>Complete a workout to create your first permanent session record.</p></section>:<div className="stack">{history.map(session=><article className="history-card" key={session.id}><div><span className="eyebrow">{new Date(session.completedAt).toLocaleDateString()}</span><h2>{session.name}</h2><p>{session.sets.length} working sets</p></div><div className="history-sets">{session.sets.map((x,i)=><span key={i}>{x.exerciseName}: <b>{x.set.weight}×{x.set.reps}</b> @ {x.set.rir} RIR</span>)}</div></article>)}</div>}</>}
  </main></div>;
}