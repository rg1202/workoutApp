# Arc V2 — M3.8 Controlled Pilot Readiness

Status: **In progress — not pilot-approved**
Source branch: `product/v2`
Staging: `https://arc-v2-staging.pages.dev` (owner-reported deployment)
Baseline release SHA: `7c58b58c2c0dd6a2a96c4820dc00680f685a97ba` (reconfirm deployment SHA in Cloudflare)

## Evidence received from owner

- Owner reports `npm ci` and `npm run check:release` passing on local `product/v2` at baseline SHA.
- Cloudflare Pages deployment success screen shown for `arc-v2-staging.pages.dev`.
- Cloudflare Pages settings screenshot confirms Git repository `rg1202/workoutApp`, production branch `product/v2`, build `npm run build`, output `dist`.
- Owner reports the primary staging hostname correctly prompts for Cloudflare Access login and the application works.
- Cloudflare Pages settings screenshot states **preview deployments are restricted by a Cloudflare Access policy**.
- **Not yet independently verified:** preview URL authentication, full core-loop step-by-step evidence, exact deployed SHA, response headers, browser console, separate-profile backup restore, rollback drill, support/privacy review.

## M3.8 gates (evidence required)

| Gate | Status | Acceptance evidence |
| --- | --- | --- |
| Local release check | Owner-reported pass | `npm ci`, `npm run check:release`, release SHA and clean tree |
| Static staging deployment | Owner-reported deployed | Cloudflare deployment ID, URL, deployed commit SHA |
| Primary Access protection | Owner-reported pass | Signed-out denied; owner email allowed |
| Preview Access protection | Enabled, untested | Test unique preview URL signed-out and authorized; check branch aliases and custom domains |
| Core-loop smoke | Owner reports application working; detailed audit pending | Goal → Calendar → Today → complete/skip → Progress; reload and edit |
| Browser data isolation | Pending | Separate browser profile has no shared goals |
| Backup and restore | Pending | Disposable export; restore in separate profile; validate restored goals/activities |
| Mobile/keyboard/zoom | Pending | Test common narrow viewport, tab order, 200% zoom |
| Headers/CSP/console | Pending | Confirm security headers on HTML and assets, no blocked critical resources |
| Integrations and secrets | Pending | Verify no public Strava server or credential exposure |
| Rollback | Pending | Roll back Pages deployment, verify code and preserve browser data; redeploy intended SHA |
| Trust/legal | Pending | Approve privacy notice, terms/support contact and actual analytics disclosures |
| Pilot owner sign-off | Pending | Document go/no-go, severity triage, tester instructions |

## Recommended execution

1. Record **Cloudflare deployment ID and exact deployed SHA** from Pages Deployments; compare with baseline SHA.
2. Confirm primary and preview Access rules by opening URLs signed out, then signing in as the allowed email. No real personal data until both paths are verified.
3. Execute `docs/release/V2_STAGING_SMOKE_CHECKLIST.md` with **disposable** data. Record pass/fail evidence; never paste private backup contents or tokens into issues.
4. Export a disposable backup, restore in a second clean browser profile, verify state. Understand that local storage is profile- and hostname-specific.
5. Run mobile/keyboard/zoom and network-console checks. Verify `_headers` on actual deployed responses, not only in `dist`.
6. Practice Pages deployment rollback and restore the intended deployment. A code rollback does **not** roll back local browser data.
7. Review `docs/release/V2_PRIVACY_NOTICE_DRAFT.md`, add actual support contact and hosting/analytics disclosures; do not claim completed legal review.
8. Pilot decision: only after P0/P1 blockers resolved, record owner sign-off and invite 5–10 opt-in testers using non-sensitive data.

## Stop / escalation rules

- **P0:** Access bypass, cross-user exposure, accidental public integration/secrets, or data loss from ordinary use: stop pilot.
- **P1:** Broken core workflow, missing backup/restore reliability, inaccessible primary navigation, or failed rollback/reproducibility: fix before public launch.
- **P2:** Minor copy/visual issues: document and triage.
- Do not interpret a successful deploy or passing automated tests as proof that all gates have passed.

## M3.9 and M3.10 handoff

- M3.9: Controlled 5–10 person pilot with opt-in, task completion, anonymous issue IDs and qualitative feedback; no sensitive personal data.
- M3.10: Review usability, early return engagement, defects and any multi-focus adoption; do not infer long-term retention or monetization from a small short pilot.
- M4.0: Separate explicit public-release go/no-go decision.
