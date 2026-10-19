import type { GoalFocus, GoalV2Type } from './goalsV2';

export type GoalFocusPreset = {
  label: string;
  name: string;
  goalTypeV2: GoalV2Type;
  metric: string;
  unit: string;
};

const presets: Record<'bjj' | 'running' | 'cycling' | 'general', readonly GoalFocusPreset[]> = {
  bjj: [
    { label: 'Rank milestone', name: 'Earn my next belt', goalTypeV2: 'Skill', metric: '', unit: '' },
    { label: 'Competition', name: 'Prepare for my next competition', goalTypeV2: 'Event', metric: '', unit: '' },
    { label: 'Mat consistency', name: 'Train BJJ consistently', goalTypeV2: 'Consistency', metric: 'Sessions', unit: 'sessions' },
    { label: 'Technique mastery', name: 'Master a new technique', goalTypeV2: 'Skill', metric: '', unit: '' }
  ],
  running: [
    { label: 'Race', name: 'Complete a running event', goalTypeV2: 'Event', metric: '', unit: '' },
    { label: 'Distance', name: 'Reach a running distance target', goalTypeV2: 'Performance', metric: 'Distance', unit: 'mi' },
    { label: 'Consistency', name: 'Run consistently', goalTypeV2: 'Consistency', metric: 'Sessions', unit: 'sessions' }
  ],
  cycling: [
    { label: 'Event', name: 'Complete a cycling event', goalTypeV2: 'Event', metric: '', unit: '' },
    { label: 'Distance', name: 'Reach a cycling distance target', goalTypeV2: 'Performance', metric: 'Distance', unit: 'mi' },
    { label: 'Consistency', name: 'Ride consistently', goalTypeV2: 'Consistency', metric: 'Sessions', unit: 'sessions' }
  ],
  general: [
    { label: 'Body composition', name: 'Reach my body composition goal', goalTypeV2: 'Body Composition', metric: 'Bodyweight', unit: 'lb' },
    { label: 'Recovery', name: 'Improve my recovery', goalTypeV2: 'Wellbeing', metric: '', unit: '' },
    { label: 'Lifestyle', name: 'Build a sustainable routine', goalTypeV2: 'Lifestyle', metric: 'Sessions', unit: 'sessions' }
  ]
};

export const goalPresetsForFocus = (focus: GoalFocus): readonly GoalFocusPreset[] =>
  presets[focus as keyof typeof presets] ?? presets.general;
