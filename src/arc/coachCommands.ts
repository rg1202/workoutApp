export type CoachCommand=
 |{type:'set';weight:number;reps:number;rir:number}
 |{type:'next'}|{type:'rest';seconds:number}|{type:'stop-rest'}|{type:'help'}|{type:'unknown'};
export function parseCoachCommand(raw:string):CoachCommand{
 const text=raw.trim().toLowerCase().replace(/,/g,'');
 if(/^(help|commands|what can you do)\??$/.test(text))return{type:'help'};
 if(/^(what('s| is) next|next exercise|next)\??$/.test(text))return{type:'next'};
 if(/^(stop rest|end rest|skip rest)$/.test(text))return{type:'stop-rest'};
 const rest=text.match(/^(?:start |set |extend )?(?:my )?rest(?: for| by)?\s+(\d{1,3})\s*(seconds?|secs?|s|minutes?|mins?|m)$/);
 if(rest){const seconds=Number(rest[1])*(rest[2].startsWith('m')?60:1);return seconds>=10&&seconds<=1800?{type:'rest',seconds}:{type:'unknown'};}
 const a=text.match(/^(?:i (?:did|got|completed)\s+)?(\d{1,3})\s*(?:reps?|repetitions?)\s*(?:at|@|with)\s*(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds?)?(?:\s*[, ]*\s*(\d{1,2})\s*rir)?\.?$/);
 const b=text.match(/^(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds?)?\s*[x×]\s*(\d{1,3})(?:\s*(?:reps?))?(?:\s*[, ]*\s*(\d{1,2})\s*rir)?\.?$/);
 const weight=Number(a?.[2]??b?.[1]),reps=Number(a?.[1]??b?.[2]),rir=Number(a?.[3]??b?.[3]??2);
 if((a||b)&&Number.isFinite(weight)&&weight>=0&&weight<=2000&&reps>=1&&reps<=200&&rir>=0&&rir<=10)return{type:'set',weight,reps,rir};
 return{type:'unknown'};
}
