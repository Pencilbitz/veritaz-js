/**
 * Where the HRMS lives. One place, because this host changes.
 *
 * Override it with `VITE_HRMS_PORTAL_URL`. This repo is public and commits no
 * .env file, so set that in the Vercel project rather than in a file — Vite
 * picks up VITE_-prefixed variables from the build environment too. Unset, the
 * fallback below is the live host.
 *
 * ---------------------------------------------------------------------------
 * The subdomain is load-bearing
 *
 * The CRM resolves the tenant from the hostname the request arrives on — see
 * `resolvePortalFromHost()` over there. `hrms.` is what makes this the HRMS
 * company's portal; a different subdomain is a different company's page, not a
 * different address for the same one. So change the whole value deliberately,
 * and not just to "fix a link".
 *
 * ---------------------------------------------------------------------------
 * There is a second copy, and it is not optional
 *
 * `api/hr-verification.js` holds its own base URL in
 * `HRMS_VERIFICATION_URL`, because it runs server-side and never sees a
 * `VITE_`-prefixed variable. The two have to move together: this one is where a
 * visitor is *sent*, that one is where the form is *submitted*. Changing only
 * this leaves submissions going to the old host.
 */

// Only `VITE_`-prefixed variables reach the browser bundle in Vite, and the
// value is inlined at build time — so a change needs a redeploy, not a restart.
const FALLBACK_BASE = 'https://hrms.crm.visionbitz.com';

export const HRMS_BASE_URL = String(
  import.meta.env.VITE_HRMS_PORTAL_URL || FALLBACK_BASE,
).replace(/\/+$/, '');

/*
 * Two audiences, two destinations — do not swap them.
 *
 *   HRMS_BASE_URL   the HRMS app itself: staff sign in here. Internal.
 *   the two below   the public verification flow, which an outside employer or
 *                   screening agency uses with no account at all.
 *
 * Sending an employer to the base URL lands them on a login page they can never
 * pass; sending an employee to /backendverification asks them to verify
 * themselves. The nav keeps them as separate entries for that reason.
 */

/** Raise a new employment-verification request. Public — no account needed. */
export const HRMS_REQUEST_URL = `${HRMS_BASE_URL}/backendverification/request`;

/** Look up a request already raised. Public — reference + passcode, or Aadhaar + email. */
export const HRMS_STATUS_URL = `${HRMS_BASE_URL}/backendverification/status`;
