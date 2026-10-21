import { Activity, AlertTriangle, ArrowRight, CalendarPlus, CheckCircle2, Target } from 'lucide-react';
import { goalProgress, type Goal } from './goals';
import type { PlannedActivity } from './plans';
import type { DailyState } from './arc/dailyState';
import { uniqueActivities } from './arc/uniqueActivities';
import { goalSignal } from './arc/goalIntelligence';
import { goalActivities, supportsGoal } from './arc/goalExecution';
import { goalExecutionEvidence } from './arc/goalExecutionEvidence';
import { goalProgressInsight } from './arc/goalProgressIntelligence';

const iso = (d: Date) => d.toLocaleDateString('en-CA');
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
const avg = (xs: (number | undefined)[]) => {
  const n = xs.filter((x): x is number => typeof x === 'number');
  return n.length ? Math.round(n.reduce((a, b) => a + b, 0) / n.length * 10) / 10 : null;
};

export default function ProgressLanding({
  goals, planned, dailyStates, onOpenAnalytics, onOpenGoals, onPlanGoal, selectedGoalId, onShowAllGoals, onFocusGoal
}: {
  goals: Goal[];
  planned: PlannedActivity[];
  dailyStates: DailyState[];
  onOpenAnalytics: () => void;
  onOpenGoals: () => void;
  onPlanGoal: (goalId: string) => void;
  selectedGoalId?: string | null;
  onShowAllGoals?: () => void;
  onFocusGoal?: (goalId: string) => void;
}) {
  const today = iso(new Date());
  const since = daysAgo(6);
  const recent = uniqueActivities(planned).filter(p => p.date >= since && p.date <= today && p.status !== 'Skipped');
  const completed = recent.filter(p => p.status === 'Completed');
  const rate = recent.length ? Math.round(completed.length / recent.length * 100) : null;
  const active = goals.filter(g => g.status === 'Active');
  const selectedGoal = active.find(g => g.id === selectedGoalId);
  const shownGoals = selectedGoal ? [selectedGoal] : active;
  const shownRecent = selectedGoal ? recent.filter(p => supportsGoal(p, selectedGoal.id)) : recent;
  const insights = shownGoals.map(goal => ({ goal, insight: goalProgressInsight(goal, planned, today) }));
  const priorities = insights.filter(x => x.insight.action !== 'none')
    .sort((a, b) => b.insight.priority - a.insight.priority || a.goal.name.localeCompare(b.goal.name))
    .slice(0, 2);
  const states = dailyStates.filter(s => s.date >= since);
  const quality = completed.filter(p => p.sessionResult);
  const good = quality.filter(p => p.sessionResult === 'Good' || p.sessionResult === 'Great').length;
  const recovery = completed.filter(p => p.recoveryBody === 'Concern' || p.recoveryBody === 'Sore' || p.recoveryNeed === 'High');
  const metrics = [
    ['Energy', avg(states.map(s => s.energy))],
    ['Motivation', avg(states.map(s => s.motivation))],
    ['Sleep', avg(states.map(s => s.sleepQuality))],
    ['Soreness', avg(states.map(s => s.soreness))]
  ] as const;

  return <div className="progress-v2">
    <header>
      <div>
        <span className="eyebrow">YOUR ARC</span>
        <h1>Progress</h1>
        <p>Are you moving toward your goals — and what is shaping your training?</p>
      </div>
      <button onClick={onOpenAnalytics}>Detailed analytics <ArrowRight size={15}/></button>
    </header>

    {selectedGoal && <section className="arc-progress-focus-context" aria-label="Focused goal progress"><span>Showing progress for <strong>{selectedGoal.name}</strong><small>Goal details and recent activities are filtered. Summary cards show all training.</small></span><button type="button" className="arc-ui-button arc-ui-button--quiet" onClick={onShowAllGoals}>Show all goals</button></section>}

    <section className="progress-snapshot">
      <article><span>7-DAY EXECUTION</span><strong>{rate === null ? '—' : rate + '%'}</strong><small>{completed.length} of {recent.length} planned sessions completed</small></article>
      <article><span>SESSION QUALITY</span><strong>{quality.length ? good + '/' + quality.length : '—'}</strong><small>{quality.length ? 'rated Good or Great' : 'No rated sessions yet'}</small></article>
      <article><span>RECOVERY FLAGS</span><strong>{recovery.length}</strong><small>{recovery.length ? 'sessions need attention' : 'No recent flags'}</small></article>
    </section>

    {shownGoals.length > 0 && <section className="arc-progress-next-moves" aria-label="Suggested next moves">
      <div className="arc-progress-next-heading"><span className="eyebrow">BASED ON RECORDED ACTIVITY</span><h2>Next moves</h2><small>Suggestions to review, not automatic schedule changes</small></div>
      {priorities.length ? <div className="arc-progress-next-list">{priorities.map(({ goal, insight }) =>
        <article key={goal.id} className="arc-progress-next-item">
          <div>
            <button type="button" className="arc-progress-next-goal" onClick={() => onFocusGoal?.(goal.id)} disabled={!onFocusGoal || Boolean(selectedGoal)}>{goal.name}</button>
            <strong>{insight.status}</strong>
            <p>{insight.nextMove}</p>
          </div>
          <button type="button" className="arc-ui-button arc-ui-button--quiet arc-progress-next-action"
            onClick={() => insight.action === 'review-recovery'
              ? document.getElementById('progress-recovery-signals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              : onPlanGoal(goal.id)}>
            {insight.action === 'review-recovery' ? 'Review recovery' : 'Plan activity'} <ArrowRight size={14}/>
          </button>
        </article>)}</div> :
        <p className="arc-progress-next-clear"><CheckCircle2 size={16}/> No immediate planning or recovery gaps identified from the available goal-linked records.</p>}
    </section>}

    <div className="progress-grid">
      <section className="builder-card progress-goals">
        <div className="overview-heading">
          <div><span className="eyebrow">DIRECTION + EXECUTION</span><h2>Goal movement</h2></div>
          <button onClick={onOpenGoals}>Goals</button>
        </div>
        {shownGoals.length ? <div className="arc-progress-goal-list">
          {shownGoals.map(g => {
            const outcome = goalProgress(g);
            const evidence = goalExecutionEvidence(g, planned, today);
            const insight = goalProgressInsight(g, planned, today);
            const peak = Math.max(1, ...insight.windows.map(w => w.completed));
            const signal = goalSignal(g, planned, today);
            const next = goalActivities(planned, g.id)
              .filter(p => p.status === 'Planned' && p.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))[0];
            return <article key={g.id} className="arc-progress-goal" data-goal-id={g.id}>
              <div className="arc-progress-goal-title">
                <Target size={16} aria-hidden="true"/>
                <div>
                  <b>{g.name}</b>
                  <small>{outcome === null ? 'Outcome: not yet measured' : outcome + '% toward outcome target'}</small>
                </div>
              </div>
              {outcome !== null && <div className="progress-track" role="progressbar" aria-label={g.name + ' outcome progress'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={outcome}><i style={{width: outcome + '%'}}/></div>}
              <div className="arc-progress-goal-execution">
                <div>
                  <span>THIS WEEK</span>
                  <strong>{signal.weeklyCompleted}{signal.weeklyTarget > 0 ? ' / ' + signal.weeklyTarget : ''}</strong>
                  <small>{signal.weeklyTarget > 0 ? 'supporting sessions completed' : 'sessions completed · no weekly target'}</small>
                </div>
                <div>
                  <span>EXECUTION SIGNAL</span>
                  <strong className="arc-progress-goal-direction">{signal.direction}</strong>
                  <small>{signal.explanation}</small>
                </div>
              </div>
              <div className="arc-progress-goal-evidence" aria-label={'Execution evidence for ' + g.name}>
                <div className="arc-progress-evidence-grid">
                  <div><span>LAST 7 DAYS</span><strong>{evidence.recentCompleted} {evidence.recentCompleted === 1 ? 'session' : 'sessions'}</strong><small>vs {evidence.previousCompleted} completed in the previous 7 days</small></div>
                  <div><span>RECORDED TRAINING TIME</span><strong>{evidence.measuredSessions ? evidence.measuredMinutes + ' min' : '—'}</strong><small>{evidence.measuredSessions} of {evidence.recentCompleted} recent completed sessions have actual duration</small></div>
                </div>
                {evidence.latestCompleted ? <p className="arc-progress-latest"><CheckCircle2 size={14} aria-hidden="true"/><span><b>Latest completed:</b> {evidence.latestCompleted.title} · {evidence.latestCompleted.date}{evidence.latestCompleted.sessionResult ? ' · Result: ' + evidence.latestCompleted.sessionResult : ''}</span></p> : <p className="arc-progress-latest arc-progress-latest--empty">No completed activities linked to this goal yet.</p>}
              </div>
              <div className="arc-progress-intelligence" aria-label={'Execution trend for ' + g.name}>
                <div className="arc-progress-intelligence-heading"><span>28-DAY EXECUTION</span><strong>{insight.trend}</strong></div>
                <div className="arc-progress-mini-chart" role="img" aria-label={insight.windows.map((w, i) => ['Oldest', 'Older', 'Previous', 'Recent'][i] + ' seven-day window, ' + w.start + ' to ' + w.end + ': ' + w.completed + ' completed').join('; ')}>
                  {insight.windows.map((w, i) => <div className="arc-progress-mini-week" key={w.start} title={w.start + ' to ' + w.end + ': ' + w.completed + ' completed' + (w.eligible ? '' : ' · target comparison unavailable for partial or pre-start window')}>
                    <span className="arc-progress-mini-bar-track"><i style={{height: Math.max(3, Math.round(w.completed / peak * 32)) + 'px'}}/></span>
                    <b>{w.completed}</b><small>{['W−3', 'W−2', 'Previous', 'Recent'][i]}</small>
                  </div>)}
                </div>
                <p><b>{insight.status}.</b> {insight.detail}</p>
                {insight.windowsMeetingTarget !== null && <small>{insight.eligibleWindowCount ? insight.windowsMeetingTarget + ' of ' + insight.eligibleWindowCount + ' complete seven-day windows met the matching-type target of ' + insight.targetPerWeek + ' sessions. Missing logs may affect this comparison.' : 'No complete seven-day window is available since the goal start date for a target comparison.'}</small>}
              </div>
              <p className="arc-progress-goal-next">{next ? 'Next: ' + next.title + ' · ' + next.date : 'No upcoming goal-linked activity scheduled'}</p>
              {insight.action === 'review-recovery' ? <button type="button" className="arc-ui-button arc-ui-button--quiet arc-progress-plan-action"
                onClick={() => document.getElementById('progress-recovery-signals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                aria-label={'Review recovery for ' + g.name}>
                <AlertTriangle size={15}/> Review recovery
              </button> : <button type="button" className="arc-ui-button arc-ui-button--quiet arc-progress-plan-action" onClick={() => onPlanGoal(g.id)} aria-label={'Plan activity for ' + g.name}>
                <CalendarPlus size={15}/> Plan next activity
              </button>}
            </article>;
          })}
        </div> : <div className="arc-progress-empty">
          <p>No active goals yet. Set a direction in Goals to connect your activity with meaningful progress.</p>
          <button type="button" onClick={onOpenGoals}>Create a goal <ArrowRight size={15}/></button>
        </div>}
        {active.length > 0 && <small className="arc-progress-goal-caveat">Outcome progress and supporting-session completion are separate measurements. Seven- and 28-day comparisons describe recorded activity, not changes in fitness or goal attainment. Actual training time appears only when recorded. Only Calendar activities explicitly linked to a goal contribute to its execution totals.</small>}
      </section>

      <section className="builder-card progress-state">
        <span className="eyebrow">7-DAY STATE</span><h2>How training has felt</h2>
        <div className="progress-state-grid">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><b>{value === null ? '—' : value + '/5'}</b></div>)}</div>
        <small>{states.length} daily state {states.length === 1 ? 'entry' : 'entries'} in this window</small>
      </section>

      <section id="progress-recovery-signals" className="builder-card progress-signals">
        <span className="eyebrow">SIGNALS</span><h2>What deserves attention</h2>
        {recovery.length ? recovery.slice(-3).reverse().map(p => <div className="progress-signal" key={p.id}>
          <AlertTriangle size={15}/><span><b>{p.title}</b><small>{[p.recoveryBody, p.recoveryNeed === 'High' ? 'High recovery need' : undefined, p.recoveryNote].filter(Boolean).join(' · ')}</small></span>
        </div>) : <div className="progress-clear"><CheckCircle2 size={17}/><span><b>No recovery flags</b><small>Recent completed sessions have no recorded soreness, concern, or high recovery need.</small></span></div>}
      </section>

      <section className="builder-card progress-recent">
        <span className="eyebrow">RECENT EXECUTION</span><h2>Plan → action</h2>
        {shownRecent.length ? shownRecent.slice(-5).reverse().map(p => {
          const linked = active.filter(g => supportsGoal(p, g.id)).map(g => g.name);
          return <div key={p.id}>
            <Activity size={14}/><span><b>{p.title}</b><small>{p.date}{p.sessionResult ? ' · ' + p.sessionResult : ''}{p.sessionEffort ? ' · effort ' + p.sessionEffort + '/5' : ''}{linked.length ? ' · Supports: ' + linked.join(', ') : ''}</small></span>
            <strong className={p.status === 'Completed' ? 'done' : ''}>{p.status}</strong>
          </div>;
        }) : <p>{selectedGoal ? 'No recent sessions linked to this goal. Plan a supporting activity to build its execution history.' : 'No planned sessions in the last 7 days. Add a goal and schedule supporting activities to start building your progress history.'}</p>}
      </section>
    </div>
  </div>;
}
