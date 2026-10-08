# Arc V2 — Cloudflare Pages staging deployment

Status: **not deployed**. Release source: `product/v2`, frozen baseline `629fd83` (subsequent M3.7 commits require a fresh release SHA).

## Owner-controlled setup

1. In Cloudflare Pages, create a Git-connected Pages project using GitHub repository `rg1202/workoutApp`. Confirm the correct GitHub account has access.
2. Set **production branch** to `product/v2` only if this Pages project is dedicated to staging. Do **not** promote the staging domain as a public launch.
3. Framework preset: **Vite**; build command: `npm run build`; output directory: `dist`; root directory: repository root. Use the pinned Node/npm versions verified locally; record them in deployment evidence. Cloudflare build configuration may require an explicit Node version.
4. Do not configure Strava secrets, token files, or `server/index.mjs` as deployment functions. No server-side integration is part of V2.
5. Enable Cloudflare Access (or another independently verified access restriction) **before** putting sensitive or real-user data into staging. A random `*.pages.dev` URL is **not private**. Confirm Access protects both the primary domain and any preview URLs; previews may have different access rules.
6. Turn off or limit automatic preview exposure until access restrictions have been tested. Do not share preview URLs publicly.
7. Confirm `public/_headers` is copied to `dist/_headers` and applied to the deployed static responses. Inspect the browser console for CSP failures; expand allowlists only for verified required destinations.
8. Record exact deployment URL, build SHA, deployment ID, deploy timestamp, Cloudflare settings, access test and rollback owner. Never put tokens or personal backups in GitHub issues.

## Deployment acceptance

- In a signed-out/private window, verify that staging is **blocked** before login; verify access after authorization.
- Inspect response headers on HTML and an asset. Confirm no development integration server is exposed.
- Use disposable data: Goal → Calendar → Today → completion → Progress → reload. Repeat at mobile width and keyboard-only.
- Export a backup and restore it in a separate disposable browser profile; do not upload the backup to Cloudflare.
- Check that an incognito profile has no previous Arc data, and that browser storage remains device/profile-specific.
- Test a rollback to a known-good Cloudflare Pages deployment. Rollback changes static code only, **not** browser data; do not clear localStorage.

## Launch constraints

Cloudflare Pages provides hosting, **not** user authentication or cloud data storage for Arc. Cloudflare Access is a staging access gate, not a substitute for Arc account security. Review Cloudflare request logs/analytics and third-party disclosures before any pilot. A staging deployment is not authorization for public release.
