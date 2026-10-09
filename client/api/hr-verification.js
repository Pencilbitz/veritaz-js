// Vercel serverless proxy: Veritaz site -> HRMS employment verification.
//
// WHY THIS FILE EXISTS
// 1. CORS. hrms.crm.visionbitz.com sends no Access-Control-Allow-Origin header,
//    so the browser cannot call it directly from veritazinternational.com. Server-to-server
//    requests are not subject to CORS, so forwarding from here works.
// 2. The token. VERIFICATION_API_SECRET must never ship in the client bundle; it
//    is read from the environment, which only this function can see.
//
// ── SETUP ───────────────────────────────────────────────────────────────────
// Vercel -> the Veritaz client project -> Settings -> Environment Variables:
//
//   VERIFICATION_API_SECRET   the shared Bearer token. The SAME value must be set
//                             on the CRM project (visionbitz-crm), which refuses
//                             outright when it is unset.
//   HRMS_VERIFICATION_URL     optional override of the base URL below. The
//                             default is the live HRMS portal.
//
// Without the token this returns 503 + notConfigured and the page shows a
// "contact HR directly" notice instead of a form that fails on submit.
//
// ── WHAT IS ON THE OTHER END ────────────────────────────────────────────────
// `app/api/public/backendverification/{request,status}/route.ts` in
// visionbitz_crm_web, added for this integration. Each route checks the Bearer
// token and then hands the body to the same Server Action the HRMS portal's own
// form calls, so the two cannot disagree about what a request is.
//
// It is NOT a direct database write. The CRM's service-role key would open every
// tenant's payroll and employee_identity, and the Aadhaar hashing, passcode,
// per-number throttle and emails live in that action — copying them here would be
// a second implementation to drift. The company is resolved from the hostname
// inside the action, so there is no company parameter to forge.
//
// POST <base>/request, multipart/form-data:
//   candidateName         required  "Name as per Aadhaar"
//   aadhaar               required  12 digits
//   requesterCompany      required  "Your company name"
//   requesterName         required  "HR name"
//   requesterDesignation  optional  "Designation"
//   requesterEmail        required  "HR official email ID" -- work domains only
//   requesterPhone        required  "HR mobile number"
//   consent               optional  signed consent letter, .pdf/.jpg/.jpeg/.png
//   consentConfirmed      "1" when the declaration is ticked
// 200 -> { reference, passcode, email }   422 -> { message, errors }
//
// The sibling <base>/status endpoint is intentionally not used from here: the
// page's status tab links straight to the HRMS portal, which already renders all
// eight ReplyOutcome kinds.
//
// The body is forwarded byte-for-byte with its original Content-Type, so the
// multipart boundary and the uploaded file survive and the field names above
// never have to be restated on this side.

export const config = {
  api: {
    // Vercel's body parser would consume the multipart stream and destroy the
    // boundary before it could be forwarded.
    bodyParser: false,
  },
};

const DEFAULT_BASE_URL = "https://hrms.crm.visionbitz.com/api/public/backendverification";

// Vercel caps a serverless function's request body at 4.5 MB, well under the
// 10 MB the HRMS form allows, so this refuses early with a message that names the
// real limit rather than failing at the platform edge with a generic 413.
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const readRawBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { tooLarge: true }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

/**
 * The raw body, however this runtime chose to hand it over.
 *
 * `config.api.bodyParser` is a Next.js convention and this is a bare Vercel
 * Function, so it is not guaranteed to be honoured. If something upstream has
 * already buffered the body, reading the stream yields nothing — so prefer what
 * is already there and only fall back to the stream.
 */
const getBody = async (req) => {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  return readRawBody(req);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const secret = process.env.VERIFICATION_API_SECRET;
  if (!secret) {
    return res.status(503).json({
      notConfigured: true,
      message:
        "Employment verification is not connected yet. Please contact our HR team and we will respond directly.",
    });
  }

  const base = (process.env.HRMS_VERIFICATION_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const url = `${base}/request`;

  let body;
  try {
    body = await getBody(req);
  } catch (err) {
    if (err.tooLarge) {
      return res.status(413).json({
        message:
          "That file is too large to send through this page. Keep the consent letter under 4 MB, or use the HR portal directly.",
      });
    }
    return res.status(400).json({ message: "Could not read the submitted form." });
  }

  if (!body || body.length === 0) {
    return res.status(400).json({ message: "The form was empty." });
  }

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${secret}`,
  };
  // Carries the multipart boundary; without it the far side parses no fields.
  if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body,
      // A 3xx means the CRM's Proxy sent us to /login, i.e. the route is not in
      // its PUBLIC_PATHS. Report that rather than parsing a login page as a result.
      redirect: "manual",
      signal: controller.signal,
    });

    if (upstream.status >= 300 && upstream.status < 400) {
      return res.status(502).json({
        message:
          "The HRMS verification endpoint redirected to a login page. Its route is not public to the CRM proxy.",
      });
    }

    const text = await upstream.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return res.status(502).json({
        message:
          "The HRMS verification service did not return a valid response. Its verification page may not be configured yet.",
      });
    }

    // 503 "not configured" is the CRM's own answer when its token or its
    // VERIFICATION_PEPPER is unset. Pass the distinction through so the page shows
    // the amber "not available online yet" notice rather than a red error.
    if (upstream.status === 503) {
      return res.status(503).json({
        notConfigured: true,
        message:
          "Employment verification is not available online yet. Please contact our HR team directly.",
      });
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        message: data.message || data.error || `HRMS returned ${upstream.status}.`,
        errors: data.errors || data.fieldErrors || undefined,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    if (err.name === "AbortError") {
      return res
        .status(504)
        .json({ message: "The verification service timed out. Please try again." });
    }
    return res.status(502).json({ message: "Could not reach the verification service." });
  } finally {
    clearTimeout(timer);
  }
}
