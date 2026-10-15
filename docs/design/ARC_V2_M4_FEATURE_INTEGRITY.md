# Arc V2 — M4 Feature Integrity and Actionable Sessions

Status: **Recommended sequence approved for roadmap; implementation gated by checks**
Branch: `chore/v2-stabilization`
Prior milestone: M3 Frictionless UX — user accepted after 104 release tests passed.

## Product principle

**Focus → Goal → Supporting Program → Prescribed Session → Calendar → Today → Recorded Result → Progress**

A Calendar label such as “Mobility — 30 minutes” is not an executable workout. A user must know **what to do, why it matters, and which goal it supports** without leaving Today. Preserve the current lightweight scheduling option for activities that do not require a structured prescription.

## Recommended implementation order

### M4.1 — Medication integrity regression coverage (already committed, awaiting acceptance)
- Verify adding/editing medication, preserving identity, recording/undoing doses, persistence and Calendar/Today/You analytics consistency.
- Run release checks; fix failing assertions or actual regressions before proceeding.
- Existing commit: `f2937a6`.

### M4.2 — Actionable Session schema and prescription model
- Add optional typed session prescriptions to existing planned activities, rather than creating a second competing activity store.
- Support ordered movement blocks, exercise library references or custom movements, sets, repetitions, holds/duration, rest, notes, instruction/cues, and completion criteria.
- Preserve simple activities and backward compatibility with existing local data and backup/restore.
- Provide a useful initial Mobility prescription template, editable by the user; do not imply that generic templates are individualized medical advice.
- Acceptance: a Mobility session can specify exactly which movements to perform, with an unambiguous duration and completion rule.

### M4.3 — Program-to-Goal linking and frictionless assignment
- Link an existing program to one or more goals; allow a goal to be supported by multiple programs.
- Support choosing an existing program, creating a custom program, accepting a suggested template, or adding one-off sessions.
- Identify the Focus, Goal, and whether a session contributes to the primary target or supporting work.
- Show a preview of scheduled sessions, conflicts and duplicates before applying to Calendar.
- Do not duplicate programs or sessions when reassigning a goal.
- Acceptance: “Train BJJ Consistently” can be supported by BJJ classes and a BJJ Mobility & Recovery program without treating mobility as attendance.

### M4.4 — Today in-place session execution
- Up Next expands in Today and reveals the exact prescribed workout, rationale, linked Focus/Goal, and completion criteria.
- Support per-movement progress, start/resume/finish, recorded actuals, and editing the session in place (modal or expandable card). Never force navigation away from Today.
- Reuse existing activity editor, exercise library and workout tracking when possible.
- Preserve session identity and results across reloads.
- Acceptance: user can open Mobility Session A in Today, see all prescribed movements, perform/record them, and complete the session without navigating away.

### M4.5 — Goal contribution and progress integrity
- Separate **primary outcome progress**, **supporting session adherence**, and **program adherence**.
- A Mobility session supporting “Train BJJ Consistently” must NOT count as attending a BJJ class.
- Show a clear trace: Focus → Goal → Program → Session → completed result.
- Avoid double-counting linked activity records, including after rescheduling, editing, or reload.
- Acceptance: Progress reports BJJ attendance separately from completed mobility sessions and accurately explains the contribution of each.

### M4.6 — Core loop regression and release gate
- Add E2E tests for program assignment, prescription editing, Today session execution, reload persistence, Calendar synchronization, goal attribution, and backup/restore.
- Verify desktop and narrow viewport; accessibility and canonical Arc styling.
- Require all release tests and hands-on acceptance before moving to M5 responsive/device hardening.

## Scope and sequencing guardrails

- **M4 remains V2 work.** M5 mobile/responsive and M6 release candidate/pilot follow M4 acceptance.
- Do not expand V2 into a generic life operating system. Custom Focus Builder belongs to V3; Health & Human Development research belongs to V4.
- Reuse existing Arc models and UI. No separate backend is required for this milestone.
- The existing inline Up Next “View details” feature is an interim step, not a substitute for the complete M4.4 session execution flow.
- Implement each package in a reviewable commit, then ask for verification. Do not mark a work package complete merely because it is documented.
