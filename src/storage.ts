export type StoredSet = { weight: number; reps: number; rir: number; completedAt: string; kind?:'Warm-up'|'Working' };
export type SessionRecord = { id: string; name: string; programId?: string; programName?: string; dayId?: string; week?: number; completedAt: string; durationMinutes?:number; notes?:string; exerciseNotes?:Record<string,string>; sets: { exerciseId: string; exerciseName: string; set: StoredSet }[] };
export type DailyCheckIn={date:string;energy:number;mood:number;soreness:number;stress:number;sleepQuality:number;sleepHours:number;notes:string};
export type BodyMetric={id:string;date:string;weight?:number;waist?:number;chest?:number;arms?:number;thighs?:number};
export type InjuryStatus='Active'|'Improving'|'Resolved';export type InjuryImpact='No change'|'Improved'|'Aggravated';export type Injury={id:string;name:string;bodyArea:string;side:'Left'|'Right'|'Both'|'N/A';type:string;onsetDate:string;severity:number;status:InjuryStatus;notes:string;strengthRestriction?:string;bjjRestriction?:string;resolvedDate?:string};

const SESSION_KEY = 'workoutapp.active-session.v3';
const HISTORY_KEY = 'workoutapp.history.v2';
const PROGRAMS_KEY = 'workoutapp.programs.v3';
const LEGACY_PROGRAM_KEY = 'workoutapp.program.v2';
const CHECKINS_KEY='workoutapp.checkins.v1';
const BODY_KEY='workoutapp.body-metrics.v1';
const CUSTOM_EXERCISES_KEY='workoutapp.custom-exercises.v1';
const FAVORITE_EXERCISES_KEY='workoutapp.favorite-exercises.v1';
const INJURIES_KEY='workoutapp.injuries.v1';
export const DATA_CHANGE_EVENT='workoutapp:data-change';
export const STORAGE_ERROR_EVENT='arc:storage-error';
export type StorageIssue={key:string;operation:'read'|'write';message:string};
const storageIssues=new Map<string,StorageIssue>();
export function getStorageIssues():StorageIssue[]{return [...storageIssues.values()];}
function reportStorageIssue(issue:StorageIssue){storageIssues.set(issue.operation+':'+issue.key,issue);if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT,{detail:issue}));}


export function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw) as T; } catch { reportStorageIssue({key,operation:'read',message:'Stored data could not be read. The original value has been preserved.'});return fallback; }
}
export function saveJSON<T>(key: string, value: T, source='app') { try { const serialized=JSON.stringify(value);if(serialized===undefined)throw new Error('Cannot serialize value');const previous=localStorage.getItem(key);if(previous!==null){try{JSON.parse(previous)}catch{throw new Error('Refusing to overwrite unreadable JSON at '+key)}}localStorage.setItem(key, serialized);if(localStorage.getItem(key)!==serialized)throw new Error('Storage write was not persisted');storageIssues.delete('write:'+key);window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT,{detail:{key,source}})); } catch(error){reportStorageIssue({key,operation:'write',message:'Your latest change was not saved. Export a backup and free browser storage before trying again.'});throw error;} }
export function sameJSON(a:unknown,b:unknown){return JSON.stringify(a)===JSON.stringify(b)}
export function loadLegacyProgram<T>(): T | null { try { const raw=localStorage.getItem(LEGACY_PROGRAM_KEY); return raw?JSON.parse(raw) as T:null; } catch { return null; } }
export const storageKeys = { session: SESSION_KEY, history: HISTORY_KEY, programs: PROGRAMS_KEY,checkins:CHECKINS_KEY,body:BODY_KEY,customExercises:CUSTOM_EXERCISES_KEY,favoriteExercises:FAVORITE_EXERCISES_KEY,injuries:INJURIES_KEY };
