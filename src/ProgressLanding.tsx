import { Activity, AlertTriangle, ArrowRight, CalendarPlus, CheckCircle2, Target } from 'lucide-react';
import { goalProgress, type Goal } from './goals';
import type { PlannedActivity } from './plans';
import type { DailyState } from './arc/dailyState';
import { uniqueActivities } from './arc/uniqueActivities';
import { goalSignal } from './arc/goalIntelligence';
import { goalActivities, supportsGoal } from './arc/goalExecution';

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
  goals, planned, dailyStates, onOpenAnalytics, onOpenGoals, onPlanGoal
}: {
  goals: Goal[];
  planned: PlannedActivity[];
  dailyStates: DailyState[];
  onOpenAnalytics: () => void;
  onOpenGoals: () => void;
  onPlanGoal: (goalId: string) => void;
}) {
  const today = iso(new Date());
  const since = daysAgo(6);
  const recent = uniqueActivities(planned).filter(p => p.date >= since && p.date <= today && p.status !== 'Skipped');
  const completed = recent.filter(p => p.status === 'Completed');
  const rate = recent.length ? Math.round(completed.length / recent.length * 100) : null;
  const active = goals.filter(g => g.status === 'Active');
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

    <section className="progress-snapshot">
      <article><span>7-DAY EXECUTION</span><strong>{rate === null ? '—' : rate + '%'}</strong><small>{completed.length} of {recent.length} planned sessions completed</small></article>
      <article><span>SESSION QUALITY</span><strong>{quality.length ? good + '/' + quality.length : '—'}</strong><small>{quality.length ? 'rated Good or Great' : 'No rated sessions yet'}</small></article>
      <article><span>RECOVERY FLAGS</span><strong>{recovery.length}</strong><small>{recovery.length ? 'sessions need attention' : 'No recent flags'}</small></article>
    </section>

    <div className="progress-grid">
      <section className="builder-card progress-goals">
        <div className="overview-heading">
          <div><span className="eyebrow">DIRECTION + EXECUTION</span><h2>Goal movement</h2></div>
          <button onClick={onOpenGoals}>Goals</button>
        </div>
        {active.length ? <div className="arc-progress-goal-list">
          {active.map(g => {
            const outcome = goalProgress(g);
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
              <p className="arc-progress-goal-next">{next ? 'Next: ' + next.title + ' · ' + next.date : 'No upcoming goal-linked activity scheduled'}</p>
              <button type="button" className="arc-ui-button arc-ui-button--quiet arc-progress-plan-action" onClick={() => onPlanGoal(g.id)} aria-label={'Plan activity for ' + g.name}>
                <CalendarPlus size={15}/> Plan next activity
              </button>
            </article>;
          })}
        </div> : <div className="arc-progress-empty">
          <p>No active goals yet. Set a direction in Goals to connect your activity with meaningful progress.</p>
          <button type="button" onClick={onOpenGoals}>Create a goal <ArrowRight size={15}/></button>
        </div>}
        {active.length > 0 && <small className="arc-progress-goal-caveat">Outcome progress and supporting-session completion are separate measurements. Only Calendar activities explicitly linked to a goal contribute to its execution totals.</small>}
      </section>

      <section className="builder-card progress-state">
        <span className="eyebrow">7-DAY STATE</span><h2>How training has felt</h2>
        <div className="progress-state-grid">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><b>{value === null ? '—' : value + '/5'}</b></div>)}</div>
        <small>{states.length} daily state {states.length === 1 ? 'entry' : 'entries'} in this window</small>
      </section>

      <section className="builder-card progress-signals">
        <span className="eyebrow">SIGNALS</span><h2>What deserves attention</h2>
        {recovery.length ? recovery.slice(-3).reverse().map(p => <div className="progress-signal" key={p.id}>
          <AlertTriangle size={15}/><span><b>{p.title}</b><small>{[p.recoveryBody, p.recoveryNeed === 'High' ? 'High recovery need' : undefined, p.recoveryNote].filter(Boolean).join(' · ')}</small></span>
        </div>) : <div className="progress-clear"><CheckCircle2 size={17}/><span><b>No recovery flags</b><small>Recent completed sessions have no recorded soreness, concern, or high recovery need.</small></span></div>}
      </section>

      <section className="builder-card progress-recent">
        <span className="eyebrow">RECENT EXECUTION</span><h2>Plan → action</h2>
        {recent.length ? recent.slice(-5).reverse().map(p => {
          const linked = active.filter(g => supportsGoal(p, g.id)).map(g => g.name);
          return <div key={p.id}>
            <Activity size={14}/><span><b>{p.title}</b><small>{p.date}{p.sessionResult ? ' · ' + p.sessionResult : ''}{p.sessionEffort ? ' · effort ' + p.sessionEffort + '/5' : ''}{linked.length ? ' · Supports: ' + linked.join(', ') : ''}</small></span>
            <strong className={p.status === 'Completed' ? 'done' : ''}>{p.status}</strong>
          </div>;
        }) : <p>No planned sessions in the last 7 days. Add a goal and schedule supporting activities to start building your progress history.</p>}
      </section>
    </div>
  </div>;
}
