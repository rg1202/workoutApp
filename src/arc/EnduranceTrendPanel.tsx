import{useState}from'react';
import type{PlannedActivity}from'../plans';
import type{UnitPreferences}from'./units';
import{enduranceTrend,type TrendWindow}from'./enduranceTrend';
export default function EnduranceTrendPanel({name,plans,units}:{name:string;plans:PlannedActivity[];units:UnitPreferences}){
 const [days,setDays]=useState<TrendWindow>(30);
 const trend=enduranceTrend(plans,units,days);
 const max=Math.max(1,...trend.buckets.map(b=>b.distanceKm));
 return <section className="builder-card arc-endurance-trends" aria-label={name+' historical trends'}>
 <div className="overview-heading"><div><span className="eyebrow">YOUR TRAJECTORY</span><h2>Historical trends</h2></div><div className="arc-trend-windows" role="group" aria-label="Trend range">{([7,30,90] as TrendWindow[]).map(d=><button key={d} type="button" aria-pressed={days===d} onClick={()=>setDays(d)}>{d}D</button>)}</div></div>
 <div className="arc-trend-summary"><article><small>Completed sessions</small><strong>{trend.sessions}</strong><span>Previous {days} days: {trend.previousSessions}</span></article><article><small>Recorded distance</small><strong>{trend.distance}</strong><span>Previous {days} days: {trend.previousDistance}</span></article><article><small>Actual training time</small><strong>{trend.minutes} min</strong><span>Previous {days} days: {trend.previousMinutes} min</span></article></div>
 <div className="arc-trend-bars" role="img" aria-label={'Recorded distance by period over '+days+' days'}>{trend.buckets.map((b,i)=><div key={i} title={b.label+': '+b.distanceKm.toFixed(1)+' km'}><span style={{height:Math.max(2,Math.round(b.distanceKm/max*100))+'%'}}/><small>{b.label}</small></div>)}</div>
 <p>Distance and time include only recorded actuals. Comparisons use the immediately preceding {days}-day period; missing measurements are never estimated.</p>
 </section>;
}
