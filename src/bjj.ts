export type BjjSessionType='Gi'|'No-Gi'|'Competition'|'Open Mat'|'Drilling'|'Private';
export type BjjSession={id:string;date:string;sessionType:BjjSessionType;durationMinutes:number;rpe:number;rounds:number;liveMinutes:number;techniques:string;submissionsFor:number;submissionsAgainst:number;notes:string;externalActivityId?:string};
export const BJJ_STORAGE_KEY='workoutapp.bjj-sessions.v1';
export const bjjLoad=(s:BjjSession)=>Math.round(s.durationMinutes*s.rpe);
export function bjjSummary(sessions:BjjSession[],days=7){const since=Date.now()-days*86400000;const recent=sessions.filter(s=>new Date(`${s.date}T12:00:00`).getTime()>=since);return{sessions:recent.length,minutes:recent.reduce((n,s)=>n+s.durationMinutes,0),liveMinutes:recent.reduce((n,s)=>n+s.liveMinutes,0),rounds:recent.reduce((n,s)=>n+s.rounds,0),load:recent.reduce((n,s)=>n+bjjLoad(s),0)};}
