# Arc V2 — M3 Frictionless UX

Status: **In progress; M2 user-reported checks passed**
Branch: `chore/v2-stabilization`

## Objective
Reduce friction in the core loop: **Goals → Calendar → Today → Activity → Progress**. Preserve source data, goal associations, completion semantics, and keyboard accessibility.

## Work packages (in order)

1. **M3.1 Today execution:** One-click completion with a visible reversible action, immediate state update, and easy access to actuals. Do not confuse completed training with BJJ attendance-based adherence.
2. **M3.2 Calendar planning:** Minimize steps to add, edit, reschedule, and link a goal. Keep Day/Week/Month controls predictable.
3. **M3.3 Goal-to-plan flow:** Make it obvious how each goal produces actionable calendar entries; prevent duplicate plan generation.
4. **M3.4 Progress feedback:** Completion and logged results should immediately affect meaningful progress indicators; clearly distinguish missing data from zero.
5. **M3.5 Cross-screen continuity:** Preserve context and selected item when navigating between Goals, Calendar, Today, and Progress.
6. **M3.6 Medication routine:** Keep recurring dose completion separate from workouts; ensure Calendar visibility is presentation-only and never alters dose logs.

## Acceptance gates

- Each primary action is discoverable, keyboard operable, and gives immediate visible feedback.
- Completion is reversible without searching through another screen.
- Editing or navigating does not silently change activity identity, date, goal links, or completion state.
- No duplicate dose or activity completion records on repeated clicks.
- Existing release checks pass and new interaction regression tests cover each modified flow.
- Verify desktop and narrow viewport for every modified surface; full device acceptance remains M5.

## Implementation discipline

Use existing canonical Arc tokens and controls. Prefer incremental changes with a separate reviewable commit and user verification for each work package. Do not mark M3 complete from a passing build alone: require hands-on flow acceptance.
