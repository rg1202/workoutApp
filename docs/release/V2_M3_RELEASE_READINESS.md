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
