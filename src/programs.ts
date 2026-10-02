import { exercises } from './data';

export type Prescription = { id: string; exerciseId: string; sets: number; minReps: number; maxReps: number; rir: number; weight: number };
export type WorkoutDay = { id: string; name: string; prescriptions: Prescription[] };
export type Program = { id: string; name: string; goal: 'Hypertrophy'|'Strength'|'Endurance'|'Mixed'; weeks: number; activeWeek: number; activeDayId: string; days: WorkoutDay[] };

export const starterProgram: Program = {
  id: 'starter-program', name: '8-Week Hypertrophy Block', goal: 'Hypertrophy', weeks: 8, activeWeek: 1, activeDayId: 'lower-a',
  days: [
    { id:'lower-a', name:'Lower A', prescriptions:[
      { id:'p1', exerciseId:exercises[0].id, sets:4, minReps:6, maxReps:8, rir:2, weight:185 },
      { id:'p2', exerciseId:exercises[1].id, sets:3, minReps:8, maxReps:10, rir:2, weight:185 },
      { id:'p3', exerciseId:exercises[2].id, sets:3, minReps:10, maxReps:12, rir:1, weight:270 },
    ]},
    { id:'upper-a', name:'Upper A', prescriptions:[] },
    { id:'lower-b', name:'Lower B', prescriptions:[] },
    { id:'upper-b', name:'Upper B', prescriptions:[] },
  ]
};
