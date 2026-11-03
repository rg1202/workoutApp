import { test, expect } from '@playwright/test';
import { nextExperienceScreen, workoutEntryAction, type WorkoutLifecycle } from '../src/arc/experienceNavigation';

test('Today opens a contextual workout and returns to Today',()=>{
 expect(nextExperienceScreen('TodayOverview','OpenWorkout')).toBe('WorkoutMode');
 expect(nextExperienceScreen('WorkoutMode','ReviewResult')).toBe('SessionSummary');
 expect(nextExperienceScreen('SessionSummary','ReturnToToday')).toBe('TodayOverview');
});
test('unrelated navigation events do not advance the experience',()=>{
 expect(nextExperienceScreen('TodayOverview','ReviewResult')).toBe('TodayOverview');
 expect(nextExperienceScreen('WorkoutMode','BackToWorkout')).toBe('WorkoutMode');
});
test('entry actions distinguish start, resume, and read-only results',()=>{
 const cases: [WorkoutLifecycle,string][]=[['NotStarted','Start'],['InProgress','Resume'],['Paused','Resume'],['Completed','ViewResults'],['Partial','ViewResults'],['Abandoned','Start']];
 for(const [state,expected] of cases) expect(workoutEntryAction(state)).toBe(expected);
});
test('repeat is always an explicit new attempt',()=>{
 expect(workoutEntryAction('Completed',true)).toBe('StartNewAttempt');
 expect(workoutEntryAction('Partial',true)).toBe('StartNewAttempt');
});
