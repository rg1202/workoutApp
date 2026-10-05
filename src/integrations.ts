export type IntegrationProvider='strava'|'garmin'|'eight_sleep';
export type IntegrationStatus={provider:IntegrationProvider;connected:boolean;lastSync?:string;message?:string};
export type ExternalActivity={id:string;provider:IntegrationProvider;providerId:string;name:string;type:string;startDate:string;durationMinutes:number;distanceKm?:number;averageHeartRate?:number;maxHeartRate?:number;calories?:number;trainingLoad?:number};
export type RecoveryRecord={id:string;provider:IntegrationProvider;date:string;sleepHours?:number;sleepScore?:number;hrv?:number;restingHeartRate?:number;stress?:number;bodyBattery?:number;temperatureDeviation?:number};
export const integrationStorage={status:'workoutapp.integrations.v1',activities:'workoutapp.external-activities.v1',recovery:'workoutapp.recovery.v1'};
export function recentExternalLoad(activities:ExternalActivity[],days=7){const since=Date.now()-days*86400000;return activities.filter(a=>new Date(a.startDate).getTime()>=since).reduce((n,a)=>n+(a.trainingLoad??a.durationMinutes),0)}
export function recoverySummary(records:RecoveryRecord[]){const latest=[...records].sort((a,b)=>b.date.localeCompare(a.date))[0];if(!latest)return undefined;return latest}
