export const DAILY_STATE_KEY='arc.daily-state.v1';
export type DailyState={
 date:string;
 mood?:number;
 energy?:number;
 motivation?:number;
 soreness?:number;
 stress?:number;
 sleepQuality?:number;
 sleepHours?:number;
 hydration?:number;
 nutrition?:'Low'|'On track'|'High';
 supplements?:string[];
 notes?:string;
 updatedAt?:string;
};
export const dailyStateDefaults=(date:string):DailyState=>({date,mood:3,energy:3,motivation:3,soreness:3,stress:3,sleepQuality:3,sleepHours:7,hydration:3,nutrition:'On track',supplements:[]});

export const SESSION_STATE_KEY='arc.session-state.v1';
export type SessionState={
 planId:string;
 date:string;
 motivation?:number;
 readiness?:number;
 note?:string;
 updatedAt?:string;
};
