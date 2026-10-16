import type {PlannedActivityType} from '../plans';
import type {ActivityActuals} from './activityActuals';

/** Focus owns session semantics; goals only determine contribution and targets. */
export type FocusId='BJJ'|'Running'|'Cycling';
export type SessionDomain=FocusId|'Strength'|'Mobility'|'Recovery'|'Other';
export type SessionField={key:keyof ActivityActuals;label:string;unit?:string};
export type FocusDefinition={
 id:FocusId;
 activityType:PlannedActivityType;
 keywords:readonly string[];
 plannedFields:readonly string[];
 actualFields:readonly SessionField[];
 progressMetrics:readonly string[];
};
export const FOCUS_SESSION_REGISTRY:Record<FocusId,FocusDefinition>={
 BJJ:{
  id:'BJJ',activityType:'BJJ',keywords:['bjj','jiu jitsu','grappling'],
  plannedFields:['format','focus','durationMinutes'],
  actualFields:[{key:'actualDurationMinutes',label:'Training minutes',unit:'min'},{key:'rounds',label:'Rounds'},{key:'liveMinutes',label:'Live minutes',unit:'min'},{key:'submissionsFor',label:'Submissions for'},{key:'submissionsAgainst',label:'Submissions against'},{key:'techniques',label:'Techniques'},{key:'effort',label:'Effort'}],
  progressMetrics:['attendance','trainingMinutes','technicalPractice']
 },
 Running:{
  id:'Running',activityType:'Cardio',keywords:['run','running','jog','race','marathon'],
  plannedFields:['format','distanceKm','intensity','durationMinutes'],
  actualFields:[{key:'actualDurationMinutes',label:'Duration',unit:'min'},{key:'distanceKm',label:'Distance',unit:'km'},{key:'elevationMeters',label:'Elevation',unit:'m'},{key:'effort',label:'Effort'}],
  progressMetrics:['distanceKm','durationMinutes','pace','consistency']
 },
 Cycling:{
  id:'Cycling',activityType:'Cardio',keywords:['cycl','bike','biking','ride','riding'],
  plannedFields:['format','distanceKm','intensity','durationMinutes'],
  actualFields:[{key:'actualDurationMinutes',label:'Duration',unit:'min'},{key:'distanceKm',label:'Distance',unit:'km'},{key:'elevationMeters',label:'Elevation',unit:'m'},{key:'effort',label:'Effort'}],
  progressMetrics:['distanceKm','durationMinutes','speed','elevationMeters']
 }
};
export const focusDefinition=(id:FocusId)=>FOCUS_SESSION_REGISTRY[id];

/** Legacy records without an explicit focus can be classified without mutation. */
export function inferSessionDomain(type:PlannedActivityType,title:string,explicitFocus?:FocusId):SessionDomain{
 if(explicitFocus)return explicitFocus;
 if(type==='BJJ')return 'BJJ';
 if(type==='Strength'||type==='Mobility'||type==='Recovery')return type;
 if(type!=='Cardio')return 'Other';
 const normalized=title.toLowerCase();
 if(FOCUS_SESSION_REGISTRY.Cycling.keywords.some(word=>normalized.includes(word)))return 'Cycling';
 if(FOCUS_SESSION_REGISTRY.Running.keywords.some(word=>normalized.includes(word)))return 'Running';
 return 'Other';
}
export function isFocusId(value:string):value is FocusId{return value==='BJJ'||value==='Running'||value==='Cycling'}
