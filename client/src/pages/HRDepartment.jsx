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
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  FileText,
  Headset,
  Mail,
  Upload,
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
 *
 * Layout: hero (title, intro, Request / Check switch, verification seal) · the
 * form on a card with a progress rail, beside a side column (HR portal, How it
 * works) · a Check a request strip.
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

const WRAP = 'mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20';
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep';

const inputClass =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 ' +
  'transition focus:border-brand-deep focus:outline-none focus:ring-4 focus:ring-brand-deep/15';

// How it works: each step with its own icon and tint (no numbers).
const STEPS = [
  { text: 'Submit this form with the candidate’s Aadhaar number.', Icon: FileText, tint: 'bg-[#e8f0fc] text-[#0848a8]' },
  { text: 'You get a reference and a passcode on screen straight away.', Icon: BadgeCheck, tint: 'bg-[#efebfd] text-[#5858c8]' },
  { text: 'Our HR department checks it against our employment records.', Icon: Search, tint: 'bg-[#fdf1df] text-[#8a6413]' },
  { text: 'HRMS emails the outcome to the official address you gave us.', Icon: Mail, tint: 'bg-[#e0f4f1] text-[#0f7a6b]' },
];

const Field = ({ label, hint, required, error, children }) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-sm font-semibold text-slate-800">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
    {children}
    {hint && !error && <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">{hint}</span>}
    {error && (
      <span className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-rose-600">
        <AlertCircle size={14} className="mt-px shrink-0" aria-hidden="true" />
        {error}
      </span>
    )}
  </label>
);

/**
 * One step of the form on the progress rail: an icon mark on the left that turns
 * into a filled tick when the step is complete, joined to the next step by a
 * line that goes from dashed to solid.
 */
const Group = ({ title, Icon, done, last, children }) => (
  <fieldset className="relative min-w-0 pl-14 sm:pl-[72px]">
    {!last && (
      <span
        aria-hidden="true"
        className={`absolute left-[19px] top-12 -bottom-8 border-l-2 transition-colors duration-500 sm:left-[23px] sm:top-14 ${
          done ? 'border-solid border-brand-deep' : 'border-dashed border-slate-200'
        }`}
      />
    )}
    <span
      aria-hidden="true"
      className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full transition duration-500 sm:h-12 sm:w-12 ${
        done ? 'scale-105 bg-brand-deep text-white' : 'bg-[#e8f0fc] text-brand-deep'
      }`}
    >
      {done ? <Check size={20} strokeWidth={2.5} /> : <Icon size={20} />}
    </span>
    <legend className="float-left mb-5 flex min-h-10 w-full items-center text-lg font-bold text-brand-ink sm:min-h-12">
      {title}
    </legend>
    <div className="clear-both">{children}</div>
  </fieldset>
);

/** Hero art: a verification seal whose ring draws itself, with three chips floating round it. */
const Seal = () => (
  <div aria-hidden="true" className="hr-seal relative mx-auto flex h-[240px] w-full max-w-[360px] items-center justify-center sm:h-[300px] lg:h-[340px]">
    <svg viewBox="0 0 320 320" className="absolute h-[220px] w-[220px] overflow-visible sm:h-[280px] sm:w-[280px] lg:h-[320px] lg:w-[320px]">
      <circle className="hr-seal-dash" cx="160" cy="160" r="150" fill="none" />
      <circle className="hr-seal-ring" cx="160" cy="160" r="122" fill="none" pathLength="1" />
    </svg>
    <span className="hr-seal-core relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#e8f0fc] text-brand-deep shadow-[inset_0_0_0_10px_#fff,0_0_0_1px_rgb(15_23_42/0.08)] sm:h-[150px] sm:w-[150px] lg:h-[168px] lg:w-[168px]">
      <ShieldCheck className="h-14 w-14 sm:h-[70px] sm:w-[70px] lg:h-20 lg:w-20" strokeWidth={1.75} />
    </span>
    <span className="hr-seal-chip hr-seal-chip--1 text-[#5858c8]"><FileText size={22} /></span>
    <span className="hr-seal-chip hr-seal-chip--2 text-[#8a6413]"><Search size={22} /></span>
    <span className="hr-seal-chip hr-seal-chip--3 text-[#0f7a6b]"><Mail size={22} /></span>
  </div>
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

  // Progress rail: a step is complete once its required fields are filled.
  const personDone = Boolean(form.candidateName.trim()) && form.aadhaar.replace(/\s/g, '').length === 12;
  const askingDone = ['requesterCompany', 'requesterName', 'requesterPhone', 'requesterEmail'].every((k) =>
    String(form[k]).trim(),
  );
  const consentDone = form.consentConfirmed && !fileError;

  return (
    <div className="bg-white text-slate-800">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="hr-title">
        <div className={`${WRAP} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <h1 id="hr-title" className="text-4xl font-bold tracking-tight text-brand-ink sm:text-5xl">
              Employment Verification
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Employers, banks and background-screening agencies can use this page to verify the
              employment of a current or former Veritaz International Press team member. Our HR department reviews
              each request and emails the answer to the official address you provide.
            </p>

            {/* Request is this page; "Check an existing request" opens the HR portal. */}
            <nav aria-label="Verification" className="mt-8 inline-flex flex-wrap gap-1 rounded-full bg-[#e8f0fc] p-1">
              <span
                aria-current="page"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-brand-deep shadow-sm"
              >
                <ShieldCheck size={18} />
                <span className="hidden sm:inline">Request a verification</span>
                <span className="sm:hidden">Request</span>
              </span>
              <a
                href={HRMS_STATUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-slate-600 transition-colors hover:bg-white/60 hover:text-brand-deep ${FOCUS}`}
              >
                <Search size={18} />
                <span className="hidden sm:inline">Check an existing request</span>
                <span className="sm:hidden">Check status</span>
                <ExternalLink size={14} className="opacity-70" />
              </a>
            </nav>
          </div>

          <Seal />
        </div>
      </section>

      {/* ── Form + side column ───────────────────────────── */}
      <section className="bg-brand-snow py-16 lg:py-24" aria-label="Request a verification">
        <div className={`${WRAP} grid items-start gap-8 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] xl:gap-12`}>
          {/* Form: first in reading order and on small screens; right-hand column on wide screens. */}
          <div className="min-w-0 xl:col-start-2 xl:row-start-1">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgb(8_72_168/0.06)]">
              <form onSubmit={handleSubmit} className="space-y-10 p-6 sm:p-10">
                <Group title="The person" Icon={BadgeCheck} done={personDone}>
                  <div className="grid gap-5 sm:grid-cols-2">
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
                  </div>
                </Group>

                <Group title="Who is asking" Icon={Headset} done={askingDone}>
                  <div className="grid gap-5 sm:grid-cols-2">
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
                    <div className="sm:col-span-2">
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
                    </div>
                  </div>
                </Group>

                <Group title="Consent" Icon={FileText} done={consentDone} last>
                  <div className="space-y-5">
                    <Field
                      label="Signed consent letter"
                      hint={`PDF or image, up to ${CONSENT_MAX_MB} MB. Larger files: use the HR portal link opposite.`}
                      error={fileError || errorFor('consent')}
                    >
                      {/* The native file input on a dashed drop area. */}
                      <span
                        className={`flex min-h-[72px] items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-colors focus-within:border-brand-deep focus-within:bg-[#e8f0fc] hover:border-brand-deep hover:bg-[#e8f0fc] ${
                          fileError
                            ? 'border-dashed border-rose-400'
                            : consentFile
                              ? 'border-solid border-emerald-500'
                              : 'border-dashed border-slate-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                            consentFile ? 'bg-emerald-50 text-emerald-600' : 'bg-[#e8f0fc] text-brand-deep'
                          }`}
                        >
                          {consentFile ? <CheckCircle2 size={20} /> : <Upload size={20} />}
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          name="consent"
                          accept={CONSENT_ACCEPT}
                          onChange={handleFile}
                          className="min-w-0 flex-1 cursor-pointer text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-deep file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                        />
                      </span>
                    </Field>
                    <label className="flex items-start gap-3 rounded-xl bg-brand-snow p-4 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="consentConfirmed"
                        checked={form.consentConfirmed}
                        onChange={(e) => setField('consentConfirmed', e.target.checked)}
                        className="mt-0.5 size-5 shrink-0 rounded border-slate-300 accent-brand-deep"
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
                  </div>
                </Group>

                <div className="flex flex-col items-start gap-3 border-t border-slate-200 pt-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex h-14 items-center gap-2 rounded-full bg-brand-deep px-8 font-bold text-white transition-colors hover:bg-brand-ink disabled:opacity-60 ${FOCUS}`}
                  >
                    {submitting && <Loader2 size={18} className="animate-spin" />}
                    {submitting ? 'Sending…' : 'Submit request'}
                    {!submitting && <ArrowRight size={18} aria-hidden="true" />}
                  </button>
                  <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <ShieldCheck size={16} className="text-emerald-600" aria-hidden="true" />
                    Aadhaar details are sent over an encrypted connection.
                  </span>
                </div>
              </form>

              {result && (
                <div className="border-t border-slate-200 p-6 sm:p-10">
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

          {/* Side column: left on wide screens, sticky beside the form. */}
          <aside
            className="grid gap-5 sm:grid-cols-2 xl:sticky xl:top-28 xl:col-start-1 xl:row-start-1 xl:grid-cols-1"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-brand-ink">Prefer the HR portal?</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                This form submits to the same HR system. You can also raise the request there — and
                must, for a consent letter over {CONSENT_MAX_MB} MB.
              </p>
              <a
                href={HRMS_REQUEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`group mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-brand-deep hover:underline hover:underline-offset-4 ${FOCUS}`}
              >
                Open the request form
                <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-brand-ink">How it works</h2>
              <ol className="mt-5 space-y-4">
                {STEPS.map(({ text, Icon, tint }, i) => (
                  <li key={i} className="hr-step flex items-start gap-3 text-sm leading-relaxed text-slate-600" style={{ '--i': i }}>
                    <span aria-hidden="true" className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${tint}`}>
                      <Icon size={17} />
                    </span>
                    <span className="pt-1.5">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Check a request ──────────────────────────────── */}
      <section className="bg-white py-16 lg:py-20" aria-labelledby="hr-check">
        <div className={WRAP}>
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:flex-row lg:items-center">
            <span aria-hidden="true" className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[#e8f0fc] text-brand-deep">
              <Search size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="hr-check" className="text-xl font-bold text-brand-ink lg:text-2xl">Check a request</h2>
              <p className="mt-2 leading-relaxed text-slate-600">
                Status and the final answer are shown on the HR portal, which is the system of
                record. Take your reference and passcode there — or the Aadhaar number and the
                email you used.
              </p>
            </div>
            <a
              href={HRMS_STATUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-12 flex-none items-center gap-2 rounded-full border border-brand-deep px-6 font-bold text-brand-deep transition-colors hover:bg-brand-deep hover:text-white ${FOCUS}`}
            >
              Check a request status
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
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
                      <span className="break-all tabular-nums text-base font-bold text-emerald-900">
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
