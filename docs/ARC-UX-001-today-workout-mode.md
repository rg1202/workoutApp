# ARC-UX-001 — Today Overview and Immersive Workout Mode

Status: approved design direction; implementation in vertical slices. No merge or deployment authorized.

## Product contract

**Today** is the daily orientation and decision surface. **Workout Mode** is a contextual, immersive execution surface entered from Today or Calendar. **Session Summary** is the review/confirmation surface. Calendar, Goals, History, and Progress remain the existing sources and destinations.

Approved decisions: collapsible exercise cards (current exercise expanded), immersive Workout Mode, balanced Today density (prominent Up Next, compact remaining activities).

## Repository findings (feature/arc-core-001-session-linkage)

- `src/Root.tsx`: `Dashboard` is the existing Today overview; `Today` is currently the strength execution tab inside `src/App.tsx`. These labels are a source of conceptual overlap.
- `src/TrainingOverview.tsx`: existing daily overview, goals, planned activity and Up Next actions. Reuse and reorganize; do not create another daily data source.
- `src/CalendarPanel.tsx`: launches program-generated strength sessions using stable plan IDs.
- `src/App.tsx`: existing strength logger, exercise history, substitutions, workout notes, timer, completion/partial outcome, pause/resume/abandon controls. Its large combined component is a presentation refactor candidate, not a second engine.
- `src/arc/strengthWorkoutDraft.ts`: session-keyed draft persistence. `src/arc/activeStrengthPlan.ts`: selected plan identity.
- `src/programSync.ts`, `src/planMatching.ts`, `src/arc/reconcileStrengthPlans.ts`: plan reconciliation and history identity. Preserve compatibility with legacy records and partial outcomes.

## Screen specification

### Today Overview (existing Dashboard route)
1. Orientation: date, concise direction/readiness, and no exercise log controls.
2. Up Next: one dominant next action with title, focus, duration, status, and Start/Resume/View results as appropriate.
3. Today's schedule: compact other activities; expand details on demand.
4. Secondary insights: progressive disclosure; avoid multiple competing hero cards.
5. Empty state: direct path to Calendar or Programs, no invented training prescription.

### Workout Mode (contextual route, not sidebar tab)
1. Return to Today with draft preserved; persistent workout name, program/week/day and lifecycle status.
2. Compact prescribed-versus-logged progress, not a dashboard of unrelated metrics.
3. Exercise cards: one active card expanded; all exercises available out of order, never require sequential completion.
4. Inside card: editable sets, substitution, last performance, notes. Hide supporting details until requested.
5. Session actions: Pause/Resume, Finish, Finish early, Abandon; destructive action confirms.
6. Completion requires an explicit plan identity when launched from Calendar. No silent reassignment of a stale selection.

### Session Summary
Show completed/partial outcome, logged sets vs prescription, duration and notes; link back to Today, Calendar and History. Never infer a full completion from a partial result.

## Navigation contract

`TodayOverview -> WorkoutMode -> SessionSummary -> TodayOverview`.
Calendar may also open Workout Mode; Return to Today is the canonical exit. Switching between planned sessions must isolate drafts. Repeat is an explicit new attempt, not implicit relaunch.

The existing `Dashboard` and `Today` internal route names must be migrated deliberately, preserving existing deep navigation and tab behavior until replacement is tested. Workout Mode must not become a permanent sidebar item.

## State and data ownership

- Planned activity: `PlannedActivity.id` and `programId` (existing store).
- Active selection: `ActiveStrengthPlan` (existing local storage).
- Draft: `strengthDraftKey(planId)`, isolated per planned session.
- Completed record: `SessionRecord.id`, `plannedActivityId`, `outcome`.
- UI-only expanded card / view state: transient, never part of recorded workout results.
- Pause is a draft state. Partial and Completed are recorded outcomes. Abandon deletes only the active draft and leaves the plan incomplete.

## Implementation phases

1. **Foundation (this increment)**: inspect existing routes and stores, publish this spec, define typed navigation/lifecycle contracts and unit tests. No disruptive screen replacement.
2. **Today composition**: refactor existing TrainingOverview into orientation, Up Next, compact schedule and secondary insights; test action resolution and responsive hierarchy.
3. **Immersive Workout Mode**: contextual route and shell, exercise cards with one expanded by default, preserve all existing set and substitution interactions, session-specific drafts, back navigation.
4. **Session Summary**: recorded outcomes and prescription comparison, explicit completion, links to Today/Calendar/History; avoid duplicate history.
5. **Hardening**: browser E2E start/resume/refresh/switch/partial/abandon/repeat, keyboard and screen-reader checks, mobile visual review, existing suite regression.

## Acceptance gates

- Today has one clear primary action; no workout logger on the overview.
- Workout Mode is visually and navigationally distinct, but uses the same stores and logger.
- Out-of-order exercise logging works; secondary details collapse.
- Refresh, navigation and switching sessions do not lose or cross-contaminate drafts.
- Finish, partial, abandon and repeat yield correct, non-duplicated history and Calendar/Progress results.
- Existing programs, goals, planned activities and legacy history remain compatible.
- Build, Playwright, and manual mobile/desktop inspection pass before proposing merge.

## Explicit non-goals

No new backend, duplicate workout engine, new permanent nav tab, redesign of Goals/Calendar/Progress, speculative AI coaching, launch deadline, merge or deployment.
