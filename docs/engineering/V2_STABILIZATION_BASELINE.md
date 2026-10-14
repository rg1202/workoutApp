# Arc V2 — Stabilization Baseline & Mobile Quality Gate
Date: 2026-10-14
Status: **Local baseline verified by owner; cleanup and mobile acceptance pending**
Working branch: `chore/v2-stabilization` (forked from `product/v2`)
Scope: **No new V3/V4 features; protect existing user data and V2 behavior.**

## Verified repository observations

1. Repository has three visible branches: `main`, `build/mvp`, `product/v2`. The stabilization branch was created specifically for this work.
2. GitHub compare: `product/v2` is **528 commits ahead of `build/mvp`**, with no commits behind it.
3. GitHub compare: `product/v2` and `main` have **diverged**: V2 is **976 ahead / 1 behind**. **Do not blindly merge or reset either branch.** Review the one main-only commit and deployment branch configuration before synchronization.
4. `src/styles.css` is approximately **199 KB** and **1,130 physical lines**, including many compressed declarations and later overrides. `src/arc/design-system.css` adds approximately **18.6 KB** of canonical tokens/rules. The design-system document explicitly describes migration as incomplete. CSS consolidation is a priority, but requires visual regression evidence.
5. `src/Root.tsx` (~20 KB), `src/App.tsx`, `src/GoalsPanel.tsx`, and `src/CalendarPanel.tsx` deserve component-boundary and accessibility review; file size alone does not establish a defect.
6. `src/arc/TodayWeather.tsx` exists and uses a stored location key. Weather visual overrides exist in `src/styles.css`. Test the actual mobile card before further styling.
7. `package.json` provides `build`, `check:staging`, `check:release`, `test:production`, and Playwright tests.
8. `docs/release/V2_M3_8_PILOT_READINESS.md` says the controlled pilot is **not approved** because security/privacy gates remain. It records owner-reported Cloudflare staging and access protection, with independent verification still pending.
9. The last owner-reported regression in the project conversation was **104/104 Playwright tests passing**, *before* the latest Calendar/weather commits. **Current CI, build, device UX and deployment state have not been verified during this audit.**

## Work backlog (order of execution)

| ID | Priority | Work | Acceptance criteria |
| --- | --- | --- | --- |
| STAB-01 | P0 | Freeze scope, capture SHA and baseline | Record `git status`, `git log -1`, clean install, build, test, release checks; preserve any local changes |
| STAB-02 | P0 | Reconcile Git branch and deployment topology | Explain main-only commit; document production/staging branch, deployed SHA, rollback; no destructive history changes |
| STAB-03 | P0 | Data safety review | Backup/restore round trip in a separate browser profile; corrupt-data and schema-migration cases; local-only persistence clearly disclosed |
| STAB-04 | P0 | Mobile device triage | Collect device/browser, viewport, screenshot/video, steps, expected/actual, severity; reproduce and fix P0/P1 issues |
| STAB-05 | P1 | CSS cascade inventory | Map token ownership, duplicated selectors and override order; extract components incrementally with desktop/mobile screenshots |
| STAB-06 | P1 | Canonical UI controls | Standardize buttons, cards, modals, form fields, touch targets and focus states without breaking accessible names |
| STAB-07 | P1 | Mobile core-loop acceptance | At 360/390/430px and real device: Goals → Calendar → Today → complete → Progress; no clipped actions, unintended horizontal scroll or keyboard-obscured fields |
| STAB-08 | P1 | Calendar and goal-link audit | Verify session linkage, deduplication, planning horizons, completion persistence and return navigation |
| STAB-09 | P1 | Automated regression hardening | Mobile Playwright projects; critical navigation/form/modal tests; accessibility checks and production smoke |
| STAB-10 | P0 release gate | Controlled staging verification | Run `npm run check:release`, staging smoke, access/privacy/security review, rollback drill; record evidence |

## Mobile acceptance rubric

- **P0:** Data loss, inability to complete core workflow, security/privacy exposure.
- **P1:** Navigation blocked, unusable form/dialog, clipped primary action, major scroll trap.
- **P2:** Legibility, layout, excessive scrolling, inconsistent control styling.
- **P3:** Cosmetic alignment and minor visual polish.

For every issue: `Screen | Device/browser | Width | Steps | Expected | Actual | Screenshot | Severity | Fix commit | Retest`.

Test on physical Android and mobile Chromium emulation. A passing desktop suite does not satisfy mobile acceptance.

## Change-management rules

- Keep `product/v2` intact until stabilization changes are tested and reviewed.
- Small, reversible commits on `chore/v2-stabilization`; no sweeping CSS rewrites or data migrations without backup and regression coverage.
- Preserve existing Playwright selectors and accessible names where possible.
- Do not delete legacy branches or merge `main` until the divergence is understood.
- Treat Cloudflare Access, preview protection, data privacy and pilot approval as explicit release gates.

## Local baseline commands (owner environment)

```powershell
git status --short
git branch -vv
git fetch origin
git switch chore/v2-stabilization
git pull --ff-only origin chore/v2-stabilization
git log -1 --format="%h %cs %s"
npm ci
npm run build
npx playwright test
npm run check:release
```

If `git status --short` shows uncommitted changes, **do not switch branches until the changes are safely committed or stashed**. Report the results; failures become prioritized defects.

## Next execution step

Inspect the single `main`-only commit and the stylesheet import/cascade order. Then introduce mobile viewport smoke tests on this branch, using the owner's real-device observations to prioritize UI fixes. Do not declare RC1 until P0/P1 mobile and release gates are cleared.

## Owner baseline evidence — October 14, 2026

Owner ran the baseline commands on Windows PowerShell from `workoutapp`:

- `git status --short`: empty (clean working tree at initial check).
- `git fetch origin`: retrieved `product/v2` weather update and the stabilization branch.
- `git switch chore/v2-stabilization` and `git pull --ff-only origin chore/v2-stabilization`: succeeded; branch up to date.
- `npm ci`: succeeded, 28 packages added, 29 audited, **0 vulnerabilities** reported.
- `npm run build`: **passed** (TypeScript + Vite 8.3.3, 1,958 modules transformed). Build produced a CSS asset of 226.13 KB (38.91 KB gzip) and JS asset of 865.41 KB (237.84 KB gzip). Vite warned about >500 KB chunks and Lucide React module-level `use client` directives. Neither warning blocked the build.
- `npx playwright test`: **104/104 passed**, 18.4 seconds, Chromium.

**Verified:** STAB-01 initial local install/build/regression checkpoint. **Still pending:** `npm run check:release`, mobile device acceptance, deployed SHA and staging verification, independent privacy/security gates. No claim of production approval.

### Immediate next work

1. Add mobile-specific Playwright coverage at narrow viewports, including navigation, overflow, form controls, and the core loop.
2. Inventory CSS overrides and determine safe consolidation boundaries; avoid sweeping restyling before screenshots.
3. Verify the main-only commit and hosting branch/commit configuration before any branch reconciliation.

## Owner release-check evidence — October 14, 2026

Owner subsequently ran `npm run check:release` and reported:

- Main Playwright suite: **104/104 passed** (22.7s).
- Production Playwright suite: **2/2 passed** (1.8s).
- Production smoke assertions: built Arc loads, development-only Strava connection is blocked, and reload preserves local browser storage.

**Release-check result: PASS (owner-reported).** This closes the initial build/test verification checkpoint, **not** mobile acceptance, Cloudflare deployment verification, backup recovery across browser profiles, or privacy/security approval. Record the deployed commit SHA and real-device results before RC1.

## Product-management sequencing correction — October 14, 2026

**Decision:** Do not lead with mobile-specific remediation. First finish the V2 product's canonical design and frictionless core experience. Maintain responsive design as a constraint throughout, but schedule dedicated real-device mobile acceptance after desktop/tablet product coherence and feature integrity.

Milestone order:

1. **M1 Engineering baseline — owner-verified PASS:** clean install/build, 104 regression tests, 2 production tests. Release security/privacy gates remain separate.
2. **M2 Canonical design system — NEXT:** reconcile token sources, buttons, typography, cards, controls, dialogs, navigation and scroll patterns; reduce cascade duplication; define shared component contracts; visual acceptance screen by screen.
3. **M3 Frictionless UX:** first-run, Goals → Calendar → Today → Activity → Progress; remove redundant UI, reduce clicks, clarify labels and feedback, support recovery/empty/error states.
4. **M4 Feature integrity:** BJJ, Running, Cycling; goal associations; activity identity; persistence, recovery and analytics consistency.
5. **M5 Mobile/responsive acceptance:** device and viewport tests, touch ergonomics, keyboard behavior, scroll/overflow, navigation; fix P0/P1.
6. **M6 Release candidate and controlled pilot:** security/privacy, deployment SHA, access protection, rollback, real-world acceptance.

**Execution rule:** Avoid broad visual rewrites. Audit current canonical design documentation and actual CSS/controls first, then create small reversible implementation batches with visual and regression verification. Do not confuse a green test suite with a complete product.
