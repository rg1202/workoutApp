import {useMemo,useState} from 'react';
import {Plug,Search} from 'lucide-react';
type Entry={name:string;category:string;focus:string;method:string;detail:string};
const entries:Entry[]=[
 ['Strava','Fitness & endurance','Running, Cycling','API','Activity and workout sync'],
 ['Garmin Connect','Fitness & endurance','Running, Cycling','Partner API','Activity and wellness data; provider approval may be required'],
 ['COROS','Fitness & endurance','Running, Cycling','Partner API','Training and device data; access subject to provider terms'],
 ['Polar Flow','Fitness & endurance','Running, Cycling','Partner API','Activity and heart-rate records'],
 ['Suunto','Fitness & endurance','Running, Cycling','Partner API','Training and routes'],
 ['Wahoo','Fitness & endurance','Cycling','Partner API','Cycling workouts and devices'],
 ['TrainingPeaks','Fitness & endurance','Running, Cycling','Partner API','Structured training and performance'],
 ['Zwift','Fitness & endurance','Cycling','Import / restricted API','Virtual cycling sessions'],
 ['ROUVY','Fitness & endurance','Cycling','Import / partner','Indoor cycling sessions'],
 ['intervals.icu','Fitness & endurance','Running, Cycling','API','Training load and endurance analysis'],
 ['Apple Health','Health & wearables','Future Focus','Device bridge','Apple platform health data; native bridge required'],
 ['Health Connect','Health & wearables','Future Focus','Device bridge','Android health data; native bridge required'],
 ['Fitbit','Health & wearables','Future Focus','API','Activity and sleep signals'],
 ['Oura','Health & wearables','Future Focus','API','Sleep and readiness'],
 ['WHOOP','Health & wearables','Future Focus','API','Recovery and strain'],
 ['Withings','Health & wearables','Future Focus','API','Body metrics and devices'],
 ['Eight Sleep','Health & wearables','Future Focus','Partner / restricted','Sleep and recovery'],
 ['Smoothcomp','BJJ & competition','BJJ','Import / restricted','Competition history and results'],
 ['IBJJF','BJJ & competition','BJJ','Import / restricted','Event and ranking records'],
 ['FUJI BJJ','BJJ & competition','BJJ','Manual / import','Tournament records'],
 ['AGF','BJJ & competition','BJJ','Manual / import','Tournament records'],
 ['Gym management systems','BJJ & competition','BJJ','Provider-dependent','Attendance and class schedules'],
 ['Google Calendar','Calendar & planning','All Focuses','API','Scheduled activities and reminders'],
 ['Microsoft Outlook','Calendar & planning','All Focuses','API','Calendar events'],
 ['Apple Calendar','Calendar & planning','All Focuses','Calendar file / bridge','Calendar events via supported export or device'],
 ['Todoist','Calendar & planning','Future Focus','API','Tasks and projects'],
 ['Notion','Calendar & planning','Future Focus','API','Goals, notes, and databases'],
 ['TickTick','Calendar & planning','Future Focus','API / restricted','Tasks and habits'],
 ['Hevy','Strength & nutrition','Future Focus','API / export','Strength workout logs'],
 ['Strong','Strength & nutrition','Future Focus','Export / import','Strength sessions'],
 ['Fitbod','Strength & nutrition','Future Focus','Export / restricted','Workout history'],
 ['MyFitnessPal','Strength & nutrition','Future Focus','Import / restricted','Nutrition summaries'],
 ['Cronometer','Strength & nutrition','Future Focus','Export / partner','Nutrition and energy intake'],
 ['MacroFactor','Strength & nutrition','Future Focus','Export / restricted','Nutrition tracking'],
 ['Goodreads','Learning & productivity','Future Focus','Export / restricted','Reading goals and book logs'],
 ['The StoryGraph','Learning & productivity','Future Focus','Import / export','Reading history'],
 ['Kindle','Learning & productivity','Future Focus','Export / restricted','Reading progress'],
 ['Readwise','Learning & productivity','Future Focus','API','Reading highlights'],
 ['Duolingo','Learning & productivity','Future Focus','Import / restricted','Language learning progress'],
 ['GitHub','Learning & productivity','Future Focus','API','Coding activity and project milestones'],
 ['Toggl Track','Learning & productivity','Future Focus','API','Time tracking'],
 ['Habitica','Habits & reflection','Future Focus','API','Habit and task completion'],
 ['Daylio','Habits & reflection','Future Focus','Export / import','Mood and journal summaries'],
 ['RescueTime','Habits & reflection','Future Focus','API / export','Time-use insights'],
 ['Zapier','Automation & data','All Focuses','Webhooks','Automation workflows'],
 ['Make','Automation & data','All Focuses','Webhooks','Automation workflows'],
 ['IFTTT','Automation & data','All Focuses','Webhooks','Simple triggers and actions'],
 ['Custom webhooks','Automation & data','All Focuses','Webhooks','Developer-defined activity events'],
 ['CSV / JSON files','Automation & data','All Focuses','File import / export','Portable data exchange']
].map(([name,category,focus,method,detail])=>({name,category,focus,method,detail}));
const categories=['All categories',...new Set(entries.map(x=>x.category))];
export default function IntegrationCatalog(){
 const [search,setSearch]=useState(''),[category,setCategory]=useState('All categories');
 const filtered=useMemo(()=>entries.filter(e=>(category==='All categories'||e.category===category)&&[e.name,e.focus,e.method,e.detail].join(' ').toLowerCase().includes(search.toLowerCase().trim())),[search,category]);
 return <section className="arc-integration-catalog" aria-labelledby="arc-integration-catalog-title">
  <div className="arc-catalog-head"><div><span className="eyebrow">EXPLORE THE ECOSYSTEM</span><h2 id="arc-integration-catalog-title"><Plug size={20}/> Integration catalog</h2><p>Potential connections for Arc today and future Focuses. These are ideas, not active integrations or promised partnerships. API access, permissions and feasibility must be verified before development.</p></div><span className="arc-catalog-count">{filtered.length} candidates</span></div>
  <div className="arc-catalog-filters"><label>Search integrations<div className="arc-catalog-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search provider, Focus, or method"/></div></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label></div>
  <div className="arc-catalog-grid">{filtered.map(e=><article key={e.name} className="arc-catalog-card"><div className="arc-catalog-card-head"><div className="arc-catalog-provider-icon" aria-hidden="true"><Plug size={18}/></div><div><h3>{e.name}</h3><span>{e.category}</span></div><span className="arc-catalog-planned">Candidate</span></div><p>{e.detail}</p><div className="arc-catalog-meta"><span>{e.focus}</span><span>{e.method}</span></div></article>)}</div>
  {!filtered.length&&<p role="status">No integrations match this search.</p>}
  <p className="arc-catalog-disclaimer">No third-party account is connected by browsing this catalog. No provider authorization or data access is requested.</p>
 </section>
}
