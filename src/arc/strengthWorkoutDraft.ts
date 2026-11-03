import type { ActiveStrengthPlan } from './activeStrengthPlan';
import type { StoredSet } from '../storage';

export type StrengthWorkoutDraft = {
  planId: string;
  logs: Record<string, StoredSet[]>;
  exerciseSelections: Record<string, string>;
  exerciseNotes: Record<string, string>;
  sessionNotes: string;
  startedAt: number | null;
  savedAt: string;
};

export const STRENGTH_DRAFT_PREFIX = 'arc.strength-draft.v1:';
export const strengthDraftKey = (planId: string) => STRENGTH_DRAFT_PREFIX + encodeURIComponent(planId);
export const emptyStrengthDraft = (selection: ActiveStrengthPlan): StrengthWorkoutDraft => ({
  planId: selection.planId, logs: {}, exerciseSelections: {}, exerciseNotes: {},
  sessionNotes: '', startedAt: null, savedAt: new Date().toISOString(),
});
export function isStrengthDraft(value: unknown, planId: string): value is StrengthWorkoutDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<StrengthWorkoutDraft>;
  return draft.planId === planId && !!draft.logs && typeof draft.logs === 'object' &&
    !!draft.exerciseSelections && typeof draft.exerciseSelections === 'object' &&
    !!draft.exerciseNotes && typeof draft.exerciseNotes === 'object' &&
    typeof draft.sessionNotes === 'string' &&
    (draft.startedAt === null || typeof draft.startedAt === 'number');
}
