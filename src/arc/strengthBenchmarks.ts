import type { SessionRecord, StoredSet } from '../storage';

/** Estimates are derived from logged working sets; they are not direct 1RM tests. */
export type StrengthBenchmark = {
  exerciseId: string;
  sessions: number;
  firstDate: string;
  latestDate: string;
  baselineEstimatedOneRepMax: number;
  latestEstimatedOneRepMax: number;
  changePercent: number | null;
  peakEstimatedOneRepMax: number;
  latestWorkingVolume: number;
};
const working = (set: StoredSet) => (set.kind ?? 'Working') === 'Working' && set.weight > 0 && set.reps > 0;
export const estimatedOneRepMax = (weight: number, reps: number): number | null =>
  Number.isFinite(weight) && Number.isFinite(reps) && weight > 0 && reps >= 1 && reps <= 12
    ? Math.round(weight * (1 + reps / 30) * 10) / 10 : null;

export function strengthBenchmark(history: SessionRecord[], exerciseId: string): StrengthBenchmark | null {
  const sessions = history.flatMap(session => {
    const sets = session.sets.filter(x => x.exerciseId === exerciseId && working(x.set)).map(x => x.set);
    const estimates = sets.map(x => estimatedOneRepMax(x.weight, x.reps)).filter((n): n is number => n !== null);
    if (!estimates.length) return [];
    const date = Date.parse(session.completedAt);
    if (!Number.isFinite(date)) return [];
    return [{ date, isoDate: session.completedAt, best: Math.max(...estimates),
      volume: sets.reduce((sum, set) => sum + set.weight * set.reps, 0) }];
  }).sort((a, b) => a.date - b.date);
  if (!sessions.length) return null;
  const first = sessions[0], latest = sessions[sessions.length - 1];
  return {
    exerciseId, sessions: sessions.length, firstDate: first.isoDate, latestDate: latest.isoDate,
    baselineEstimatedOneRepMax: first.best, latestEstimatedOneRepMax: latest.best,
    changePercent: first.best > 0 ? Math.round((latest.best / first.best - 1) * 1000) / 10 : null,
    peakEstimatedOneRepMax: Math.max(...sessions.map(x => x.best)),
    latestWorkingVolume: latest.volume
  };
}

export type TrainingBlock = {
  id: string; goalId?: string; focusId?: string; startDate: string; endDate: string;
  objective: string; targetExerciseId?: string; targetEstimatedOneRepMax?: number;
  assessmentDates: string[];
};
export function trainingBlockProgress(block: TrainingBlock, history: SessionRecord[]) {
  const benchmark = block.targetExerciseId ? strengthBenchmark(history, block.targetExerciseId) : null;
  const target = block.targetEstimatedOneRepMax;
  return {
    benchmark,
    targetReached: !!(benchmark && target && benchmark.latestEstimatedOneRepMax >= target),
    nextAssessmentDate: block.assessmentDates.filter(date => date >= new Date().toISOString().slice(0, 10)).sort()[0] ?? null
  };
}
