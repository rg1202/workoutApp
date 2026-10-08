import{ArrowRight,Bike,Clock3,Footprints,Route,Target}from'lucide-react';
import type{Goal}from'../goals';
import type{PlannedActivity}from'../plans';
import{uniqueActivities}from'./uniqueActivities';

type EnduranceFocus='running'|'cycling';
const iso=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const matches=(p:PlannedActivity,focus:EnduranceFocus,goalIds:Set<string>)=>{
 if(p.type!=='Cardio')return false;
 const title=(p.title+' '+(p.sourceLabel??'')).toLowerCase();
 const positive=focus==='running'?/run|jog|tempo|interval|sprint|marathon|5k|10k/:/cycl|bike|ride|spin|peloton/;
 const negative=focus==='running'?/cycl|bike|ride|spin|peloton/:/run|jog|marathon/;
 return (positive.test(title)&&!negative.test(title))||(!negative.test(title)&&Boolean(p.goalIds?.some(id=>goalIds.has(id))));
};
export default function EnduranceFocusPanel({focus,plans,goals,onOpenCalendar,onOpenGoals}:{focus:EnduranceFocus;plans:PlannedActivity[];goals:Goal[];onOpenCalendar:()=>void;onOpenGoals:()=>void}){
 const running=focus==='running',name=running?'Running':'Cycling',Icon=running?Footprints:Bike;
 const relatedGoals=goals.filter(g=>g.status==='Active'&&(g.focus===focus||(running?/run/i:/cycl|bike/i).test((g.activity??'')+' '+g.name)));
 const goalIds=new Set(relatedGoals.map(g=>g.id));
 const activities=uniqueActivities(plans).filter(p=>matches(p,focus,goalIds));
 const today=new Date(),start=new Date(today);start.setDate(today.getDate()-6);
 const recent=activities.filter(p=>p.date>=iso(start)&&p.date<=iso(today));
 const done=recent.filter(p=>p.status==='Completed'),scheduled=recent.filter(p=>p.status==='Planned');
 const distance=done.reduce((n,p)=>n+(p.actuals?.distanceKm??0),0);
 const minutes=done.reduce((n,p)=>n+(p.actuals?.actualDurationMinutes??p.durationMinutes??0),0);
 const format=(n:number)=>Number(n.toFixed(1)).toLocaleString();
 return <div className="arc-endurance"><header className="arc-page-header"><div><span className="eyebrow">FOCUS / {name.toUpperCase()}</span><h1>{name}</h1><p>Plan sessions, record what happened, and see your recent work in one place.</p></div></header>
 <section className="arc-focus-hero builder-card"><div className="arc-focus-icon"><Icon size={24}/></div><div><span className="eyebrow">YOUR CURRENT ARC</span><h2>{name} overview</h2><p>Completed sessions and recorded metrics from the last 7 days. Distance is shown only when logged; missing distance is not estimated.</p></div><button className="primary" onClick={onOpenCalendar}><Clock3 size={16}/>Plan in Calendar</button></section>
 <section className="progress-snapshot arc-endurance-metrics" aria-label={name+' 7-day summary'}>
 <article><span>COMPLETED SESSIONS</span><strong>{done.length}</strong><small>{scheduled.length} upcoming or unfinished in the last 7 days</small></article>
 <article><span>RECORDED DISTANCE</span><strong>{format(distance)} km</strong><small>{done.filter(p=>p.actuals?.distanceKm!==undefined).length} sessions with distance logged</small></article>
 <article><span>TRAINING TIME</span><strong>{format(minutes)} min</strong><small>Actual duration when recorded, otherwise planned duration</small></article>
 </section>
 <div className="progress-grid"><section className="builder-card arc-endurance-recent"><div className="overview-heading"><div><span className="eyebrow">ACTIVITY</span><h2>Recent sessions</h2></div><Route size={18}/></div>{recent.length?recent.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(p=><article key={p.id}><span><b>{p.title}</b><small>{p.date} · {p.status}{p.status==='Completed'&&p.actuals?.distanceKm!==undefined?' · '+format(p.actuals.distanceKm)+' km':''}</small></span></article>):<p>No recent {name.toLowerCase()} sessions yet. Plan one in Calendar to begin.</p>}</section>
 <section className="builder-card arc-endurance-goals"><div className="overview-heading"><div><span className="eyebrow">DIRECTION</span><h2>Connected goals</h2></div><button onClick={onOpenGoals}>Goals <ArrowRight size={14}/></button></div>{relatedGoals.length?relatedGoals.map(g=><article key={g.id}><Target size={15}/><b>{g.name}</b></article>):<p>No active {name.toLowerCase()} goals yet. Add a goal to connect your sessions to a direction.</p>}</section></div></div>;
}
