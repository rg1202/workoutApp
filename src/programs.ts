import { exercises } from './data';

export type ProgressionType='None'|'Linear Load'|'Double Progression'|'RIR Progression'|'Linear Periodization'|'Undulating'|'Block Periodization';
export type Progression={type:ProgressionType;loadStep:number;startRir:number;endRir:number;deloadEvery:number;deloadPercent:number};
export type Prescription={id:string;exerciseId:string;sets:number;minReps:number;maxReps:number;rir:number;weight:number};
export type WorkoutDay={id:string;name:string;prescriptions:Prescription[]};
export type Program={id:string;name:string;goal:'Hypertrophy'|'Strength'|'Endurance'|'Mixed';weeks:number;activeWeek:number;activeDayId:string;days:WorkoutDay[];progression:Progression};
export const defaultProgression:Progression={type:'None',loadStep:5,startRir:3,endRir:1,deloadEvery:4,deloadPercent:15};
export const starterProgram:Program={id:'starter-program',name:'8-Week Hypertrophy Block',goal:'Hypertrophy',weeks:8,activeWeek:1,activeDayId:'lower-a',progression:{...defaultProgression,type:'RIR Progression'},days:[
{id:'lower-a',name:'Lower A',prescriptions:[{id:'p1',exerciseId:exercises[0].id,sets:4,minReps:6,maxReps:8,rir:2,weight:185},{id:'p2',exerciseId:exercises[1].id,sets:3,minReps:8,maxReps:10,rir:2,weight:185},{id:'p3',exerciseId:exercises[2].id,sets:3,minReps:10,maxReps:12,rir:1,weight:270}]},{id:'upper-a',name:'Upper A',prescriptions:[]},{id:'lower-b',name:'Lower B',prescriptions:[]},{id:'upper-b',name:'Upper B',prescriptions:[]} ]};

export function weekPrescription(base:Prescription,program:Program,dayIndex:number){
 const w=program.activeWeek,p=program.progression;let weight=base.weight,rir=base.rir,minReps=base.minReps,maxReps=base.maxReps,sets=base.sets,note='Base prescription';
 const deload=p.deloadEvery>0&&w%p.deloadEvery===0;
 if(p.type==='Linear Load'){weight+=Math.max(0,w-1)*p.loadStep;note=`+${p.loadStep} lb each week`;}
 if(p.type==='Double Progression'){note=`Earn load increases by reaching ${maxReps} reps at target RIR`;}
 if(p.type==='RIR Progression'){const span=Math.max(1,program.weeks-1);rir=Math.round((p.startRir-(p.startRir-p.endRir)*(w-1)/span)*2)/2;note=`RIR trends ${p.startRir} → ${p.endRir}`;}
 if(p.type==='Linear Periodization'){const pct=(w-1)/Math.max(1,program.weeks-1);weight=Math.round((base.weight*(1+pct*.15))/5)*5;minReps=Math.max(1,Math.round(base.minReps*(1-pct*.35)));maxReps=Math.max(minReps,Math.round(base.maxReps*(1-pct*.35)));note='Intensity rises as reps fall';}
 if(p.type==='Undulating'){const modes=[{m:1,r:0,s:0,n:'Strength emphasis'},{m:.9,r:4,s:0,n:'Hypertrophy emphasis'},{m:.8,r:8,s:1,n:'Endurance emphasis'}],mode=modes[dayIndex%3];weight=Math.round(base.weight*mode.m/5)*5;minReps+=mode.r;maxReps+=mode.r;sets=Math.max(1,sets-mode.s);note=mode.n;}
 if(p.type==='Block Periodization'){const third=Math.ceil(program.weeks/3);if(w<=third){maxReps+=3;minReps+=2;weight=Math.round(base.weight*.9/5)*5;note='Accumulation block';}else if(w<=third*2){note='Intensification block';}else{weight=Math.round(base.weight*1.05/5)*5;minReps=Math.max(1,minReps-2);maxReps=Math.max(minReps,maxReps-2);note='Realization block';}}
 if(deload){weight=Math.round(weight*(1-p.deloadPercent/100)/5)*5;sets=Math.max(1,Math.ceil(sets*.6));rir=Math.max(rir,3);note+=` · Deload -${p.deloadPercent}%`;}
 return{...base,weight,rir,minReps,maxReps,sets,note};
}
