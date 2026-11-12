import { useRef, useState } from 'react';
import {
  ShieldCheck,
  Search,
  Loader2,
  CheckCircle2,
  CircleCheck,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ArrowUpRight,
  BadgeCheck,
  FileText,
  Globe,
  Hash,
  Headset,
  KeyRound,
  Mail,
  Upload,
  UserRound,
} from 'lucide-react';

import { submitVerificationRequest } from '../services/hrVerificationService';
import { HRMS_REQUEST_URL, HRMS_STATUS_URL } from '../config/hrms';
import { Accent, Pill, Rule } from '../components/PressUI';
import { H2_FIT, SCREEN, WRAP } from '../components/pressLayout';
import { useSeo } from "../seo/useSeo";
import { PAGES } from "../seo/site";

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
 * Layout, in the site's "press" look (styles: hr2-* in styles/hr.css):
 * a navy hero (title, intro, Request / Check switch, and a signed employment
 * record with a gold foil seal) · on a lavender band, the form on a white card
 * with a progress rail of glossy badges, beside a side column (HR portal card,
 * How it works on navy) · a night-indigo Check a request card with a receipt
 * ticket to close.
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

const LOGO = '/assets/image/veritaz-logo.webp';
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-indigo';
const FOCUS_LIGHT = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

// Text inputs: a lilac-grey border dark enough to see (3.3:1 on white), indigo
// with a soft ring when focused. See .hr2-input.
const inputClass =
  'hr2-input h-12 w-full rounded-xl px-4 text-[15px] text-slate-900 placeholder:text-slate-500';

// How it works: each step with its own glossy badge (no numbers).
const STEPS = [
  { text: 'Submit this form with the candidate’s Aadhaar number.', Icon: FileText, tone: '' },
  { text: 'You get a reference and a passcode on screen straight away.', Icon: BadgeCheck, tone: 'svc-badge--pink' },
  { text: 'Our HR department checks it against our employment records.', Icon: Search, tone: 'svc-badge--amber' },
  { text: 'HRMS emails the outcome to the official address you gave us.', Icon: Mail, tone: 'svc-badge--emerald' },
];

// Points of the foil seal's scalloped edge: 24 teeth round a 100 x 100 box.
const SEAL_EDGE = Array.from({ length: 48 }, (_, i) => {
  const a = (Math.PI * i) / 24;
  const r = i % 2 ? 43 : 48;
  return `${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`;
}).join(' ');

const Field = ({ label, hint, required, error, children }) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-sm font-semibold text-vz-ink">
      {label}
      {required && <span className="ml-0.5 text-rose-600">*</span>}
    </span>
    {children}
    {hint && !error && <span className="mt-1.5 block text-xs leading-relaxed text-slate-600">{hint}</span>}
    {error && (
      <span className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-rose-600">
        <AlertCircle size={14} className="mt-px shrink-0" aria-hidden="true" />
        {error}
      </span>
    )}
  </label>
);

/**
 * One step of the form on the progress rail: a glossy badge on the left that
 * turns emerald with a tick when the step is complete, joined to the next step
 * by a dashed rail that fills with colour once this step is done.
 */
const Group = ({ title, Icon, done, last, children }) => (
  <fieldset className="relative min-w-0 pl-[60px] sm:pl-[74px]">
    {!last && <span aria-hidden="true" className={`hr2-rail ${done ? 'hr2-rail--done' : ''}`} />}
    {/* .svc-badge positions itself relatively, so a wrapper places it. */}
    <span aria-hidden="true" className="absolute left-0 top-0">
      <span className={`hr2-mark svc-badge svc-badge--sm ${done ? 'svc-badge--emerald' : ''}`}>
        {done ? (
          <Check className="relative z-10 h-5 w-5" strokeWidth={2.6} />
        ) : (
          <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
        )}
      </span>
    </span>
    <legend className="float-left mb-5 flex min-h-[46px] w-full items-center text-lg font-bold text-vz-ink">
      {title}
    </legend>
    <div className="clear-both">{children}</div>
  </fieldset>
);

/**
 * Hero art: a signed employment record on letterhead, a lavender copy behind
 * it, a gold foil seal stamped on its corner and three glossy badges for the
 * steps (form, check, email). It settles in once on load; nothing loops.
 */
function RecordArt() {
  return (
    <div aria-hidden="true" className="hr2-art">
      <span className="hr2-art-glow" />
      <span className="hr2-art-dots" />
      <span className="hr2-sheet hr2-sheet--back" />

      <div className="hr2-sheet hr2-sheet--front">
        <div className="flex items-center gap-[3cqw]">
          <span className="hr2-logo">
            <img src={LOGO} alt="" />
          </span>
          <span className="grid flex-1 gap-[1.6cqw]">
            <span className="hr2-bar hr2-bar--ink w-[78%]" />
            <span className="hr2-bar hr2-bar--violet w-1/2" />
          </span>
        </div>
        <span className="hr2-sheet-rule" />

        <div className="hr2-id">
          <span className="hr2-avatar">
            <UserRound className="hr2-ico-lg" strokeWidth={1.8} />
          </span>
          <span className="grid flex-1 gap-[1.8cqw]">
            <span className="hr2-bar hr2-bar--ink w-[70%]" />
            <span className="hr2-bar w-[90%]" />
            <span className="hr2-bar w-[55%]" />
          </span>
        </div>

        <ul className="grid gap-[2cqw]">
          {['w-[62%]', 'w-[48%]', 'w-[70%]', 'w-[40%]'].map((w, i) => (
            <li key={w} className="hr2-row">
              <CircleCheck className="hr2-ico hr2-check" strokeWidth={2.2} style={{ '--i': i }} />
              <span className={`hr2-bar ${w}`} />
              <span className="hr2-bar hr2-bar--soft ml-auto w-[16%]" />
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <svg viewBox="0 0 120 40" className="hr2-sign">
            <path
              d="M4 28 C 12 6 22 6 24 22 S 34 36 40 18 S 52 4 56 24 S 70 32 76 16 C 80 8 88 12 88 22 C 89 30 100 26 116 12"
              pathLength="1"
            />
          </svg>
          <span className="hr2-bar hr2-bar--soft mt-[0.8cqw] w-[44%]" />
        </div>
      </div>

      <span className="hr2-foil">
        <svg viewBox="0 0 100 124">
          <defs>
            <linearGradient id="hr2-foil-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fde68a" />
              <stop offset="0.45" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="hr2-foil-ribbon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset="1" stopColor="#5b21b6" />
            </linearGradient>
          </defs>
          <polygon points="30,74 46,82 38,122 30,112 20,118" fill="url(#hr2-foil-ribbon)" />
          <polygon points="70,74 54,82 62,122 70,112 80,118" fill="url(#hr2-foil-ribbon)" />
          <polygon points={SEAL_EDGE} fill="url(#hr2-foil-gold)" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="rgb(255 255 255 / 0.65)" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgb(120 53 15 / 0.35)" strokeWidth="1" strokeDasharray="2 3" />
          <ShieldCheck x={30} y={30} size={40} color="#78350f" strokeWidth={1.7} />
        </svg>
      </span>

      <span className="hr2-float hr2-float--1">
        <span className="svc-badge">
          <FileText className="relative z-10 h-6 w-6" strokeWidth={1.8} />
        </span>
      </span>
      <span className="hr2-float hr2-float--2">
        <span className="svc-badge svc-badge--amber">
          <Search className="relative z-10 h-6 w-6" strokeWidth={1.8} />
        </span>
      </span>
      <span className="hr2-float hr2-float--3">
        <span className="svc-badge svc-badge--sm svc-badge--emerald">
          <Mail className="relative z-10 h-5 w-5" strokeWidth={1.8} />
        </span>
      </span>
    </div>
  );
}

/**
 * Closing art: the receipt a request earns — the reference and the passcode
 * as blank fields on a perforated ticket, with a magnifier over its corner.
 */
function TicketArt() {
  return (
    <div aria-hidden="true" className="hr2-ticket-wrap relative">
      <div className="hr2-ticket-tilt">
        <div className="hr2-ticket">
          <div className="flex items-center gap-3">
            <span className="hr2-ticket-logo">
              <img src={LOGO} alt="" />
            </span>
            <span className="grid flex-1 gap-2">
              <span className="hr2-bar hr2-bar--ink h-2 w-[70%]" />
              <span className="hr2-bar hr2-bar--violet h-1.5 w-[45%]" />
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            <span className="hr2-ticket-field">
              <span className="svc-badge svc-badge--xs">
                <Hash className="relative z-10 h-4 w-4" strokeWidth={2} />
              </span>
              <span className="hr2-bar hr2-bar--ink h-2.5 w-[62%]" />
            </span>
            <span className="hr2-ticket-field">
              <span className="svc-badge svc-badge--xs svc-badge--pink">
                <KeyRound className="relative z-10 h-4 w-4" strokeWidth={2} />
              </span>
              <span className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="hr2-pin" />
                ))}
              </span>
            </span>
          </div>
          <span className="hr2-ticket-tear" />
          <span className="hr2-barcode" />
        </div>
        <span className="hr2-lens">
          <span className="svc-badge svc-badge--amber">
            <Search className="relative z-10 h-6 w-6" strokeWidth={1.9} />
          </span>
        </span>
      </div>
    </div>
  );
}

export default function HRDepartment() {
  useSeo(PAGES["/hr-department"]);
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
  // Marks a field invalid for assistive tech (and draws its border rose).
  const invalid = (name) => (errorFor(name) ? true : undefined);

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
    <main className="overflow-x-clip bg-white text-slate-800">
      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="hr2-hero relative isolate flex flex-col overflow-hidden text-white lg:min-h-[calc(100svh-7.6rem)]">
        <span aria-hidden="true" className="hr2-hero-grid" />
        <div
          className={`${WRAP} grid flex-1 items-center gap-12 pb-16 pt-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16 lg:py-10 short:py-6`}
        >
          <div className="min-w-0">
            <Rule tone="dark" />
            <h1
              id="hr-title"
              className="mt-6 text-[2.25rem] leading-[1.1] text-white sm:text-5xl lg:text-[clamp(2.4rem,min(3.9vw,7.2svh),3.5rem)] short:mt-4"
            >
              Employment <Accent tone="light">Verification</Accent>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/80 lg:text-[17px] short:mt-5 short:text-[15px]">
              Employers, banks and background-screening agencies can use this page to verify the
              employment of a current or former Veritaz International Press team member. Our HR department reviews
              each request and emails the answer to the official address you provide.
            </p>

            {/* Request is this page; "Check an existing request" opens the HR portal. */}
            <nav
              aria-label="Verification"
              className="mt-9 inline-flex flex-wrap gap-1 rounded-full bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur-sm short:mt-6"
            >
              <span
                aria-current="page"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-bold text-sf-indigo-deep shadow-[0_10px_24px_-10px_rgb(0_0_0/0.55)]"
              >
                <ShieldCheck size={18} className="text-sf-violet" aria-hidden="true" />
                <span className="hidden sm:inline lg:hidden xl:inline">Request a verification</span>
                <span className="sm:hidden lg:inline xl:hidden">Request</span>
              </span>
              <a
                href={HRMS_STATUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white ${FOCUS_LIGHT}`}
              >
                <Search size={18} aria-hidden="true" />
                <span className="hidden sm:inline lg:hidden xl:inline">Check an existing request</span>
                <span className="sm:hidden lg:inline xl:hidden">Check status</span>
                <ExternalLink size={14} className="opacity-75" aria-hidden="true" />
              </a>
            </nav>
          </div>

          <RecordArt />
        </div>
      </header>

      {/* ── Form + side column ───────────────────────────── */}
      <section
        className={`vz-services relative isolate overflow-clip py-16 lg:py-20 short:py-12 ${SCREEN}`}
        aria-label="Request a verification"
      >
        <span aria-hidden="true" className="hr2-band-dots" />
        <div className={`${WRAP} grid items-start gap-8 xl:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] xl:gap-12`}>
          {/* Form: first in reading order and on small screens; right-hand column on wide screens. */}
          <div className="min-w-0 xl:col-start-2 xl:row-start-1">
            <div className="hr2-card relative overflow-hidden rounded-[2rem] bg-white">
              <form onSubmit={handleSubmit} className="space-y-10 p-5 pt-8 sm:p-10 xl:p-12">
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
                        aria-invalid={invalid('candidateName')}
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
                        className={`${inputClass} tabular-nums tracking-wide`}
                        name="aadhaar"
                        value={form.aadhaar}
                        onChange={(e) => setField('aadhaar', e.target.value)}
                        aria-invalid={invalid('aadhaar')}
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
                        aria-invalid={invalid('requesterCompany')}
                        required
                      />
                    </Field>
                    <Field label="HR name" required error={errorFor('requesterName')}>
                      <input
                        className={inputClass}
                        name="requesterName"
                        value={form.requesterName}
                        onChange={(e) => setField('requesterName', e.target.value)}
                        aria-invalid={invalid('requesterName')}
                        required
                      />
                    </Field>
                    <Field label="Designation" error={errorFor('requesterDesignation')}>
                      <input
                        className={inputClass}
                        name="requesterDesignation"
                        value={form.requesterDesignation}
                        onChange={(e) => setField('requesterDesignation', e.target.value)}
                        aria-invalid={invalid('requesterDesignation')}
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
                        aria-invalid={invalid('requesterPhone')}
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
                          aria-invalid={invalid('requesterEmail')}
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
                        className={`hr2-drop flex min-h-[76px] items-center gap-4 rounded-2xl px-4 py-4 sm:px-5 ${
                          fileError ? 'hr2-drop--error' : consentFile ? 'hr2-drop--ok' : ''
                        }`}
                      >
                        {/* The badge steps aside on phones, where the input needs the room. */}
                        <span aria-hidden="true" className="hidden sm:block">
                          <span className={`svc-badge svc-badge--xs ${consentFile ? 'svc-badge--emerald' : ''}`}>
                            {consentFile ? (
                              <CheckCircle2 className="relative z-10 h-5 w-5" strokeWidth={2} />
                            ) : (
                              <Upload className="relative z-10 h-5 w-5" strokeWidth={2} />
                            )}
                          </span>
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          name="consent"
                          accept={CONSENT_ACCEPT}
                          onChange={handleFile}
                          aria-invalid={fileError || errorFor('consent') ? true : undefined}
                          className="min-w-0 flex-1 cursor-pointer text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-sf-indigo file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sf-violet"
                        />
                      </span>
                    </Field>
                    <label className="hr2-consent flex cursor-pointer items-start gap-3 rounded-2xl p-4 text-sm leading-relaxed text-slate-700">
                      <input
                        type="checkbox"
                        name="consentConfirmed"
                        checked={form.consentConfirmed}
                        onChange={(e) => setField('consentConfirmed', e.target.checked)}
                        aria-invalid={invalid('consentConfirmed')}
                        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-sf-indigo"
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

                <div className="flex flex-col items-start gap-4 border-t border-vz-line pt-8 sm:flex-row sm:items-center sm:gap-6">
                  <Pill type="submit" disabled={submitting} arrow={!submitting}>
                    {submitting && <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden="true" />}
                    {submitting ? 'Sending…' : 'Submit request'}
                  </Pill>
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <ShieldCheck size={16} className="shrink-0 text-emerald-600" aria-hidden="true" />
                    Aadhaar details are sent over an encrypted connection.
                  </span>
                </div>
              </form>

              {result && (
                <div className="border-t border-vz-line p-5 sm:p-10 xl:px-12">
                  {result.ok ? (
                    <Receipt data={result.data} />
                  ) : (
                    <div
                      role="alert"
                      className={`rounded-2xl border p-5 ${
                        result.notConfigured
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-rose-200 bg-rose-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          size={20}
                          aria-hidden="true"
                          className={`mt-0.5 shrink-0 ${
                            result.notConfigured ? 'text-amber-700' : 'text-rose-600'
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
                            className={`mt-1 text-left text-sm ${
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
                              className={`mt-2 inline-block text-sm font-bold text-amber-900 underline ${FOCUS}`}
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
          <aside className="grid gap-5 md:grid-cols-2 xl:sticky xl:top-28 xl:col-start-1 xl:row-start-1 xl:grid-cols-1">
            <div className="svc-card group relative isolate overflow-hidden rounded-3xl bg-white p-6 sm:p-8">
              <span aria-hidden="true" className="svc-card-glow" />
              <Globe className="hr2-watermark" strokeWidth={1.2} aria-hidden="true" />
              <span aria-hidden="true" className="svc-badge svc-badge--sky">
                <Globe className="relative z-10 h-6 w-6" strokeWidth={1.8} />
              </span>
              <h2 className="mt-5 text-[1.6rem] leading-tight text-vz-ink">Prefer the HR portal?</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                This form submits to the same HR system. You can also raise the request there — and
                must, for a consent letter over {CONSENT_MAX_MB} MB.
              </p>
              <a
                href={HRMS_REQUEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`group/link mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-sf-indigo hover:underline hover:underline-offset-4 ${FOCUS}`}
              >
                Open the request form
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                  className="motion-safe:transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
              </a>
            </div>

            <div className="hr2-steps relative isolate overflow-hidden rounded-3xl p-6 text-white sm:p-8">
              <span aria-hidden="true" className="hr2-steps-dots" />
              <h2 className="text-[1.6rem] leading-tight text-white">How it works</h2>
              <ol className="hr2-steps-list mt-6 grid gap-5">
                {STEPS.map(({ text, Icon, tone }) => (
                  <li key={text} className="relative flex items-start gap-4">
                    <span aria-hidden="true" className={`svc-badge svc-badge--xs ${tone}`}>
                      <Icon className="relative z-10 h-[18px] w-[18px]" strokeWidth={1.9} />
                    </span>
                    <span className="pt-1.5 text-[15px] leading-relaxed text-white/85">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Check a request ──────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-white py-16 lg:py-20 short:py-12" aria-labelledby="hr-check">
        <div className={WRAP}>
          <div className="hr2-cta relative isolate overflow-hidden rounded-[2.5rem] text-white lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center">
            <span aria-hidden="true" className="hr2-cta-dots" />
            <div className="relative z-10 px-6 pb-4 pt-12 sm:px-12 lg:py-16 lg:pl-16 xl:pl-20">
              <span aria-hidden="true" className="svc-badge svc-badge--glass">
                <Search className="relative z-10 h-6 w-6" strokeWidth={1.8} />
              </span>
              <h2 id="hr-check" className={`mt-6 ${H2_FIT} leading-[1.1] text-white`}>
                Check a <Accent tone="light">request</Accent>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 lg:text-[17px]">
                Status and the final answer are shown on the HR portal, which is the system of
                record. Take your reference and passcode there — or the Aadhaar number and the
                email you used.
              </p>
              <div className="mt-8">
                <Pill href={HRMS_STATUS_URL} target="_blank" rel="noopener noreferrer" variant="light">
                  Check a request status
                  <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" />
                </Pill>
              </div>
            </div>

            <TicketArt />
          </div>
        </div>
      </section>
    </main>
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
    <div role="status" className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="svc-badge svc-badge--sm svc-badge--emerald">
          <CheckCircle2 className="relative z-10 h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="pt-2.5 text-lg font-bold text-emerald-900">Request received</p>

          {codes.length > 0 && (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {codes.map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-dashed border-emerald-300 bg-white px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                      {label}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="break-all text-lg font-bold tabular-nums text-emerald-900">
                        {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(label, String(value))}
                        className={`shrink-0 rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100 ${FOCUS}`}
                        aria-label={`Copy ${label}`}
                      >
                        {copied === label ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-left text-xs font-semibold text-emerald-800">
                {passcode
                  ? 'Save both — the passcode is not shown again.'
                  : 'Save this reference.'}
              </p>
            </>
          )}

          {email && (
            <p className="mt-2 text-left text-sm text-emerald-800">
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
            className={`mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-emerald-700 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 ${FOCUS}`}
          >
            Check this request on the HR portal
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
