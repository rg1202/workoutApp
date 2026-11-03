/** ARC-UX-001: presentation/navigation contract, independent of workout storage. */
export type ArcExperienceScreen = 'TodayOverview' | 'WorkoutMode' | 'SessionSummary';
export type WorkoutLifecycle = 'NotStarted' | 'InProgress' | 'Paused' | 'Completed' | 'Partial' | 'Abandoned';
export type WorkoutEntryAction = 'Start' | 'Resume' | 'ViewResults' | 'StartNewAttempt';

/** Recorded outcomes take precedence over draft state; repeating is always explicit. */
export function workoutEntryAction(
  lifecycle: WorkoutLifecycle,
  explicitRepeat = false,
): WorkoutEntryAction {
  if (explicitRepeat) return 'StartNewAttempt';
  if (lifecycle === 'Completed' || lifecycle === 'Partial') return 'ViewResults';
  if (lifecycle === 'InProgress' || lifecycle === 'Paused') return 'Resume';
  return 'Start';
}

export function nextExperienceScreen(
  current: ArcExperienceScreen,
  event: 'OpenWorkout' | 'ReviewResult' | 'ReturnToToday' | 'BackToWorkout',
): ArcExperienceScreen {
  if (event === 'ReturnToToday') return 'TodayOverview';
  if (event === 'OpenWorkout') return 'WorkoutMode';
  if (event === 'ReviewResult' && current === 'WorkoutMode') return 'SessionSummary';
  if (event === 'BackToWorkout' && current === 'SessionSummary') return 'WorkoutMode';
  return current;
}
