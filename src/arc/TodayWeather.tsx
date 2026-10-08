import{useEffect,useState,type FormEvent}from'react';
import{CloudSun,MapPin,RefreshCw}from'lucide-react';
const KEY='arc.weather.location.v1';
type Location={name:string;latitude:number;longitude:number;timezone?:string};
type Hour={time:string;temperature:number;precipitation:number;code:number};
type Weather={temperature:number;code:number;hours:Hour[];updated:string};
const description=(code:number)=>code===0?'Clear':code<=3?'Partly cloudy':code<=48?'Fog':code<=67?'Rain':code<=77?'Snow':code<=82?'Showers':code<=86?'Snow showers':code<=99?'Thunderstorms':'Variable';
const readLocation=():Location|null=>{try{const v=localStorage.getItem(KEY);return v?JSON.parse(v):null}catch{return null}};
export default function TodayWeather(){
 const[location,setLocation]=useState<Location|null>(readLocation),[query,setQuery]=useState(''),[weather,setWeather]=useState<Weather|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[editing,setEditing]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{if(!location){setWeather(null);return}let active=true;const controller=new AbortController();setBusy(true);setError('');
 (async()=>{try{
  const url=new URL('https://api.open-meteo.com/v1/forecast');url.searchParams.set('latitude',String(location.latitude));url.searchParams.set('longitude',String(location.longitude));url.searchParams.set('current','temperature_2m,weather_code');url.searchParams.set('hourly','temperature_2m,precipitation_probability,weather_code');url.searchParams.set('temperature_unit','fahrenheit');url.searchParams.set('timezone','auto');url.searchParams.set('forecast_days','2');
  const res=await fetch(url.toString(),{signal:controller.signal});if(!res.ok)throw Error('Forecast unavailable');const data=await res.json();
  const times:string[]=data.hourly?.time??[];const now=data.current?.time??'';const hour=now.slice(0,13);const start=Math.max(0,times.findIndex(t=>t.slice(0,13)>=hour));
  const hours=times.slice(start,start+12).map((time,i)=>({time,temperature:data.hourly.temperature_2m[start+i],precipitation:data.hourly.precipitation_probability[start+i],code:data.hourly.weather_code[start+i]}));
  if(!hours.length||typeof data.current?.temperature_2m!=='number')throw Error('Forecast data incomplete');
  if(active)setWeather({temperature:data.current.temperature_2m,code:data.current.weather_code,hours,updated:new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})});
 }catch(e){if(active&&!(e instanceof DOMException&&e.name==='AbortError'))setError('Weather is unavailable. Try refreshing.')}finally{if(active)setBusy(false)}})();
 return()=>{active=false;controller.abort()};
 },[location,refresh]);
 const choose=async(e:FormEvent)=>{e.preventDefault();if(!query.trim())return;setBusy(true);setError('');try{
  const url=new URL('https://geocoding-api.open-meteo.com/v1/search');url.searchParams.set('name',query.trim());url.searchParams.set('count','1');url.searchParams.set('language','en');url.searchParams.set('format','json');
  const response=await fetch(url.toString());if(!response.ok)throw Error('Search unavailable');const result=(await response.json()).results?.[0];if(!result){setError('No location found. Try city and state.');return}
  const next={name:[result.name,result.admin1,result.country_code].filter(Boolean).join(', '),latitude:result.latitude,longitude:result.longitude,timezone:result.timezone};localStorage.setItem(KEY,JSON.stringify(next));setLocation(next);setEditing(false);setWeather(null);
 }catch{setError('Location search failed. Please try again.')}finally{setBusy(false)}};
 return <section className="builder-card arc-today-weather" aria-label="Local hourly weather"><header className="arc-weather-heading"><div><span className="eyebrow">LOCAL CONDITIONS</span><h2><CloudSun size={20}/> Weather today</h2><p>{location?<><MapPin size={13}/>{location.name}</>:'Choose your location to see current conditions and the next 12 hours.'}</p></div><div className="arc-weather-actions">{location&&<button type="button" onClick={()=>setRefresh(x=>x+1)} aria-label="Refresh weather" disabled={busy}><RefreshCw size={16}/></button>}<button type="button" onClick={()=>setEditing(x=>!x)}>{location?'Change location':'Set location'}</button></div></header>
 {(editing||!location)&&<form className="arc-weather-location" onSubmit={choose}><label htmlFor="arc-weather-city">City or ZIP code</label><input id="arc-weather-city" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. St. Louis, Missouri" autoComplete="address-level2"/><button type="submit" disabled={busy||!query.trim()}>Use location</button></form>}
 {busy&&!weather&&<p role="status">Loading weather…</p>}{error&&<p role="alert">{error}</p>}
 {weather&&<><div className="arc-weather-current"><strong>{Math.round(weather.temperature)}°F</strong><span>{description(weather.code)}<small>Updated {weather.updated} · Forecast by Open-Meteo</small></span></div><div className="arc-weather-hours" aria-label="Next 12 hours">{weather.hours.map(h=><article key={h.time}><b>{new Date(h.time).toLocaleTimeString([],{hour:'numeric',timeZone:'UTC'})}</b><span>{Math.round(h.temperature)}°</span><small>{description(h.code)}</small><small>Rain {h.precipitation??0}%</small></article>)}</div></>}
 </section>;
}
