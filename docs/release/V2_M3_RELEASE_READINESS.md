# Arc V2 — M3 Release Readiness

Status: **Active audit; not release-approved**  
Branch: `product/v2`  
Product scope: BJJ, Running, Cycling and the Goals → Calendar → Today → Activity → Progress loop.

## Baseline
- M2.6 dashboard refinement and test expectation fixes committed through `de80b20ee3c14b0d1f59ceee3073608fe86ae735`.
- Owner reported 76/76 Playwright tests passing after pulling that commit.
- Local uncommitted files, remote deployment, and production readiness have **not** been verified.
- V2 ships first. V3 extensibility is a compatibility consideration, not a reason to expand V2 scope. V4 remains future research.

## M3 release gates

| Gate | Required evidence | Status |
| --- | --- | --- |
| Source control | Clean local working tree; expected branch; pushed commits; record release SHA | Pending local verification |
| Build | `npm run build` passes from a clean install | Pending |
| Automated regression | Full Playwright suite passes on release candidate | 76/76 owner-reported; repeat on candidate |
| Core loop | Goal creation → Calendar planning → Today → completion → Progress, including reload/edit/skip | Audit pending |
| Focus integrity | BJJ, Running, Cycling categorization and unit handling | Audit pending |
| First-run UX | New account/browser without data has clear path to first goal and session | Audit pending |
| Data safety | Document localStorage persistence limits, backup/export, destructive actions and recovery | Audit pending |
| Mobile and accessibility | Keyboard, labels, contrast, responsive layout and reduced motion | Audit pending |
| Error states | Invalid/stale storage, offline/external data failures, missing data | Audit pending |
| Production | Hosting, configuration, logging, domain, rollback and smoke test | Not configured/verified |
| Trust and launch | Privacy notice, terms, support contact, analytics consent if applicable | Pending |
| Pilot | Small external-user test and prioritized fixes | Pending |

## M3 execution sequence

1. **M3.1 Baseline & inventory** — verify clean tree, branch, dependencies, current storage model, deployment assumptions and release blocker list.
2. **M3.2 Core-loop audit** — exercise new-user and returning-user workflows across all three Focuses; fix blockers.
3. **M3.3 UX/accessibility** — first-run, mobile, keyboard and empty/error states.
4. **M3.4 Data resilience** — backup/export, safe migration and recovery plan; implement only release-critical fixes.
5. **M3.5 Production hardening** — deployment, configuration, observability, privacy and rollback.
6. **M3.6 Release candidate** — freeze scope, full build/test, smoke test, pilot feedback and go/no-go.

## Local baseline commands

```bash
git switch product/v2
git status --short
git log -1 --oneline
git pull --ff-only origin product/v2
npm run build
npx playwright test --workers=4
```

**Do not discard local changes** if `git status --short` shows files; review them first.

## Decision log
- V2 is the only active release target.
- V3 Custom Focus Builder is planned, not implemented as part of M3.
- No V4 engineering scope in this release.
- A release is not approved solely because automated tests pass.

## M3.1 repository inventory — initial findings

Verified by inspecting the current `product/v2` files:

- `package.json` identifies version `0.2.0`; `npm run build` executes TypeScript build plus Vite, and Playwright is the configured E2E runner.
- Dependencies currently use `latest` version ranges; review lockfile and pinning strategy before release to avoid unexpected upgrades.
- Goals use the browser key `workoutapp.goals.v2`; planned activities use `workoutapp.planned-activities.v1`. The application also reads multiple additional local JSON stores. **Browser storage is not a cloud backup.** Audit backup/export and migration before inviting external users.
- The optional Node integration server supports Strava OAuth and stores tokens in a local `.strava-tokens.json` file. Before public deployment, review token storage, isolation between users, OAuth state/CSRF protection, server error handling, and secure credential management. **Do not deploy this integration as-is without security review.**
- Current `src/App.tsx` is large and contains legacy workout/program functionality; assess user-facing release scope rather than assuming every internal feature is ready.
- The owner reports 76/76 Playwright tests passing. This confirms the tested flows, not production readiness.

### Immediate release blockers / investigations

1. **P0 security review:** Strava OAuth callback and token persistence before any publicly accessible integration server.
2. **P0 data-loss prevention:** Confirm whether V2 offers export/backup and a safe way to recover from browser storage loss.
3. **P1 reproducible builds:** Verify lockfile and deterministic installation; consider pinning dependency ranges.
4. **P1 release boundary:** Decide whether integrations and legacy program features ship, are hidden, or are marked experimental.
5. **P1 local baseline:** Confirm clean working tree and successful `npm run build`; Playwright pass reported.

These are initial findings and priorities, not a completed security or UX audit.
