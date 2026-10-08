# Arc V2 — Deployment and rollback runbook

Status: **Draft; production deployment not approved**. Branch: `product/v2`.

## Architecture decision

V2 is a browser-based Vite/React application with localStorage persistence. There is no user-account service, cloud backup, or multi-device synchronization. Static hosting can serve the built `dist/` directory over HTTPS, but users must be warned that clearing site data, browser profile changes, and private browsing may destroy local records.

The optional Node Strava integration server is **development-only**. It stores one shared token set in `.strava-tokens.json`; even with loopback binding and OAuth state validation it has no per-user authentication or isolation. Do not publish it behind a reverse proxy or expose its endpoints publicly. Hide or disable the integration in any public V2 pilot until a separate security review and production architecture are approved.

## Candidate release procedure

1. Freeze a release commit SHA and inspect `git status --short`.
2. Commit a reviewed `package-lock.json` and replace `latest` dependency ranges with reviewed, pinned versions. These are **open blockers**.
3. Run `npm ci`, `npm run check:release`, and review any audit findings; document results and the exact SHA.
4. Deploy only the static `dist/` output to an HTTPS host with a staging URL first. Do not deploy `server/index.mjs` or Strava secrets.
5. On staging, verify new-user Goals → Calendar → Today → completion → Progress, reload persistence, keyboard navigation, mobile layouts, backup export and restore using disposable test data.
6. Confirm privacy/terms/support notices, an incident contact, and backup instructions before inviting pilot users.
7. Record hosting provider, DNS/domain, release SHA, deployment timestamp, smoke-test evidence and rollback owner in the release checklist.

## Rollback and incident response

- Retain the last known-good static build and release SHA; revert the hosting deployment to that artifact if a new build is broken.
- **Do not clear browser storage** as a rollback step. Static rollback does not undo changes to local data schemas.
- If data appears corrupted, stop editing, export a recovery backup, and preserve the original browser profile. Do not promise restoration of malformed records.
- If a future release changes storage schemas, require a tested forward/backward compatibility plan **before** deploying; do not silently downgrade stored data.
- If secrets are exposed, rotate credentials, disable the integration endpoint, and assess scope before restoring access.

## Unresolved launch gates

- Deterministic dependency installation and committed lockfile.
- Hosting/staging provider, HTTPS configuration, monitoring and support ownership.
- Privacy and terms review; user-facing local-storage retention limitations.
- Integration feature gating and secure multi-user architecture if Strava is included.
- Pilot acceptance and final go/no-go.
