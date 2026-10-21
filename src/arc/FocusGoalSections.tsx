import { useState, type ReactNode } from 'react';
import { Archive, ChevronDown, Layers3, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Goal } from '../goals';
import type { GoalFocus } from './goalsV2';
import { focusRegistry, type FocusId } from './focusRegistry';

type SectionId = FocusId | 'general' | 'other';
type FocusSection = {
  id: SectionId;
  title: string;
  description: string;
  Icon: LucideIcon;
  goals: Goal[];
};

const priorityRank: Record<string, number> = { Primary: 0, Supporting: 1, Maintenance: 2 };
/** Resolve old records without rewriting them. Ambiguous goals stay shared. */
export function goalSectionId(goal: Goal): SectionId {
  if (goal.focus) {
    if (goal.focus === 'general') return 'general';
    // Keep the original Focus association even when that Focus is removed or defocused.
    // Visibility is handled by the current user selection, never by rewriting goal data.
    return focusRegistry.some(focus => focus.id === goal.focus) ? goal.focus as FocusId : 'other';
  }
  if (goal.type === 'BJJ') return 'bjj';
  if (goal.type === 'Cardio') {
    const context = [goal.activity, goal.sport, goal.name].filter(Boolean).join(' ');
    if (/cycl|bike|rid(e|ing)/i.test(context)) return 'cycling';
    if (/run|jog|marathon|5k|10k/i.test(context)) return 'running';
  }
  return 'general';
}

const sortGoals = (goals: Goal[]) => [...goals].sort((a, b) =>
  (priorityRank[a.priority ?? 'Primary'] ?? 3) - (priorityRank[b.priority ?? 'Primary'] ?? 3) ||
  (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31') ||
  a.name.localeCompare(b.name)
);

export default function FocusGoalSections({
  goals, visibleFocuses, onCreate, renderGoal
}: {
  goals: Goal[];
  visibleFocuses: FocusId[];
  onCreate: (focus: GoalFocus) => void;
  renderGoal: (goal: Goal) => ReactNode;
}) {
  const [expanded, setExpanded] = useState<Partial<Record<SectionId, boolean>>>({});
  const active = goals.filter(goal => goal.status === 'Active');
  const groups = new Map<SectionId, Goal[]>();
  active.forEach(goal => {
    const id = goalSectionId(goal);
    groups.set(id, [...(groups.get(id) ?? []), goal]);
  });

  // Use exactly the Focuses visible in the user's sidebar, not the static MVP registry.
  const visibleIds = new Set(visibleFocuses);
  const sections: FocusSection[] = [
    ...focusRegistry.filter(focus => visibleIds.has(focus.id)).map(focus => ({
      id: focus.id as SectionId,
      title: focus.name,
      description: focus.connection ?? focus.description,
      Icon: focus.icon,
      goals: sortGoals(groups.get(focus.id as SectionId) ?? [])
    })),
    {
      id: 'general',
      title: 'Shared goals',
      description: 'Goals that support your overall active life or multiple focuses.',
      Icon: Layers3,
      goals: sortGoals(groups.get('general') ?? [])
    },
    ...(groups.get('other')?.length ? [{
      id: 'other' as const,
      title: 'Other goals',
      description: 'Existing goals from other focus areas are kept intact.',
      Icon: Archive,
      goals: sortGoals(groups.get('other') ?? [])
    }] : [])
  ];

  const visibleGoalCount = sections.reduce((count, section) => count + section.goals.length, 0);

  return (
    <div className="arc-focus-goals">
      <div className="arc-focus-goals-overview">
        <div>
          <span className="eyebrow">YOUR FOCUSES</span>
          <h2>Goals by Focus</h2>
          <p>Choose a focus to see its goals, supporting actions, and next steps.</p>
        </div>
        <div className="arc-focus-goals-total">
          <strong>{visibleGoalCount}</strong>
          <span>active {visibleGoalCount === 1 ? 'goal' : 'goals'}</span>
        </div>
      </div>
      {sections.map(section => {
        const isExpanded = expanded[section.id] ?? section.goals.length > 0;
        const contentId = 'arc-goal-focus-' + section.id;
        const regionName = section.id === 'general' || section.id === 'other' ? section.title : section.title + ' goals';
        const Icon = section.Icon;
        return (
          <section key={section.id} className="arc-goal-focus-section"
            aria-label={regionName} data-focus={section.id}>
            <div className="arc-goal-focus-header">
              <button type="button" className="arc-goal-focus-toggle"
                aria-label={'Toggle ' + regionName}
                aria-controls={contentId} aria-expanded={isExpanded}
                onClick={() => setExpanded(current => ({ ...current, [section.id]: !isExpanded }))}>
                <span className="arc-goal-focus-icon"><Icon size={21} aria-hidden="true"/></span>
                <span className="arc-goal-focus-heading">
                  <span className="arc-goal-focus-title">{section.title}</span>
                  <span className="arc-goal-focus-description">{section.description}</span>
                </span>
                <span className="arc-goal-focus-count">{section.goals.length} {section.goals.length === 1 ? 'goal' : 'goals'}</span>
                <ChevronDown size={19} className={isExpanded ? 'arc-goal-focus-chevron is-open' : 'arc-goal-focus-chevron'} aria-hidden="true"/>
              </button>
              {section.id !== 'other' && <button type="button"
                className="arc-ui-button arc-ui-button--quiet arc-goal-focus-add"
                aria-label={section.id === 'general' ? 'Add shared goal' : 'Add ' + section.title + ' goal'}
                onClick={() => {
                  setExpanded(current => ({ ...current, [section.id]: true }));
                  onCreate(section.id as GoalFocus);
                }}>
                <Plus size={15}/> Add goal
              </button>}
            </div>
            {isExpanded && <div id={contentId} className="arc-goal-focus-content">
              {section.goals.length > 0
                ? <div className="goal-grid">{section.goals.map(goal => <div key={goal.id} className="arc-goal-focus-card">{renderGoal(goal)}</div>)}</div>
                : <p className="arc-goal-focus-empty">No active goals here yet. Add one when you're ready to build this part of your Arc.</p>}
            </div>}
          </section>
        );
      })}
    </div>
  );
}
