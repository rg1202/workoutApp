import { test, expect } from '@playwright/test';
import { exerciseResults } from '../src/arc/exerciseResults';
import type { SessionRecord } from '../src/storage';

const set = (exerciseId: string, weight: number, reps: number, kind: 'Working'|'Warm-up' = 'Working') => ({
  exerciseId,
  exerciseName: exerciseId === 'squat' ? 'Squat' : 'Row',
  set: { weight, reps, rir: 2, kind, completedAt: '2026-11-01T12:00:00Z' },
});
const record = (id: string, completedAt: string, sets: SessionRecord['sets']): SessionRecord => ({
  id, name: 'Workout', completedAt, sets,
});

test('session results count warm-ups separately and compute working volume', () => {
  const current = record('current', '2026-11-02T12:00:00Z', [
    set('squat', 45, 10, 'Warm-up'), set('squat', 100, 5), set('squat', 110, 5),
    set('row', 50, 8),
  ]);
  const results = exerciseResults(current, [current]);
  expect(results).toHaveLength(2);
  expect(results[0]).toMatchObject({ exerciseName: 'Squat', workingSets: 2, warmupSets: 1, volume: 1050, bestWeight: 110, previousVolume: null, volumeChange: null });
  expect(results[1]).toMatchObject({ exerciseName: 'Row', workingSets: 1, volume: 400 });
});

test('session results compare against latest earlier workout for each exercise', () => {
  const older = record('older', '2026-10-01T12:00:00Z', [set('squat', 80, 5)]);
  const latest = record('latest', '2026-10-31T12:00:00Z', [set('squat', 100, 5), set('squat', 45, 10, 'Warm-up')]);
  const future = record('future', '2026-11-03T12:00:00Z', [set('squat', 200, 5)]);
  const current = record('current', '2026-11-02T12:00:00Z', [set('squat', 110, 5)]);
  expect(exerciseResults(current, [older, future, current, latest])[0]).toMatchObject({
    previousVolume: 500, previousWorkingSets: 1, volumeChange: 50,
  });
});

test('session results retain empty and warm-up-only exercise outcomes', () => {
  const empty = record('empty', '2026-11-02T12:00:00Z', []);
  expect(exerciseResults(empty, [])).toEqual([]);
  const warmup = record('warmup', '2026-11-02T12:00:00Z', [set('row', 20, 10, 'Warm-up')]);
  expect(exerciseResults(warmup, [])).toMatchObject([{ workingSets: 0, warmupSets: 1, volume: 0, previousVolume: null }]);
});
