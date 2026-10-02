export type StoredSet = { weight: number; reps: number; rir: number; completedAt: string };
export type SessionRecord = { id: string; name: string; programName?: string; week?: number; completedAt: string; sets: { exerciseId: string; exerciseName: string; set: StoredSet }[] };

const SESSION_KEY = 'workoutapp.active-session.v2';
const HISTORY_KEY = 'workoutapp.history.v1';
const PROGRAM_KEY = 'workoutapp.program.v2';

export function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function saveJSON<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }
export const storageKeys = { session: SESSION_KEY, history: HISTORY_KEY, program: PROGRAM_KEY };
