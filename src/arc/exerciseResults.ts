import type { SessionRecord } from '../storage';

export type ExerciseResult = {
  exerciseId: string;
  exerciseName: string;
  workingSets: number;
  warmupSets: number;
  volume: number;
  bestWeight: number | null;
  previousVolume: number | null;
  previousWorkingSets: number | null;
  volumeChange: number | null;
};

export function exerciseResults(session: SessionRecord, history: SessionRecord[]): ExerciseResult[] {
  const previous = history
    .filter(record => record.id !== session.id && record.completedAt < session.completedAt)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const groups = new Map<string, ExerciseResult>();
  for (const entry of session.sets) {
    const result = groups.get(entry.exerciseId) ?? {
      exerciseId: entry.exerciseId,
      exerciseName: entry.exerciseName,
      workingSets: 0,
      warmupSets: 0,
      volume: 0,
      bestWeight: null,
      previousVolume: null,
      previousWorkingSets: null,
      volumeChange: null,
    };
    if ((entry.set.kind ?? 'Working') === 'Working') {
      result.workingSets++;
      result.volume += Math.max(0, entry.set.weight) * Math.max(0, entry.set.reps);
      result.bestWeight = Math.max(result.bestWeight ?? 0, entry.set.weight);
    } else {
      result.warmupSets++;
    }
    groups.set(entry.exerciseId, result);
  }
  return Array.from(groups.values()).map(result => {
    const prior = previous.find(record => record.sets.some(entry => entry.exerciseId === result.exerciseId && (entry.set.kind ?? 'Working') === 'Working'));
    if (!prior) return result;
    const sets = prior.sets.filter(entry => entry.exerciseId === result.exerciseId && (entry.set.kind ?? 'Working') === 'Working');
    return {
      ...result,
      previousVolume: sets.reduce((total, entry) => total + Math.max(0, entry.set.weight) * Math.max(0, entry.set.reps), 0),
      previousWorkingSets: sets.length,
      volumeChange: result.volume - sets.reduce((total, entry) => total + Math.max(0, entry.set.weight) * Math.max(0, entry.set.reps), 0),
    };
  });
}
