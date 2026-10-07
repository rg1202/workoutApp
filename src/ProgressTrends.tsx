import type { DailyState } from './arc/dailyState';
import type { PlannedActivity } from './plans';

const dimensions = [
  ['Energy', 'energy'],
  ['Sleep quality', 'sleepQuality'],
  ['Soreness', 'soreness'],
  ['Stress', 'stress'],
] as const;

function dateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toLocaleDateString('en-CA');
}

type Props = { states: DailyState[]; plans: PlannedActivity[] };

export default function ProgressTrends({ states, plans }: Props) {
  const dates = Array.from({ length: 14 }, (_, i) => dateDaysAgo(13 - i));
  const byDate = new Map(states.map((state) => [state.date, state]));
  const completed = plans.filter((plan) => plan.status === 'Completed' && dates.includes(plan.date));
  const rated = completed.filter((plan) => plan.sessionEffort !== undefined);
  const effort = rated.length
    ? (rated.reduce((total, plan) => total + (plan.sessionEffort ?? 0), 0) / rated.length).toFixed(1)
    : null;

  const average = (selectedDates: string[], field: keyof DailyState): number | null => {
    const values = selectedDates
      .map((date) => byDate.get(date)?.[field])
      .filter((value): value is number => typeof value === 'number');
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
  };

  return (
    <section className="builder-card arc-progress-trends">
      <div>
        <span className="eyebrow">STATE + TRAINING · 14 DAYS</span>
        <h2>Patterns over time</h2>
        <p>Daily ratings and completed sessions, aligned by date. Blank days are missing data.</p>
      </div>
      <div className="arc-trend-grid">
        {dimensions.map(([label, field]) => {
          const previous = average(dates.slice(0, 7), field);
          const current = average(dates.slice(7), field);
          const delta = previous !== null && current !== null ? current - previous : null;
          return (
            <article key={field}>
              <div className="arc-trend-heading">
                <b>{label}</b>
                <span>
                  {current === null ? 'No recent data' : current.toFixed(1) + '/5'}
                  {delta !== null ? ' · ' + (delta > 0 ? '+' : '') + delta.toFixed(1) + ' vs prior 7d' : ''}
                </span>
              </div>
              <div className="arc-trend-bars" aria-label={label + ' ratings over 14 days'}>
                {dates.map((date) => {
                  const value = byDate.get(date)?.[field];
                  return (
                    <div
                      key={date}
                      title={date + ': ' + (typeof value === 'number' ? value + '/5' : 'Not logged')}
                      className="arc-trend-day"
                    >
                      {typeof value === 'number' && <i style={{ height: (value / 5) * 100 + '%' }} />}
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
      <div className="arc-trend-activity">
        <b>Training alongside state</b>
        <span>
          {completed.length} completed sessions over 14 days · {rated.length} with effort recorded
          {effort ? ' · average effort ' + effort + '/5' : ''}
        </span>
        <div className="arc-trend-ticks">
          {dates.map((date) => (
            <span
              key={date}
              title={date + ': ' + completed.filter((plan) => plan.date === date).length + ' completed'}
              className={completed.some((plan) => plan.date === date) ? 'active' : ''}
            />
          ))}
        </div>
      </div>
      <p className="arc-progress-source">
        These are descriptive comparisons, not causal conclusions. A change in soreness or stress
        does not establish that training caused it. At least one logged rating in each week is
        needed for a comparison.
      </p>
    </section>
  );
}
