import { useRef, useState } from 'react';
import {
  ShieldCheck,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

import { submitVerificationRequest } from '../services/hrVerificationService';
import { HRMS_REQUEST_URL, HRMS_STATUS_URL } from '../config/hrms';

/**
 * Employment verification, for an employer checking a current or former member
 * of staff.
 *
 * No HR name, email or phone is hardcoded here. The HRMS holds that
 * configuration and is what emails the requester, so a copy on this page would
 * only drift. This is the UI; HRMS is the system of record.
 *
 * ---------------------------------------------------------------------------
 * Why this raises a request but does not report on one
 *
 * HRMS answers a status lookup with a union of eight outcome kinds, where the
 * confirmed one carries the disclosed employment fields, who approved them, a
 * view counter and an expiry. Its own portal renders all of that, maintained in
 * one place — so the status tab links there rather than this being a third copy
 * to keep in step across four websites, and a third place for employment data
 * to be shown wrongly.
 *
 * Raising a request is different: the fields are the requester's own, the answer
 * is a receipt, and nothing is disclosed. That stays here.
 */

// Field names, labels and required flags are mirrored from the HRMS portal's own
// form so a request raised here is indistinguishable from one raised there. The
// proxy forwards this body untouched, so a field renamed here silently stops
// reaching HRMS.
const CONSENT_ACCEPT = '.pdf,.jpg,.jpeg,.png';
// HRMS itself allows 10 MB, but this form posts through a Vercel serverless
// function and those cap a request body at 4.5 MB. Refusing at 4 MB here names
// the real limit instead of letting the platform return a bare 413.
const CONSENT_MAX_MB = 4;

const EMPTY_REQUEST = {
  candidateName: '',
  aadhaar: '',
  requesterCompany: '',
  requesterName: '',
  requesterDesignation: '',
  requesterEmail: '',
  requesterPhone: '',
  consentConfirmed: false,
};

// Aadhaar reads far more easily in 4-4-4 groups; HRMS gets the bare digits.
const formatAadhaar = (value) =>
  value.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ').trim();

const inputClass =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 ' +
  'focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 focus:outline-none transition';

const Field = ({ label, hint, required, error, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-bold text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
    {children}
    {hint && !error && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    {error && <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span>}
  </label>
);

const SectionHeading = ({ children }) => (
  <h2 className="border-b border-gray-100 pb-2 text-sm font-extrabold text-gray-900">
    {children}
  </h2>
);

export default function HRDepartment() {
  const [form, setForm] = useState(EMPTY_REQUEST);
  const [consentFile, setConsentFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const fieldErrors = result?.fieldErrors || {};
  const errorFor = (name) => {
    const e = fieldErrors[name];
    return Array.isArray(e) ? e[0] : e;
  };

  const setField = (name, value) =>
    setForm((prev) => ({
      ...prev,
      [name]: name === 'aadhaar' ? formatAadhaar(value) : value,
    }));

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > CONSENT_MAX_MB * 1024 * 1024) {
      setFileError(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${CONSENT_MAX_MB} MB.`,
      );
      setConsentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFileError(null);
    setConsentFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError) return;

    setSubmitting(true);
    setResult(null);

    // Multipart, because the consent letter is a file.
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'consentConfirmed') return;
      fd.append(key, key === 'aadhaar' ? String(value).replace(/\s/g, '') : value);
    });
    if (form.consentConfirmed) fd.append('consentConfirmed', '1');
    if (consentFile) fd.append('consent', consentFile, consentFile.name);

    const res = await submitVerificationRequest(fd);
    setResult(res);
    setSubmitting(false);

    if (res.ok) {
      setForm(EMPTY_REQUEST);
      setConsentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <section className="bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <header className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white sm:grid">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Employment Verification
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-[15px]">
              Employers, banks and background-screening agencies can use this page to verify the
              employment of a current or former Veritaz International Press team member. Our HR department reviews
              each request and emails the answer to the official address you provide.
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* ── Form ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {/* Two tabs, but only the first is a tab. "Check an existing
                  request" links out to the HR portal: the affordance stays where
                  a requester looks for it, while the reply is read on the system
                  of record. */}
              <div className="flex border-b border-gray-100">
                <span className="flex flex-1 items-center justify-center gap-2 border-b-2 border-[#2563eb] bg-[#2563eb]/5 px-4 py-3.5 text-sm font-bold text-[#1d4ed8]">
                  <ShieldCheck size={16} />
                  <span className="hidden sm:inline">Request a verification</span>
                  <span className="sm:hidden">Request</span>
                </span>
                <a
                  href={HRMS_STATUS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                >
                  <Search size={16} />
                  <span className="hidden sm:inline">Check an existing request</span>
                  <span className="sm:hidden">Check status</span>
                  <ExternalLink size={13} className="opacity-70" />
                </a>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
                <section className="space-y-4">
                  <SectionHeading>The person</SectionHeading>
                  <Field
                    label="Name as per Aadhaar"
                    hint="Exactly as it appears on their Aadhaar card."
                    required
                    error={errorFor('candidateName')}
                  >
                    <input
                      className={inputClass}
                      name="candidateName"
                      value={form.candidateName}
                      onChange={(e) => setField('candidateName', e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </Field>
                  <Field
                    label="Aadhaar number"
                    hint="Twelve digits. Spaces and dashes are fine — we strip them."
                    required
                    error={errorFor('aadhaar')}
                  >
                    <input
                      className={inputClass}
                      name="aadhaar"
                      value={form.aadhaar}
                      onChange={(e) => setField('aadhaar', e.target.value)}
                      inputMode="numeric"
                      placeholder="1234 5678 9012"
                      autoComplete="off"
                      required
                    />
                  </Field>
                </section>

                <section className="space-y-4">
                  <SectionHeading>Who is asking</SectionHeading>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Your company name" required error={errorFor('requesterCompany')}>
                      <input
                        className={inputClass}
                        name="requesterCompany"
                        value={form.requesterCompany}
                        onChange={(e) => setField('requesterCompany', e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="HR name" required error={errorFor('requesterName')}>
                      <input
                        className={inputClass}
                        name="requesterName"
                        value={form.requesterName}
                        onChange={(e) => setField('requesterName', e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Designation" error={errorFor('requesterDesignation')}>
                      <input
                        className={inputClass}
                        name="requesterDesignation"
                        value={form.requesterDesignation}
                        onChange={(e) => setField('requesterDesignation', e.target.value)}
                      />
                    </Field>
                    <Field
                      label="HR mobile number"
                      hint="In case HR needs to call you about this request."
                      required
                      error={errorFor('requesterPhone')}
                    >
                      <input
                        className={inputClass}
                        name="requesterPhone"
                        value={form.requesterPhone}
                        onChange={(e) => setField('requesterPhone', e.target.value)}
                        inputMode="tel"
                        required
                      />
                    </Field>
                  </div>
                  <Field
                    label="HR official email ID"
                    hint="Your company's own domain only — Gmail, Yahoo, Outlook and temporary inboxes are refused."
                    required
                    error={errorFor('requesterEmail')}
                  >
                    <input
                      type="email"
                      className={inputClass}
                      name="requesterEmail"
                      value={form.requesterEmail}
                      onChange={(e) => setField('requesterEmail', e.target.value)}
                      placeholder="priya@yourcompany.com"
                      required
                    />
                  </Field>
                </section>

                <section className="space-y-4">
                  <SectionHeading>Consent</SectionHeading>
                  <Field
                    label="Signed consent letter"
                    hint={`PDF or image, up to ${CONSENT_MAX_MB} MB. Larger files: use the HR portal link opposite.`}
                    error={fileError || errorFor('consent')}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="consent"
                      accept={CONSENT_ACCEPT}
                      onChange={handleFile}
                      className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb]/10 file:px-3 file:py-2 file:text-sm file:font-bold file:text-[#1d4ed8]"
                    />
                  </Field>
                  <label className="flex items-start gap-2.5 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="consentConfirmed"
                      checked={form.consentConfirmed}
                      onChange={(e) => setField('consentConfirmed', e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]"
                    />
                    <span>
                      The candidate has consented to this check, and the details above are true.
                      {errorFor('consentConfirmed') && (
                        <span className="block text-xs font-semibold text-rose-600">
                          {errorFor('consentConfirmed')}
                        </span>
                      )}
                    </span>
                  </label>
                </section>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? 'Sending…' : 'Submit request'}
                  </button>
                  <span className="text-xs text-gray-500">
                    Aadhaar details are sent over an encrypted connection.
                  </span>
                </div>
              </form>

              {result && (
                <div className="border-t border-gray-100 p-5 sm:p-6">
                  {result.ok ? (
                    <Receipt data={result.data} />
                  ) : (
                    <div
                      className={`rounded-xl border p-4 ${
                        result.notConfigured
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-rose-200 bg-rose-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          size={20}
                          className={`mt-0.5 shrink-0 ${
                            result.notConfigured ? 'text-amber-600' : 'text-rose-600'
                          }`}
                        />
                        <div>
                          <p
                            className={`font-bold ${
                              result.notConfigured ? 'text-amber-900' : 'text-rose-900'
                            }`}
                          >
                            {result.notConfigured ? 'Not available online yet' : 'Could not send'}
                          </p>
                          <p
                            className={`mt-1 text-sm ${
                              result.notConfigured ? 'text-amber-800' : 'text-rose-800'
                            }`}
                          >
                            {result.message}
                          </p>
                          {result.notConfigured && (
                            <a
                              href={HRMS_REQUEST_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-sm font-bold text-amber-900 underline"
                            >
                              Open the HR portal directly ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-gray-900">How it works</h2>
              <ol className="mt-3 space-y-3 text-sm text-gray-600">
                {[
                  'Submit this form with the candidate’s Aadhaar number.',
                  'You get a reference and a passcode on screen straight away.',
                  'Our HR department checks it against our employment records.',
                  'HRMS emails the outcome to the official address you gave us.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-[11px] font-bold text-[#1d4ed8]">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-gray-900">Check a request</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Status and the final answer are shown on the HR portal, which is the system of
                record. Take your reference and passcode there — or the Aadhaar number and the
                email you used.
              </p>
              <a
                href={HRMS_STATUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1d4ed8] hover:underline"
              >
                Check a request status
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-gray-900">Prefer the HR portal?</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                This form submits to the same HR system. You can also raise the request there — and
                must, for a consent letter over {CONSENT_MAX_MB} MB.
              </p>
              <a
                href={HRMS_REQUEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1d4ed8] hover:underline"
              >
                Open the request form
                <ExternalLink size={14} />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/**
 * The receipt for an accepted request: { reference, passcode, email }.
 *
 * Both codes are needed to read the answer later and the passcode is shown once,
 * so they are copyable and the link to the portal sits beside them.
 */
function Receipt({ data }) {
  const [copied, setCopied] = useState(null);
  if (!data || typeof data !== 'object') return null;

  const { reference, passcode, email } = data;

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard unavailable; the value is on screen anyway */
    }
  };

  const codes = [
    ['Reference', reference],
    ['Passcode', passcode],
  ].filter(([, v]) => v);

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-emerald-900">Request received</p>

          {codes.length > 0 && (
            <>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {codes.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/70 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-emerald-900/60">
                      {label}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="break-all font-mono text-base font-bold text-emerald-900">
                        {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(label, String(value))}
                        className="shrink-0 rounded p-1 text-emerald-700 hover:bg-emerald-100"
                        aria-label={`Copy ${label}`}
                      >
                        {copied === label ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-emerald-800">
                {passcode
                  ? 'Save both — the passcode is not shown again.'
                  : 'Save this reference.'}
              </p>
            </>
          )}

          {email && (
            <p className="mt-2 text-sm text-emerald-800">
              We will email <span className="font-semibold">{email}</span> when HR has answered.
            </p>
          )}

          {codes.length === 0 && !email && (
            <p className="mt-1 text-sm text-emerald-800">
              Your request was accepted. HR will be in touch by email.
            </p>
          )}

          <a
            href={HRMS_STATUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
          >
            Check this request on the HR portal
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
