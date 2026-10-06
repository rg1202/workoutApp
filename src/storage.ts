export type StoredSet = { weight: number; reps: number; rir: number; completedAt: string };
export type SessionRecord = { id: string; name: string; programId?: string; programName?: string; dayId?: string; week?: number; completedAt: string; sets: { exerciseId: string; exerciseName: string; set: StoredSet }[] };
export type DailyCheckIn={date:string;energy:number;mood:number;soreness:number;stress:number;sleepQuality:number;sleepHours:number;notes:string};
export type BodyMetric={id:string;date:string;weight?:number;waist?:number;chest?:number;arms?:number;thighs?:number};

const SESSION_KEY = 'workoutapp.active-session.v3';
const HISTORY_KEY = 'workoutapp.history.v2';
const PROGRAMS_KEY = 'workoutapp.programs.v3';
const LEGACY_PROGRAM_KEY = 'workoutapp.program.v2';
const CHECKINS_KEY='workoutapp.checkins.v1';
const BODY_KEY='workoutapp.body-metrics.v1';
export const DATA_CHANGE_EVENT='workoutapp:data-change';

export function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function saveJSON<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT,{detail:{key}})); }
export function loadLegacyProgram<T>(): T | null { try { const raw=localStorage.getItem(LEGACY_PROGRAM_KEY); return raw?JSON.parse(raw) as T:null; } catch { return null; } }
export const storageKeys = { session: SESSION_KEY, history: HISTORY_KEY, programs: PROGRAMS_KEY,checkins:CHECKINS_KEY,body:BODY_KEY };
