# Arc V2 — Pilot participant notice and acknowledgment

**Status:** Implemented on `product/v2`; pending build, automated tests, owner wording approval and pilot authorization.
**Pilot:** Invitation-only, approximately 5–10 selected testers.
**Effective date:** To be set before invitations are issued.
**Contact:** rgould.midwest@gmail.com

## Welcome to the Arc private beta

Arc is an early version of a personal goal and activity planning application focused on BJJ, Running and Cycling. This pilot is for feedback and testing, not for storing sensitive or irreplaceable records. Features may change, malfunction or become temporarily unavailable.

## Where your data goes

- Goals, calendar entries, activity records, profile details and preferences are stored in your current browser's local storage. Arc does not currently provide Arc accounts, server-side goal storage, cloud backups or cross-device synchronization.
- Browser storage can be deleted by clearing site data, changing profiles or devices, using private browsing, or other browser/device issues. There is a backup export and restore feature, but successful export does not guarantee recovery.
- Exported Arc backup files are **not encrypted** and may contain goals, activities and profile images. Store them privately. Do not send backup files to pilot support or public issue trackers.
- Cloudflare Pages hosts the site. Cloudflare Access manages pilot entry and may process email identifiers and connection/security information. Cloudflare Web Analytics is enabled and may collect website usage and performance information. Access authentication is not an Arc account.
- Weather and location search features may make requests to Open-Meteo weather and geocoding services, sharing relevant search/location parameters and technical request information with those providers.
- Do not enter medical, financial, relationship or other sensitive personal information during this pilot.

## Participation and feedback

Participation is voluntary. You can stop using Arc at any time and request removal from the Cloudflare Access invitation list by emailing rgould.midwest@gmail.com. Removing access does **not** erase Arc data saved in your browser. To remove that data, clear the site's browser storage (after exporting anything you want to retain). Cloudflare may separately retain technical/security or analytics data according to its settings and policies; local browser deletion does not erase those records.

If you report bugs, avoid sending sensitive data, screenshots with personal details, passwords, tokens or exported backups. Pilot feedback will be reviewed to improve Arc. This pilot is not a guarantee of continued service or future features.

## Acknowledgment

[ ] **I have read and understand the Arc V2 private beta notice.** I understand that Arc is experimental, that my Arc records are stored in this browser, that exported backups are not encrypted, and that Cloudflare provides hosting, access authentication and website analytics. I agree to use non-sensitive test data and voluntarily participate in the pilot.

**Continue to Arc** — enabled only after the checkbox is checked.

**Not now** — leave Arc without accepting.

## Engineering acceptance criteria (proposed)

1. Present notice before any Arc application content on the first pilot visit. Users must be able to read the complete notice before checking acknowledgment.
2. No pre-checked box. Continue is disabled until explicitly checked. Not now does not save acceptance.
3. Store acknowledgment locally under a versioned Arc key with notice version and timestamp, **not** as proof of legal identity. A new notice version must require acknowledgment again.
4. Accessible modal/page: keyboard navigation, screen-reader labels, visible focus, responsive layout, no trapped focus.
5. Provide a persistent way to re-open the notice after acceptance, including the support email.
6. Acknowledgment is browser/profile-specific; clearing local storage resets it. Cloudflare Access remains the actual allowlist gate.
7. Add automated tests for accept, decline, reload persistence, new-version re-acknowledgment and storage clearing.
8. Before implementation or invitations: owner approves wording, effective date, third-party processing/retention disclosure and any applicable legal review. No claim of regulatory compliance is implied.

## Implementation log — October 8, 2026

- Added `src/arc/PilotNoticeGate.tsx` and wrapped `Root` in `src/main.tsx` so no Arc app UI mounts before first-use acknowledgment.
- Added responsive notice styles in `src/styles.css`, including keyboard focus visibility and scrollable notice.
- Acceptance key: `arc.pilot-acknowledgment.v1`; notice version `2026-10-08-v1`. This is local browser acknowledgment, not verified identity or a server-side consent record.
- Added Playwright coverage for decline, disabled continue, persistence, review link, version mismatch, and clearing storage. Existing E2E setup now acknowledges the notice before testing Arc features.
- **Not yet verified:** local build and full release test suite, live deployment, owner wording approval, Cloudflare retention review and final go/no-go. Do not invite testers until verified.
