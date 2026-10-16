import type {ActivityActuals} from './activityActuals';
import type {FocusId,SessionDomain} from './focusSessionRegistry';
import {FOCUS_SESSION_REGISTRY} from './focusSessionRegistry';
export type PlannedSessionMetrics=Partial<Pick<ActivityActuals,'distanceKm'|'elevationMeters'|'rounds'|'liveMinutes'|'effort'|'submissionsFor'|'submissionsAgainst'|'techniques'>>;
export type SessionMetricField={key:keyof ActivityActuals;label:string;kind:'number'|'text';unit?:string};
const common:SessionMetricField[]=[{key:'actualDurationMinutes',label:'Duration',kind:'number',unit:'min'},{key:'effort',label:'Effort / RPE (1–10)',kind:'number'}];
const domainFields:Record<FocusId,SessionMetricField[]>={
 BJJ:[{key:'rounds',label:'Rounds',kind:'number'},{key:'liveMinutes',label:'Live minutes',kind:'number',unit:'min'},{key:'submissionsFor',label:'Submissions for',kind:'number'},{key:'submissionsAgainst',label:'Submissions against',kind:'number'},{key:'techniques',label:'Techniques',kind:'text'}],
 Running:[{key:'distanceKm',label:'Distance',kind:'number',unit:'km'},{key:'elevationMeters',label:'Elevation gain',kind:'number',unit:'m'}],
 Cycling:[{key:'distanceKm',label:'Distance',kind:'number',unit:'km'},{key:'elevationMeters',label:'Elevation gain',kind:'number',unit:'m'}]
};
export function sessionMetricFields(domain:SessionDomain):SessionMetricField[]{
 if(domain==='BJJ'||domain==='Running'||domain==='Cycling'){
  const allowed=new Set(FOCUS_SESSION_REGISTRY[domain].actualFields.map(field=>field.key));
  return [...common,...domainFields[domain]].filter(field=>allowed.has(field.key));
 }
 return common;
}
