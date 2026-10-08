# Arc V2 privacy notice — pilot draft

Arc stores personal goals, activity records and preferences in browser local storage. It does not currently provide an account-based cloud backup or cross-device sync.

Browser data can be lost if site data is cleared, the browser profile is removed, or private browsing is used. Exported backups may contain sensitive information, are not encrypted, and should be stored securely. An exported backup is not proof that its contents can be restored.

External integrations are not available in the public production build at this stage.

Before publication, review this notice, add a support contact and effective date, and document any actual hosting analytics and third-party services.

## Pilot contact

For pilot support, privacy questions, and requests about the pilot, contact **rgould.midwest@gmail.com**.

## Pilot disclosure checklist (pending verification)

- Confirm the effective date before providing this notice to testers.
- Confirm whether Cloudflare Pages/Access logs, analytics, and weather/geocoding requests are in use and describe them accurately.
- Confirm how testers will receive and acknowledge the privacy notice and pilot participation terms.
- Clarify that data saved in one browser/profile does not automatically appear on another device.
- Explain that deleting browser site data can permanently remove local Arc records unless a restorable backup exists.
- Explain that exported backups may include profile photos, goals, and activity details and are not encrypted.
- Verify third-party services, cookies, retention, and applicable legal requirements before publication.

This document is a **draft**, not a finalized legal privacy policy or evidence of compliance.

## Hosting, access and analytics — October 8, 2026 pilot disclosure draft

Arc V2 is hosted using Cloudflare Pages and protected during the invitation-only pilot by Cloudflare Access. Access authentication and security/hosting services may process email identifiers, IP addresses, request metadata and related technical logs under Cloudflare's applicable terms and retention settings. Cloudflare Access authentication is distinct from an Arc account and does not synchronize Arc goals or activities across devices.

**Cloudflare Web Analytics is enabled for arc-v2-staging.pages.dev** (owner confirmation and dashboard screenshot, October 8, 2026). The screenshot showed zero visits and page views at the time of capture; that does not establish that analytics collection is inactive. Website usage/performance metrics may be collected through Cloudflare. Do not claim no analytics or no third-party processing. Verify whether beacon injection is active on the deployed site and check Cloudflare's current documentation for specific collection, cookies, retention, and legal wording before publication.

Arc's Content Security Policy allows requests to api.open-meteo.com and geocoding-api.open-meteo.com for weather and location-search features. When a tester uses those features, network requests may disclose technical connection information and requested location/search parameters to those services. Confirm actual feature behavior before final wording.

Arc goals, calendars, activity records and preferences are stored in the user's browser rather than Arc-hosted account storage in this pilot. Clearing browser data can remove them. Downloaded backups are unencrypted and should not be shared with pilot support or placed in public bug reports.

**Status:** Draft disclosure, not final legal approval. Before inviting testers: verify deployed analytics configuration and any cookies, Cloudflare retention and relevant notices, consent/onboarding method, effective date, and owner approval.

## Effective date decision — October 8, 2026

The owner approved **October 8, 2026** as the effective date of the Arc V2 invitation-only pilot notice. The pilot notice wording was conditionally approved, subject to Cloudflare retention verification. The draft status remains until verification and final release sign-off; no invitations are authorized by this date approval alone.
