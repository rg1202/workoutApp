# Arc V2 — Invitation-only pilot protocol

Status: **Draft — no invitations authorized yet**
Decision: Invitation-only pilot of 5–10 selected participants.
Suggested duration: 14 days, subject to owner approval.
Contact: rgould.midwest@gmail.com

## Purpose
Validate whether first-time users understand Arc's core loop: Goals → Calendar → Today → Activity → Progress. Observe reliability, usability, return use and clarity of browser-local data limitations. Focuses available in V2: BJJ, Running, Cycling.

## Access
- Keep Cloudflare Access owner-only until M3.8 security/privacy sign-off.
- For pilot, update the Access **Allow → Emails** rule to explicitly include only approved tester email addresses; never use Everyone or All authenticated users.
- Verify the actual primary hostname and unique preview deployment URLs deny access when signed out or with an unapproved email.
- Maintain a private invitation roster outside the public GitHub repository. Do not commit email addresses or personal feedback.
- Removal of Access permission prevents future site access but **does not delete browser-local data already stored on testers' devices**.
- Arc does not currently provide server accounts or cross-device sync. Cloudflare Access controls entry to the hosted website; it is not Arc account management.

## Pre-invitation gates
- Preview URL authentication verified with approved/unapproved sessions.
- Deployed SHA, security headers, clean console and no exposed credentials/integrations verified.
- Owner signs off on privacy notice, third-party services and support contact.
- Pilot consent and instructions distributed; clear explanation of local-only data and unencrypted backup exports.
- Rollback, backup/restore and critical workflows tested.
- Explicit go/no-go recorded in M3.8 milestone.

## Participant onboarding (draft)
1. Use an approved email to authenticate to Arc staging.
2. Read and acknowledge the pilot notice and limitations before entering information.
3. Use non-sensitive data only; avoid medical, financial, relationship, or other private information.
4. Create one goal, schedule one supporting activity, mark one activity complete, review Progress, refresh and verify persistence.
5. Test on one browser/profile first. Data does not automatically follow you to another device or browser.
6. Export a backup if desired. The file may contain personal data and is not encrypted; store it privately.
7. Report bugs and usability feedback to rgould.midwest@gmail.com without attaching sensitive backup files.

## Feedback questions
- Could you identify what to do first without instructions?
- Could you create a goal and connect it to a planned activity?
- Did Today show what mattered to you?
- Did Progress explain your actual activity accurately?
- What confused you or prevented you from returning?
- Did you understand that data stays in your browser?
- Would you choose to use Arc again? Why or why not?

## Pilot metrics (avoid inflated claims)
- Invitation acceptance: accepted / invited.
- Core loop completion: testers completing goal → schedule → completion → progress / active testers.
- Day 2 and day 7 observed return usage, collected only through disclosed, consented methods; **do not assume analytics exist**.
- Issue counts by P0/P1/P2 and resolution time.
- Qualitative feedback themes and requested features. A 5–10 person pilot cannot establish long-term retention or monetization.

## Stop conditions
- P0: unauthorized access, exposed secrets, cross-user data leakage, or data loss in normal use → stop immediately.
- P1: broken core workflow, unreliable recovery or major accessibility barrier → pause new invitations until corrected.
- Do not broaden access beyond the approved roster without explicit owner decision.
