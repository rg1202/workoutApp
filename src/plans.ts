import type {PlannedSessionMetrics} from './arc/sessionMetricFields';
import type {SpecificSessionPlan} from './arc/EnduranceBjjSessionFields';
import type {ActivityActuals} from './arc/activityActuals';
export type SessionMovement={id:string;name:string;sets?:number;reps?:number;holdSeconds?:number;restSeconds?:number;instructions?:string};
export type SessionPrescription={version:1;purpose?:string;completionRule?:string;movements:SessionMovement[]};
export type SessionMovementResult={movementId:string;completed:boolean;actualSets?:number;actualReps?:number;actualHoldSeconds?:number;note?:string};
export type SessionExecution={startedAt?:string;finishedAt?:string;movements:SessionMovementResult[]};
export type PlannedActivityType='Strength'|'BJJ'|'Cardio'|'Mobility'|'Recovery'|'Other';export type PlannedActivityStatus='Planned'|'Completed'|'Skipped';export type PlannedActivitySource='Goal'|'Program'|'Focus'|'Manual';export type PlannedActivity={id:string;date:string;time?:string;title:string;type:PlannedActivityType;durationMinutes?:number;notes?:string;prescription?:SessionPrescription;specificPlan?:SpecificSessionPlan;plannedMetrics?:PlannedSessionMetrics;execution?:SessionExecution;status:PlannedActivityStatus;linkedActivityId?:string;programId?:string;generatedKind?:'BJJ';sourceType?:PlannedActivitySource;sourceId?:string;sourceLabel?:string;goalIds?:string[];sessionMotivation?:number;sessionReadiness?:number;sessionStateNote?:string;sessionEffort?:number;actuals?:ActivityActuals;revisions?:{savedAt:string;status:PlannedActivityStatus;actuals?:ActivityActuals;notes?:string}[];sessionResult?:'Poor'|'Mixed'|'Good'|'Great';sessionResultNote?:string;recoveryBody?:'Good'|'Worked'|'Sore'|'Concern';recoveryNeed?:'Low'|'Normal'|'High';recoveryNote?:string};export const PLANNED_ACTIVITIES_KEY='workoutapp.planned-activities.v1';

export type GeneratedBjjTemplate={title:string;durationMinutes?:number;weekdays:number[]};
