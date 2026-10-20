import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarPlus, Check, Info, ShieldAlert } from 'lucide-react';
import type { Goal } from './goals';
import type { PlannedActivity } from './plans';
import type { Injury } from './storage';
import type { DailyState } from './arc/dailyState';
import type { StateObservation } from './arc/stateHistory';
import { planGoalWeeks } from './arc/goalWeekPlanner';

type Props = {
  goal: Goal;
  planned: PlannedActivity[];
  states: DailyState[];
  history: StateObservation[];
  injuries: Injury[];
  onClose: () => void;
  onApply?: (plans: PlannedActivity[]) => void;
  onOpenCalendar?: () => void;
};
const dateLabel = (date: string) => new Date(date + 'T12:00:00')
  .toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export default function GoalSchedulePlanner({ goal, planned, states, history, injuries, onClose, onApply, onOpenCalendar }: Props) {
  const [weeks, setWeeks] = useState(2);
  const today = new Date().toLocaleDateString('en-CA');
  const result = useMemo(() => planGoalWeeks({
    goal, planned, today, weeks, states, history, injuries
  }), [goal, planned, today, weeks, states, history, injuries]);
  const [selected, setSelected] = useState<Set<string>>(() =>
    new Set(result.suggestions.filter(s => !s.needsReview).map(s => s.plan.id))
  );
  useEffect(() => {
    setSelected(new Set(result.suggestions.filter(s => !s.needsReview).map(s => s.plan.id)));
  }, [result]);
  const chosen = result.suggestions.filter(s => selected.has(s.plan.id)).map(s => s.plan);
  const reviewCount = result.suggestions.filter(s => s.needsReview).length;
  const add = () => {
    if (!chosen.length || !onApply) return;
    onApply(chosen);
    onClose();
    onOpenCalendar?.();
  };

  return <div className="goal-plan-modal">
    <section className="arc-week-planner" role="dialog" aria-modal="true" aria-labelledby="arc-week-planner-title">
      <span className="eyebrow">SMART WEEKLY PLANNER</span>
      <h2 id="arc-week-planner-title">Plan your supporting activities</h2>
      <p className="goal-plan-name">{goal.name}</p>
      <div className="goal-plan-horizon">
        <span className="eyebrow">PLAN AHEAD</span>
        <div role="group" aria-label="Planning horizon">
          {[1, 2, 4].map(n => <button key={n} type="button" aria-pressed={weeks === n}
            onClick={() => setWeeks(n)}>{n} {n === 1 ? 'week' : 'weeks'}</button>)}
        </div>
      </div>
      <p className="arc-week-planner-explain">Suggestions start today and follow Sunday–Saturday weekly targets. Existing goal-linked sessions count toward each target. Dates are suggestions only; no times are assumed.</p>
      <div className="goal-plan-status arc-week-planner-totals">
        <div><strong>{result.covered}</strong><span>already covered</span></div>
        <div><strong>{result.suggestions.length}</strong><span>suggested sessions</span></div>
        <div><strong>{result.unplaced}</strong><span>not placed</span></div>
      </div>
      {result.weeks.length > 0 && <div className="arc-week-planner-weeks" aria-label="Weekly target coverage">
        {result.weeks.map(week => <div key={week.start}>
          <b>{dateLabel(week.start)} – {dateLabel(week.end)}</b>
          <span>{week.covered} existing · {week.suggested} suggested · {week.required} target</span>
        </div>)}
      </div>}
      {reviewCount > 0 && <p className="arc-week-planner-review-note"><ShieldAlert size={16}/>
        {reviewCount} suggestion(s) need your review. They are unchecked by default.</p>}
      {result.notices.map((note, i) => <p key={i} className="arc-week-planner-notice"><Info size={15}/>{note}</p>)}
      {!goal.supportingTargets?.length && <p>There are no supporting targets for this goal yet. Edit the goal to add weekly activities.</p>}
      <div className="arc-week-planner-list" aria-label="Supporting activity schedule preview">
        {result.suggestions.map(s => <label key={s.plan.id} className={'arc-week-planner-item' + (s.needsReview ? ' needs-review' : '')}>
          <input type="checkbox" checked={selected.has(s.plan.id)}
            aria-label={'Include ' + s.plan.title + ' on ' + s.plan.date}
            onChange={e => setSelected(current => {
              const next = new Set(current);
              if (e.target.checked) next.add(s.plan.id);
              else next.delete(s.plan.id);
              return next;
            })}/>
          <span className="arc-week-planner-item-main">
            <b>{s.plan.title}</b>
            <small>{dateLabel(s.plan.date)} · {s.plan.type} · {s.plan.durationMinutes} min</small>
            <span>{s.reason}</span>
            {s.warnings.filter(w => w !== 'Recovery data is incomplete').map(w =>
              <small key={w} className="arc-week-planner-warning"><AlertTriangle size={13}/>{w}</small>
            )}
            {s.needsReview && <small className="arc-week-planner-warning">Review before including this session</small>}
          </span>
          {selected.has(s.plan.id) && <Check size={17} aria-hidden="true" className="arc-week-planner-check"/>}
        </label>)}
      </div>
      {result.suggestions.length === 0 && result.unplaced === 0 && goal.supportingTargets?.length
        ? <p className="arc-week-planner-empty">Your existing sessions cover the target, or there are no eligible dates in this window.</p>
        : null}
      <div className="goal-plan-actions arc-week-planner-actions">
        <button type="button" className="arc-ui-button arc-ui-button--quiet" onClick={onClose}>Not now</button>
        <div>
          {onOpenCalendar && <button type="button" className="arc-ui-button arc-ui-button--quiet"
            onClick={() => { onClose(); onOpenCalendar(); }}>Open Calendar</button>}
          {result.suggestions.length > 0 && <button type="button" className="arc-ui-button arc-ui-button--primary"
            disabled={!onApply || chosen.length === 0} onClick={add}>
            <CalendarPlus size={16}/>Add {chosen.length} to Calendar
          </button>}
        </div>
      </div>
    </section>
  </div>;
}
