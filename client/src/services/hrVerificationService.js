// Employment / background verification requests -> HRMS (crm.visionbitz.com).
//
// WHY THIS GOES THROUGH OUR OWN /api ROUTE
// hrms.crm.visionbitz.com returns no Access-Control-Allow-Origin header, so a
// fetch() straight from the browser is blocked by the same-origin policy. Every
// call below therefore hits our own Vercel serverless function at
// /api/hr-verification, which forwards the request server-side (no CORS) and
// keeps the HRMS credentials out of the public bundle.
//
// WHY FormData AND NOT JSON
// The HRMS request form carries an optional `consent` file (the signed consent
// letter, .pdf/.jpg/.jpeg/.png). Multipart is therefore the native encoding for
// this payload, and our proxy forwards the body through untouched -- so the
// field names here must match HRMS exactly. They are mirrored from the HRMS
// form's own inputs; see client/api/hr-verification.js for the field list.
//
// Do NOT set a Content-Type header: the browser must set multipart/form-data
// together with the boundary it generated.

const PROXY_ENDPOINT = '/api/hr-verification';

/**
 * @typedef  {object} VerificationResult
 * @property {boolean} ok              request succeeded end to end
 * @property {string}  [message]       human-readable summary, always set on failure
 * @property {object}  [data]          upstream payload when ok ({ reference, passcode, email })
 * @property {boolean} [notConfigured] upstream tenant/endpoint not wired up yet
 * @property {object}  [fieldErrors]   per-field messages from HRMS, keyed by field name
 */

const send = async (formData) => {
  let res;
  try {
    res = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      body: formData,
    });
  } catch {
    return {
      ok: false,
      message: 'Could not reach the verification service. Check your connection and try again.',
    };
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.status === 503 && body?.notConfigured) {
    return {
      ok: false,
      notConfigured: true,
      message:
        body.message ||
        'Employment verification is not available online yet. Please contact our HR team directly.',
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      message:
        body?.message ||
        body?.error ||
        `The verification service returned an error (${res.status}). Please try again shortly.`,
      // HRMS reports per-field problems as { fieldName: ["message"] }.
      fieldErrors: body?.errors || body?.fieldErrors || undefined,
    };
  }

  return { ok: true, data: body };
};

/**
 * Submit a new employment-verification request. `form` is a FormData.
 *
 * There is deliberately no status-lookup counterpart. HRMS answers a lookup with
 * a union of eight outcome kinds, and its own portal already renders every one
 * of them; the page's status tab links there rather than keeping a third copy of
 * that logic in step across four websites.
 */
export const submitVerificationRequest = (form) => send(form);

export default { submitVerificationRequest };
