# Arc V2 — M3.8 Controlled Pilot Readiness

Status: **Accessibility gate passed (owner-reported); security/privacy gates remain — not pilot-approved**
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

## October 8, 2026 — owner validation update

- **Deployment:** Cloudflare Pages production shows `f02be50` active on `arc-v2-staging.pages.dev` (owner screenshot and confirmation).
- **Backup/restore:** Owner reports successful restore following avatar data-URL parser fix. Earlier restore failed on raw avatar data URL; fix commit `5921a03`, regression test commit `f02be50`.
- **Rollback drill:** Owner rolled back to a previous successful deployment, then returned to `f02be50`; verified goal, location and avatar still present. **Pass, owner-reported.**
- **Mobile:** Owner reports all seven mobile smoke checks passed. **Pass, owner-reported.**
- **Accessibility:** Owner completed 16/16 manual checks with pass and no observations, covering keyboard, zoom/reflow, forms, and Narrator/NVDA. **Manual accessibility gate passed; not a formal WCAG conformance audit.**
- **Remaining before pilot approval:** Independently confirm preview URL Access policy in signed-out session; verify live security headers/CSP and browser console; verify production artifact has no secrets or exposed integrations; confirm browser-profile isolation and full core-loop acceptance evidence; finalize privacy notice, support contact, tester consent and onboarding; record owner go/no-go.
- **Severity classification:** No accessibility P0/P1 issues reported. Prior avatar restore defect was a P1 pilot blocker, now owner-reported resolved. Security/privacy gates not yet cleared.

## October 8 — additional owner validation

- Preview Access: owner created a temporary non-production branch, confirmed Cloudflare preview deployment required authentication. **Pass, owner-reported.** Remove the temporary branch after confirming the test is complete.
- Browser console: owner reports clean console after removal of blocked Google Fonts import (commit `4951aa1`). **Pass, owner-reported.**
- Security headers: owner supplied deployed response screenshot showing CSP, nosniff, frame-denial, no-referrer and permissions policy. `Access-Control-Allow-Origin: *` also appeared; its source/necessity should be reviewed before public launch.
- Pilot model: **invitation-only**, target 5–10 people. Protocol in `docs/release/V2_INVITATION_ONLY_PILOT.md`.
- **Outstanding:** confirm no exposed secrets/integrations in built artifact; review/finalize pilot privacy notice (including hosting logs, weather/geocoding requests, retention and effective date); confirm participant consent/onboarding and owner sign-off. No invitations authorized yet.

## October 8 — backup export blocker resolved (owner verification)

- Two Playwright backup-export tests initially failed because the sidebar backup button was outside the viewport and could not be clicked.
- Desktop sidebar overflow fix committed as `91a4d8c`; it preserves the button interaction rather than bypassing it in tests.
- Owner reports **both targeted tests and the full release suite passed** after pulling the fix. Exact full-suite counts were not supplied in this confirmation; do not invent them.
- Automated release check gate: **PASS (owner-reported)**. Manual shorter-desktop viewport verification remains recommended.
- Remaining before pilot invitation: production artifact/secrets review beyond the existing narrow scripted check, privacy notice finalization, tester consent/onboarding, and explicit go/no-go signoff.

## October 8 — expanded artifact scan (owner output)

- Owner pulled commit `9ba7472` and ran `npm run check:staging`.
- Vite/TypeScript production build: **PASS** (1955 modules transformed).
- Expanded `check:artifact`: **PASS**, output `Production artifact check passed (heuristic scan; not a guarantee of no secrets).`
- Build warnings: Lucide module-level `use client` directive and oversized JS chunk (approximately 844 kB uncompressed); nonblocking but track performance.
- Pasted console output ends before the standalone `check-staging-output.mjs` result. **Do not mark full check:staging verified until process exit/status is confirmed.**
- Repository review: production integrations panel hides local Strava server flow when `import.meta.env.DEV` is false. Verify deployed behavior as part of pilot signoff.

## October 8 — staging check final confirmation

- Owner confirms PowerShell `$LASTEXITCODE` returned **0** immediately after `npm run check:staging`.
- Full staging script **PASS (owner-reported)**: TypeScript/Vite build, expanded production artifact heuristic scan, and `check-staging-output.mjs` header/distribution validation.
- This verifies locally built artifacts and configuration, not the exact deployed Cloudflare SHA or third-party processing disclosures.
- Remaining: privacy/analytics disclosure verification, deployed SHA and live behavior check, explicit pilot go/no-go.

## October 8 — Cloudflare Web Analytics CSP verification

- Owner enabled Cloudflare Web Analytics for `arc-v2-staging.pages.dev` and observed injected `beacon.min.js` blocked by CSP.
- Owner committed CSP allowlist changes locally and pushed to `product/v2`; push advanced remote branch to `93a3bd8`.
- Subsequent Chrome DevTools Network screenshot shows `beacon.min.js` **HTTP 200**, initiator `(index):14`, confirming the deployed script now loads. **PASS: analytics script loading.**
- The screenshot does **not** show a successful analytics reporting POST or nonzero dashboard metrics. Reporting/collection remains to be verified separately.
- Privacy draft discloses enabled analytics; final approval, retention and tester onboarding still pending.

## October 8 — analytics endpoint response

- Owner DevTools screenshot filtered to `/cdn-cgi/rum` shows an XHR request with **HTTP 204**. Endpoint responded successfully.
- Initiator appears as `VM148 activeContentBlocker.js:1`, not the Cloudflare beacon; do not attribute this request conclusively to the Arc analytics script or assert recorded visits based solely on this screenshot.
- Combined evidence: Cloudflare Web Analytics site enabled; `beacon.min.js` HTTP 200 after CSP update; RUM endpoint HTTP 204. Analytics CSP incident resolved; dashboard metrics and precise collection behavior can be verified separately.

## October 8 — pilot acknowledgment release regression verification

- Owner confirms full `npm run check:release` **PASS** after production smoke compatibility fix `8cfde0d`.
- Development E2E: **104 passed**; production E2E: **2 passed**; total **106 passed**, owner-reported. No failures reported in final run.
- Pilot first-use acknowledgment tests passed in prior run; backup restore and production smoke were updated to explicitly acknowledge the notice before app navigation.
- Automated release gate: **PASS**. Still pending: owner approval of notice wording/effective date and retention disclosures, deployment SHA/live first-use smoke, and explicit go/no-go before adding pilot testers to Cloudflare Access.

## October 8 — owner conditional privacy approval

Owner approves the current Arc V2 pilot notice wording **subject to effective date and Cloudflare retention verification**. This is not unconditional privacy sign-off or pilot GO. Keep Cloudflare Access owner-only pending confirmation of the effective date, retention disclosures, live deployment and explicit invitation authorization.

## October 8 — effective date approved

Owner approved **October 8, 2026** as the Arc V2 pilot privacy notice effective date. This resolves the date gate, but Cloudflare retention verification, live deployment/first-use smoke, and final explicit GO authorization remain pending. Cloudflare Access allowlist must not be expanded before GO.
