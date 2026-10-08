# Arc V2 — external pilot protocol

Status: planning only; no pilot participants recruited.

## Pilot boundaries

Use a static HTTPS staging site, with the Strava development server excluded. Start with a small opt-in group using non-sensitive or disposable test data. Do not ask testers to enter medical, intimate, or other sensitive information during the first pilot. Explain that Arc stores data in the browser and has no cloud sync.

## Participant tasks

1. Start with a fresh browser profile and create one goal for BJJ, Running, or Cycling.
2. Plan an activity on Calendar and find it on Today.
3. Complete or skip the activity, then inspect Progress.
4. Reload, navigate between Focuses, and verify saved changes persist.
5. Export a backup, then restore it only into a separate disposable test profile.
6. Try a narrow mobile viewport, keyboard-only navigation and browser zoom.
7. Report confusion, inaccessible controls, missing progress, failed persistence or unexpected requests for personal information.

## Feedback record

Record anonymous participant ID, device/browser, build SHA, task completed (yes/no), severity (P0/P1/P2), reproduction steps, expected vs actual result, screenshot only with consent, and fix owner. Avoid collecting exported backup files or actual activity histories.

## Go/no-go

P0: any credible cross-user data exposure, unrecoverable data loss caused by ordinary app operation, or unsafe integration exposure. Block release.
P1: a broken core Goals → Calendar → Today → Activity → Progress workflow, inaccessible primary navigation, or non-reproducible builds. Fix before general release.
P2: minor presentation and copy defects. May defer with an explicit decision.

A pilot passes only after release SHA, successful staging smoke tests, privacy/support review, feedback triage and documented owner sign-off.
