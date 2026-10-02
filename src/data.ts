export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  group: string;
  movement: string;
  equipment: 'Free Weight' | 'Machine' | 'Bodyweight';
  goals: ('Hypertrophy' | 'Strength' | 'Endurance')[];
};

export const exercises: Exercise[] = [
  { id: 'back-squat', name: 'Barbell Back Squat', muscle: 'Quadriceps', group: 'Legs', movement: 'Squat', equipment: 'Free Weight', goals: ['Strength', 'Hypertrophy'] },
  { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstrings', group: 'Legs', movement: 'Hip Hinge', equipment: 'Free Weight', goals: ['Strength', 'Hypertrophy'] },
  { id: 'leg-press', name: 'Leg Press', muscle: 'Quadriceps', group: 'Legs', movement: 'Squat', equipment: 'Machine', goals: ['Hypertrophy', 'Strength'] },
  { id: 'leg-curl', name: 'Seated Leg Curl', muscle: 'Hamstrings', group: 'Legs', movement: 'Knee Flexion', equipment: 'Machine', goals: ['Hypertrophy', 'Endurance'] },
  { id: 'bench', name: 'Barbell Bench Press', muscle: 'Chest', group: 'Upper Body', movement: 'Horizontal Push', equipment: 'Free Weight', goals: ['Strength', 'Hypertrophy'] },
  { id: 'db-row', name: 'Dumbbell Row', muscle: 'Back', group: 'Upper Body', movement: 'Horizontal Pull', equipment: 'Free Weight', goals: ['Hypertrophy', 'Strength'] },
  { id: 'pulldown', name: 'Lat Pulldown', muscle: 'Lats', group: 'Upper Body', movement: 'Vertical Pull', equipment: 'Machine', goals: ['Hypertrophy', 'Endurance'] },
  { id: 'pullup', name: 'Pull-Up', muscle: 'Lats', group: 'Upper Body', movement: 'Vertical Pull', equipment: 'Bodyweight', goals: ['Strength', 'Hypertrophy', 'Endurance'] },
  { id: 'curl', name: 'Dumbbell Curl', muscle: 'Biceps', group: 'Arms', movement: 'Elbow Flexion', equipment: 'Free Weight', goals: ['Hypertrophy'] },
  { id: 'dip', name: 'Dip', muscle: 'Triceps', group: 'Arms', movement: 'Press', equipment: 'Bodyweight', goals: ['Strength', 'Hypertrophy'] },
];