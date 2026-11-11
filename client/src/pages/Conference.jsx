import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Download,
  FilePen,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  Headset,
  Info,
  Landmark,
  Layers,
  Lock,
  Mail,
  Mic,
  Microscope,
  MonitorPlay,
  Phone,
  Presentation,
  RotateCcw,
  ShieldCheck,
  Users,
  Wallet,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { Accent, Eyebrow, Pill, Rule, Swash } from "../components/PressUI";
import { BADGE_TONES, H2_FIT, SCREEN, SCREEN_PAD, WRAP } from "../components/pressLayout";

/* A conference, in the home page's "press" look: a lavender hero with the
   poster on a violet backing (or the globe-on-a-book artwork when there is no
   poster), then one band per topic, alternating white, lavender and navy, each
   sized to one screen on wide screens. The cf-* styles live in
   styles/conference.css. */

const EMAIL = "info@veritazinternational.com";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4";
const H2 = `${H2_FIT} leading-[1.1] text-vz-ink`;
const H2_LIGHT = `${H2_FIT} leading-[1.1] text-white`;
const KICKER = "text-xs font-semibold uppercase tracking-[0.14em] text-slate-600";
const KICKER_LIGHT = "text-xs font-semibold uppercase tracking-[0.14em] text-white/75";
const CLOSED =
  "inline-flex cursor-not-allowed select-none items-center justify-center gap-2.5 rounded-full border-2 border-red-600 bg-red-50 text-[15px] font-bold text-red-700";

const GLOBE = "/assets/image/conference/conference-hero-globe.webp";
const LOGO = "/assets/image/veritaz-logo.webp";
const DESK = "/assets/image/our-company/laptop-books.webp";

/** Section backgrounds: white and lavender alternate, navy sets off the
 *  fees and the speakers. */
const BAND = { white: "vz-draft", lavender: "vz-services", navy: "vz-shelf-band text-white" };
const WAVE_FILL = { white: "#ffffff", lavender: "#f5f3ff", navy: "#111844" };
const INITIAL_TONES = ["", "cf-initials--amber", "cf-initials--pink", "cf-initials--sky", "cf-initials--emerald"];
const FEE_ICONS = { student: GraduationCap, listener: Headphones, academicians: Presentation, researchScholars: Microscope };
const FEE_COLS = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-2 lg:grid-cols-4"];

const initials = (name = "") =>
  name
    .replace(/^((Dr|Prof|Mrs|Ms|Mr)\.?\s+)+/i, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** A title split before its last word (or last `n` words), which get the italic accent. */
const splitLast = (text = "", n = 1) => {
  const words = String(text).trim().split(/\s+/);
  const last = words.splice(-n).join(" ");
  return [words.join(" "), last];
};

/** Full-screen poster viewer with zoom. Opens fitted to the screen; zoom with the
 *  buttons, + / − keys, Ctrl + scroll or a double-click; drag (or scroll) to move
 *  round a zoomed poster. Esc, the close button or a click on the backdrop closes it. */
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;
const clampZoom = (z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
const stepZoom = (dir) => (z) => clampZoom(dir > 0 ? z * 1.25 : z / 1.25);

function PosterViewer({ src, alt, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(null); // poster size that fits the screen at 100%
  const scrollRef = useRef(null);
  const closeRef = useRef(null);
  const drag = useRef(null);

  const zoomIn = () => setZoom(stepZoom(1));
  const zoomOut = () => setZoom(stepZoom(-1));

  const measure = (img) => {
    const w = img.naturalWidth || 1;
    const h = img.naturalHeight || 1;
    const scale = Math.min((window.innerWidth * 0.92) / w, (window.innerHeight - 120) / h);
    setFit({ w: w * scale, h: h * scale });
  };

  useEffect(() => {
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") setZoom(stepZoom(1));
      else if (e.key === "-" || e.key === "_") setZoom(stepZoom(-1));
      else if (e.key === "0") setZoom(1);
    };
    // Ctrl + wheel zooms. Registered natively so preventDefault can stop the browser zooming the page.
    const el = scrollRef.current;
    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(e.deltaY < 0 ? z * 1.1 : z / 1.1));
    };
    window.addEventListener("keydown", onKey);
    el?.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      el?.removeEventListener("wheel", onWheel);
    };
  }, [onClose]);

  const onPointerDown = (e) => {
    if (zoom <= 1 || e.button !== 0) return;
    const el = scrollRef.current;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const el = scrollRef.current;
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 3) d.moved = true;
    el.scrollLeft = d.left - (e.clientX - d.x);
    el.scrollTop = d.top - (e.clientY - d.y);
  };
  const onPointerUp = () => {
    setTimeout(() => {
      drag.current = null;
    }, 0);
  };

  const btn = `flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-transparent ${FOCUS} focus-visible:outline-white`;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-[1000] flex flex-col bg-sf-night/90 backdrop-blur-sm">
      <div className="flex flex-none items-center justify-end gap-1 p-3 sm:p-4">
        <div className="mr-auto flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
          <button type="button" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} aria-label="Zoom out" className={btn}>
            <ZoomOut size={20} />
          </button>
          <span className="w-14 text-center text-sm font-semibold tabular-nums text-white" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" onClick={zoomIn} disabled={zoom >= ZOOM_MAX} aria-label="Zoom in" className={btn}>
            <ZoomIn size={20} />
          </button>
          <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} aria-label="Reset zoom" className={btn}>
            <RotateCcw size={18} />
          </button>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={`${btn} bg-white/10 ring-1 ring-white/15`}>
          <X size={22} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className={`flex min-h-0 flex-1 overflow-auto px-4 pb-6 ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget && !drag.current?.moved) onClose();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={(e) => measure(e.currentTarget)}
          onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
          className="m-auto max-w-none flex-none select-none rounded-md bg-white shadow-2xl"
          style={fit ? { width: fit.w * zoom, height: fit.h * zoom } : { maxHeight: "calc(100vh - 120px)", maxWidth: "92vw" }}
        />
      </div>
    </div>,
    document.body,
  );
}

/** Violet waves along the hero's foot, melting into the band below. */
function Waves({ fill }) {
  return (
    <svg aria-hidden="true" className="vz-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cf-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#ddd6fe" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" fill="url(#cf-wave)" opacity="0.55" />
      <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill={fill} />
    </svg>
  );
}

/** A heading's opening line plus its accent last word; `light` on navy. */
function Heading({ id, text, tail = 1, light = false, className = "" }) {
  const [head, last] = splitLast(text, tail);
  return (
    <h2 id={id} className={`reveal ${light ? H2_LIGHT : H2} ${className}`}>
      {head}
      {head && " "}
      <Accent tone={light ? "light" : "dark"}>{last}</Accent>
    </h2>
  );
}

/** Initials in a white disc with a coloured ring (decorative). */
function Initials({ name, index, size = "" }) {
  return (
    <span aria-hidden="true" className={`cf-initials ${INITIAL_TONES[index % INITIAL_TONES.length]} ${size}`}>
      {initials(name)}
    </span>
  );
}

/** The hero, as a conference stage: deep navy with two soft spotlights falling
 *  from above. What the conference is, its acronym, date and mode, the
 *  actions, and the poster lit in violet (click to zoom) or, without one, the
 *  globe on an open book. */
function Hero({ conference, dates, shortDate, registrationClosed, showPoster, posterReady, onPosterLoad, onPosterError, onOpenPoster, waveFill }) {
  const [head, last] = splitLast(conference.conferencetitle);
  const chip = "cf-chip flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white";
  const hasActions = conference.registerlink || conference.brochuredownload || registrationClosed;

  return (
    <header className="cf-stage relative isolate overflow-hidden text-white lg:flex lg:min-h-[calc(100svh-7.6rem)] lg:flex-col">
      <Waves fill={waveFill} />
      <span aria-hidden="true" className="cf-beams" />
      <span aria-hidden="true" className="cf-hero-dots" />

      <div
        className={`${WRAP} grid items-center gap-14 pb-24 pt-10 lg:flex-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10 lg:pb-16 lg:pt-8 xl:gap-16 short:pb-12 short:pt-4`}
      >
        <div className="min-w-0">
          {conference.type && (
            <Eyebrow icon={MonitorPlay} tone="light">
              {conference.type}
            </Eyebrow>
          )}

          <h1 className="mt-6 short:mt-4">
            <span className="flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-[0.2em] text-sf-lavender sm:text-sm">
              <span aria-hidden="true" className="vz-rule h-0.5 w-10 flex-none" />
              International E-Conference on
            </span>{" "}
            <span className="mt-4 block text-balance text-[2.1rem] leading-[1.12] text-white [overflow-wrap:anywhere] sm:text-[2.75rem] lg:text-[clamp(2.1rem,min(3.3vw,6.3svh),3.15rem)] short:mt-3">
              {head}
              {head && " "}
              <span className="relative inline-block">
                <span className="hero-accent hero-accent--light">{last}</span>
                <Swash className="hero-swash--word" />
              </span>
            </span>
          </h1>

          {conference.conferencename && (
            <div className="hero-fade mt-7 flex max-w-xl items-center gap-4 short:mt-5">
              <p className="font-display text-xl font-bold tracking-[0.01em] text-white sm:text-2xl">({conference.conferencename})</p>
              <span aria-hidden="true" className="cf-code-line h-px flex-1" />
              <span aria-hidden="true" className="h-2 w-2 flex-none rotate-45 border-[1.5px] border-sf-lavender" />
            </div>
          )}

          <ul className="hero-fade mt-7 flex flex-wrap gap-3 short:mt-5">
            {dates.conferenceDate && (
              <li className={chip}>
                <span aria-hidden="true" className="cf-chip-icon">
                  <CalendarDays className="h-4 w-4" />
                </span>
                {shortDate(dates.conferenceDate)}
              </li>
            )}
            <li className={chip}>
              <span aria-hidden="true" className="cf-chip-icon cf-chip-icon--sky">
                <Globe className="h-4 w-4" />
              </span>
              Online Mode
            </li>
            {conference.isbn && (
              <li className={chip}>
                <span aria-hidden="true" className="cf-chip-icon cf-chip-icon--pink">
                  <BookMarked className="h-4 w-4" />
                </span>
                ISBN: {conference.isbn}
              </li>
            )}
          </ul>

          {hasActions && (
            <div className="hero-fade mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap short:mt-6">
              {registrationClosed && (
                <span aria-disabled="true" className={`${CLOSED} h-14 px-8 short:h-12`}>
                  <Lock size={18} aria-hidden="true" />
                  Registration Closed
                </span>
              )}
              {conference.registerlink && !registrationClosed && (
                <Pill href={conference.registerlink} target="_blank" rel="noreferrer" arrow>
                  Register Now
                </Pill>
              )}
              {conference.brochuredownload && (
                <Pill href={conference.brochuredownload} download variant="outline-light" icon={Download}>
                  Download Brochure
                </Pill>
              )}
            </div>
          )}
        </div>

        <figure className="relative flex min-w-0 justify-center">
          {showPoster ? (
            <div className="cf-poster-wrap relative isolate mb-[18px] mr-[18px] max-w-full">
              <span aria-hidden="true" className="cf-poster-glow" />
              <span aria-hidden="true" className="cf-dots" />
              <span aria-hidden="true" className="cf-poster-back" />
              <button
                type="button"
                onClick={onOpenPoster}
                aria-label="Zoom in on the conference poster"
                className={`cf-poster group relative block max-w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white ${FOCUS} focus-visible:outline-sf-violet`}
              >
                <img
                  src={conference.poster}
                  alt="Conference Poster"
                  fetchPriority="high"
                  className="block h-auto max-h-[460px] w-auto max-w-full object-contain motion-safe:transition-transform motion-safe:group-hover:scale-[1.03] motion-safe:duration-500 lg:max-h-[min(36rem,calc(100svh-16rem))]"
                  onLoad={onPosterLoad}
                  onError={onPosterError}
                />
                <span
                  aria-hidden="true"
                  className={`absolute bottom-4 right-4 transition-opacity duration-300 ${posterReady ? "opacity-100" : "opacity-0"}`}
                >
                  <span className="svc-badge svc-badge--sm">
                    <ZoomIn className="relative z-10 h-5 w-5" strokeWidth={2} />
                  </span>
                </span>
              </button>
            </div>
          ) : (
            <div aria-hidden="true" className="cf-globe-stage">
              <span className="cf-globe-disc" />
              <img src={GLOBE} alt="" fetchPriority="high" className="cf-globe-img" />
            </div>
          )}
        </figure>
      </div>
    </header>
  );
}

/** Key Details: the deadlines and the event date down a rail, then the
 *  register link (or the closed notice). */
function KeyDetails({ timeline, longDate, registrationClosed, registerlink, showAction }) {
  return (
    <aside aria-labelledby="conf-kd" className="cf-keycard reveal relative isolate min-w-0 overflow-hidden rounded-[1.75rem] bg-white">
      <span aria-hidden="true" className="svc-card-glow" />
      <div className="flex items-center gap-4 border-b border-vz-line px-6 py-5 sm:px-7 short:py-4">
        <span aria-hidden="true" className="svc-badge svc-badge--sm">
          <CalendarDays className="relative z-10 h-5 w-5" strokeWidth={1.8} />
        </span>
        <h2 id="conf-kd" className="text-2xl leading-tight text-vz-ink">
          Key Details
        </h2>
      </div>

      {timeline.length > 0 && (
        <ol className="relative grid gap-5 px-6 py-6 sm:px-7 short:gap-3 short:py-4">
          {timeline.length > 1 && (
            <span aria-hidden="true" className="cf-rail">
              <span className="cf-rail-fill" />
            </span>
          )}
          {timeline.map(({ value, label, Icon, tone }) => (
            <li key={label} className="relative flex items-center gap-4">
              <span aria-hidden="true" className={`svc-badge svc-badge--xs ${tone}`}>
                <Icon className="relative z-10 h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm text-slate-600">{label}</span>
                <strong className="block text-lg font-bold tabular-nums text-vz-ink short:text-base">{longDate(value)}</strong>
              </span>
            </li>
          ))}
        </ol>
      )}

      {showAction && (
        <div className={`px-6 pb-6 sm:px-7 short:pb-4 ${timeline.length ? "" : "pt-6"}`}>
          {registrationClosed && (
            <span aria-disabled="true" className={`${CLOSED} h-12 w-full`}>
              <Lock size={18} aria-hidden="true" />
              Registration Closed
            </span>
          )}
          {registerlink && !registrationClosed && (
            <Pill href={registerlink} target="_blank" rel="noreferrer" arrow className="w-full short:h-12">
              Link to Register
            </Pill>
          )}
        </div>
      )}
    </aside>
  );
}

/** About the conference: the first sentence as a lead, the rest set off as a
 *  quiet pull-quote; Key Details beside it. */
function About({ tone, about, keyDetails }) {
  const m = about ? String(about).match(/^(.+?[.!?])\s+([\s\S]*)$/) : null;
  const both = Boolean(about && keyDetails);
  return (
    <section
      id="conf-about"
      aria-labelledby={about ? "conf-about-h" : "conf-kd"}
      className={`${BAND[tone]} relative isolate scroll-mt-20 overflow-hidden ${SCREEN_PAD} ${SCREEN}`}
    >
      <div
        className={`${WRAP} grid items-center gap-12 ${both ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 xl:gap-24" : "max-w-3xl lg:max-w-4xl"}`}
      >
        {about && (
          <div className="min-w-0">
            <Eyebrow icon={Info}>About</Eyebrow>
            <Heading id="conf-about-h" text="About the Conference" className="mt-5 short:mt-3" />
            <p className="mt-7 text-[17px] font-medium leading-relaxed text-vz-ink sm:text-lg lg:text-xl short:mt-5 short:text-lg">{m ? m[1] : about}</p>
            {m && (
              <p className="cf-callout mt-6 whitespace-pre-line rounded-r-2xl py-4 pl-4 pr-2 text-[15px] leading-relaxed text-slate-700 sm:pl-5 sm:pr-4 sm:text-base lg:text-[17px] short:mt-4 short:py-3 short:text-[15px]">
                {m[2]}
              </p>
            )}
          </div>
        )}
        {keyDetails}
      </div>
    </section>
  );
}

/** Registration fees: each category's fee on a glass card in the navy band,
 *  and the bank details for direct remittance (or the payment QR code). */
function Fees({ tone, feeRows, bankdetails, hasBank }) {
  return (
    <section
      id="conf-fees"
      aria-labelledby="conf-fees-h"
      className={`${BAND[tone]} relative isolate scroll-mt-20 overflow-hidden ${SCREEN_PAD} ${SCREEN}`}
    >
      <span aria-hidden="true" className="cf-band-dots" />
      <div className={WRAP}>
        <Rule tone="dark" />
        <Heading id="conf-fees-h" text="Registration Fees (Per Paper)" tail={2} light className="mt-5 max-w-3xl short:mt-3" />

        <ul className={`mt-10 grid grid-cols-2 gap-4 lg:mt-12 lg:gap-5 short:mt-6 short:gap-3 ${FEE_COLS[Math.min(feeRows.length, 4)]}`}>
          {feeRows.map(([key, val], i) => {
            const Icon = FEE_ICONS[key] || Wallet;
            return (
              <li key={key} className="cf-glass cf-fee-card reveal relative isolate flex flex-col overflow-hidden rounded-3xl p-5 sm:p-6 short:p-4">
                <Icon className="cf-watermark" strokeWidth={1.2} aria-hidden="true" />
                <span aria-hidden="true" className={`svc-badge svc-badge--sm ${BADGE_TONES[i % BADGE_TONES.length]}`}>
                  <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="mt-5 text-sm font-semibold capitalize text-white/80 sm:text-base short:mt-3">{key.replace(/([A-Z])/g, " $1")}</span>
                <strong className="cf-fee mt-1 font-display text-[clamp(1.75rem,min(3.4vw,6svh),2.75rem)] font-bold leading-tight tabular-nums">
                  ₹ {val}/-
                </strong>
              </li>
            );
          })}
        </ul>

        <div className="cf-glass reveal mt-5 rounded-3xl p-5 sm:p-6 lg:flex lg:items-center lg:gap-10 short:mt-3 short:p-4">
          <div className="flex items-center gap-4 lg:w-64 lg:flex-none">
            <span aria-hidden="true" className="svc-badge svc-badge--sm svc-badge--emerald">
              <Landmark className="relative z-10 h-5 w-5" strokeWidth={1.8} />
            </span>
            <h3 className={`${KICKER_LIGHT} leading-relaxed`}>Secure Checkout · Direct Bank Remittance</h3>
          </div>
          {hasBank ? (
            <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:mt-0 lg:flex-1 lg:grid-cols-4">
              {[
                ["Bank", bankdetails.bankName],
                ["Name", bankdetails.accountName],
                ["A/C No", bankdetails.accountNo],
                ["IFSC", bankdetails.ifscCode],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="min-w-0 border-l-2 border-sf-lilac/40 pl-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">{k}</dt>
                    <dd className="mt-1 break-all text-base font-semibold tabular-nums text-white lg:text-[17px]">{v}</dd>
                  </div>
                ))}
            </dl>
          ) : (
            <img
              src="/assets/image/conference/ICGMRFT-QR%2031-Mar-2026.jpg"
              alt="Conference Registration QR Code"
              className="mt-5 h-40 w-40 rounded-2xl bg-white object-contain p-2 lg:mt-0"
            />
          )}
        </div>
      </div>
    </section>
  );
}

/** Downloads: the proceedings on a deep violet card with a bound volume
 *  beside its button, and the session certificates as a list of cards. */
function Downloads({ tone, conference, certificates, hasProceedings }) {
  const hasCertificates = certificates.length > 0;
  return (
    <section
      id="conf-downloads"
      aria-labelledby="conf-downloads-h"
      className={`${BAND[tone]} relative isolate scroll-mt-20 overflow-hidden ${SCREEN_PAD} ${SCREEN}`}
    >
      <div className={WRAP}>
        <Eyebrow icon={Download}>Downloads</Eyebrow>
        <Heading id="conf-downloads-h" text="Conference Downloads" className="mt-5 short:mt-3" />

        <div
          className={`mt-10 grid gap-6 lg:mt-12 lg:gap-8 short:mt-6 short:gap-4 ${hasProceedings && hasCertificates ? "lg:grid-cols-2 lg:items-stretch" : ""}`}
        >
          {hasProceedings && (
            <article className="cf-proc reveal relative isolate flex flex-col justify-center overflow-hidden rounded-[1.75rem] p-6 text-white sm:p-8 lg:p-10 short:p-6">
              <span aria-hidden="true" className="cf-proc-dots" />
              <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <span aria-hidden="true" className="svc-badge svc-badge--glass">
                    <FileText className="relative z-10 h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <p className="mt-6 text-left text-xs font-semibold uppercase tracking-[0.14em] text-sf-lavender short:mt-4">Official Research Compilation</p>
                  <h3 className="mt-2 text-2xl font-bold leading-tight lg:text-[1.75rem]">Conference Proceedings</h3>
                  {conference.isbn && <p className="mt-2 text-left text-sm tabular-nums text-white/80">ISBN {conference.isbn}</p>}
                  <Pill href={conference.proceedingsdownload} download variant="light" icon={Download} className="mt-8 short:mt-5">
                    Download Proceedings
                  </Pill>
                </div>
                <span aria-hidden="true" className="cf-volume">
                  <span className="cf-volume-cover">
                    <span className="cf-volume-band" />
                    <img src={LOGO} alt="" loading="lazy" />
                    <span className="cf-volume-lines" />
                  </span>
                </span>
              </div>
            </article>
          )}

          {hasCertificates && (
            <div className="min-w-0 lg:flex lg:flex-col lg:justify-center">
              <h3 className={`${KICKER} flex items-center gap-3`}>
                <span aria-hidden="true" className="vz-rule h-0.5 w-8" />
                Download Certificates
              </h3>
              <ul className="mt-4 grid gap-3 short:mt-3 short:gap-2">
                {certificates.map((track, idx) => (
                  <li
                    key={idx}
                    className="svc-card reveal relative isolate grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 overflow-hidden rounded-2xl bg-white p-4 sm:flex sm:gap-5 sm:px-5 short:py-3"
                  >
                    <span aria-hidden="true" className="svc-card-glow" />
                    <span aria-hidden="true" className={`svc-badge svc-badge--sm ${BADGE_TONES[(idx + 1) % BADGE_TONES.length]}`}>
                      <Award className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-vz-ink">{track.name || `Track 0${idx + 1}`}</span>
                      <span className="block text-sm text-slate-600">Conference Session Track</span>
                    </span>
                    <a
                      href={track.file}
                      download
                      className={`relative z-10 col-start-2 inline-flex h-11 items-center gap-2 justify-self-start whitespace-nowrap rounded-full border-2 border-sf-indigo/25 px-4 text-sm font-bold text-sf-indigo transition-colors hover:border-sf-indigo hover:bg-sf-indigo hover:text-white ${FOCUS} focus-visible:outline-sf-violet`}
                    >
                      <Download size={16} aria-hidden="true" />
                      Download PDF
                    </a>
                  </li>
                ))}
              </ul>

              <div className="cf-verify reveal mt-6 rounded-2xl p-4 sm:p-5 short:mt-4 short:p-3">
                <span className={`${KICKER} flex items-center gap-2`}>
                  <Info size={15} aria-hidden="true" />
                  Verification Details
                </span>
                <ul className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-vz-ink short:mt-2">
                  {conference.conferencestatus && (
                    <li className="cf-tag">
                      <BadgeCheck size={17} aria-hidden="true" className="text-emerald-600" />
                      <span className="sr-only">Status: </span>
                      {conference.conferencestatus}
                    </li>
                  )}
                  <li className="cf-tag">
                    <ShieldCheck size={17} aria-hidden="true" className="text-sf-indigo" />
                    <span className="sr-only">Security: </span>
                    Verified Records
                  </li>
                  {conference.conferencevalidity && (
                    <li className="cf-tag">
                      <CalendarCheck size={17} aria-hidden="true" className="text-sf-violet" />
                      <span className="sr-only">Validity: </span>
                      {conference.conferencevalidity}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Topics and tracks: the heading over a desk photo on the left, the numbered
 *  topics two by two on the right. */
function Topics({ tone, topics }) {
  return (
    <section
      id="conf-tracks"
      aria-labelledby="conf-tracks-h"
      className={`${BAND[tone]} relative isolate scroll-mt-20 overflow-hidden ${SCREEN_PAD} ${SCREEN}`}
    >
      <div className={`${WRAP} grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-center lg:gap-16`}>
        <div className="min-w-0">
          <Eyebrow icon={Layers}>Topics</Eyebrow>
          <Heading id="conf-tracks-h" text="Conference Topics & Tracks" className="mt-5 short:mt-3" />
          <div aria-hidden="true" className="cf-desk relative mt-12 hidden lg:block short:mt-8">
            <img src={DESK} alt="" loading="lazy" className="reveal relative h-[min(22rem,calc(100svh-24rem))] w-full max-w-sm rounded-[1.75rem] object-cover object-[50%_62%]" />
          </div>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 lg:gap-4 short:gap-2.5">
          {topics.map((topic, i) => (
            <li key={i} className="svc-card reveal relative isolate flex items-center gap-4 overflow-hidden rounded-2xl bg-white px-5 py-4 short:py-3">
              <span aria-hidden="true" className="svc-card-glow" />
              <span aria-hidden="true" className="cf-num w-10 flex-none font-display text-[1.75rem] font-bold leading-none tabular-nums short:text-2xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="h-8 w-px flex-none bg-vz-line" />
              <span className="font-semibold leading-snug text-vz-ink">{topic}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** A speaker's photo in a gradient ring; initials if there is no photo or it fails to load. */
function SpeakerPhoto({ src, name }) {
  const [failed, setFailed] = useState(!src);
  return (
    <span className="cf-speaker-photo">
      {failed ? (
        <span aria-hidden="true" className="flex items-center justify-center bg-sf-mist font-display text-4xl font-bold text-sf-indigo-deep">
          {initials(name)}
        </span>
      ) : (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />
      )}
    </span>
  );
}

/** Keynote speakers: portraits in gradient rings on glass cards in the navy band. */
function Keynotes({ tone, speakers, getAssetUrl }) {
  const light = tone === "navy";
  return (
    <section
      id="conf-keynotes"
      aria-labelledby="conf-keynotes-h"
      className={`${BAND[tone]} relative isolate scroll-mt-20 overflow-hidden ${SCREEN_PAD} ${SCREEN}`}
    >
      <span aria-hidden="true" className="cf-band-dots" />
      <div className={WRAP}>
        <div className="text-center">
          <Eyebrow icon={Mic} tone={light ? "light" : "dark"}>
            Expert Insights
          </Eyebrow>
          <Heading id="conf-keynotes-h" text="Keynote Speakers" light={light} className="mt-5 short:mt-3" />
        </div>

        <ul className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6 short:mt-6">
          {speakers.map((speaker, idx) => (
            <li
              key={idx}
              className={`${light ? "cf-glass cf-glass--hover" : "svc-card bg-white"} reveal relative isolate flex flex-col items-center overflow-hidden rounded-3xl px-6 pb-7 pt-8 text-center short:pb-5 short:pt-5`}
            >
              <span aria-hidden="true" className="cf-spot" />
              <SpeakerPhoto src={speaker.image ? getAssetUrl(speaker.image) : ""} name={speaker.name} />
              <h3 className={`mt-6 text-lg font-bold leading-snug short:mt-4 ${light ? "text-white" : "text-vz-ink"}`}>{speaker.name}</h3>
              <p className={`mt-1 text-sm font-semibold ${light ? "text-amber-300" : "text-sf-indigo"}`}>{speaker.designation}</p>
              <p className={`mt-1 text-sm ${light ? "text-white/75" : "text-slate-600"}`}>{speaker.institution}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Committee members as cards: initials, name, designation, institution. */
function People({ tone, id, tag, title, people }) {
  return (
    <section
      id={`conf-${id}`}
      aria-labelledby={`conf-${id}-h`}
      className={`${BAND[tone]} relative isolate scroll-mt-20 overflow-hidden ${SCREEN_PAD} ${SCREEN}`}
    >
      <div className={WRAP}>
        <Eyebrow icon={Users}>{tag}</Eyebrow>
        <Heading id={`conf-${id}-h`} text={title} className="mt-5 short:mt-3" />

        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12 xl:grid-cols-3 short:mt-6 short:gap-3">
          {people.map((p, idx) => (
            <li key={idx} className="svc-card reveal relative isolate flex items-start gap-4 overflow-hidden rounded-3xl bg-white p-5 sm:gap-5 sm:p-6 short:p-4">
              <span aria-hidden="true" className="svc-card-glow" />
              <Initials name={p.name} index={idx} />
              <span className="min-w-0">
                <h3 className="text-[17px] font-bold leading-snug text-vz-ink">{p.name}</h3>
                {p.designation && <span className="mt-1 block text-sm font-semibold text-sf-indigo">{p.designation}</span>}
                {(p.institution || p.location) && (
                  <span className="mt-1 block text-sm text-slate-600">
                    {p.institution}
                    {p.location && ` (${p.location})`}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Need assistance: a night-indigo card with the enquiries email and the
 *  conveners' phone numbers. */
function Help({ tone, conference, organizers }) {
  return (
    <section id="conf-contact" aria-labelledby="conf-help" className={`${BAND[tone]} relative isolate overflow-hidden py-16 lg:py-20 short:py-12`}>
      <div className={WRAP}>
        <div
          className={`cf-help relative isolate grid gap-10 overflow-hidden rounded-[2.5rem] px-6 py-10 text-white sm:px-12 sm:py-12 lg:items-center lg:gap-16 lg:px-16 lg:py-16 ${organizers.length ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"}`}
        >
          <span aria-hidden="true" className="cf-help-dots" />
          <div className="relative min-w-0">
            <Eyebrow tone="light" icon={Headset}>
              Contact
            </Eyebrow>
            <Heading id="conf-help" text="Need Assistance?" light className="mt-5" />
            <p className="mt-5 text-base leading-relaxed text-white/85 lg:text-[17px]">
              Contact the conveners for submissions, enquiries or registration.
            </p>
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(conference.conferencename || "Conference enquiry")}`}
              className={`mt-8 inline-flex min-h-14 max-w-full items-center gap-3 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-vz-ink shadow-[0_14px_30px_-12px_rgb(0_0_0/0.45)] transition-colors hover:bg-sf-mist sm:px-7 ${FOCUS} focus-visible:outline-white`}
            >
              <Mail className="h-5 w-5 flex-none text-sf-indigo" aria-hidden="true" />
              <span className="min-w-0 break-all">{EMAIL}</span>
            </a>
          </div>

          {organizers.length > 0 && (
            <div className="relative min-w-0">
              <h3 className={`${KICKER_LIGHT} flex items-center gap-3`}>
                <span aria-hidden="true" className="vz-rule h-0.5 w-8" />
                Conference Conveners
              </h3>
              <ul className="mt-4 grid gap-3">
                {organizers.map((member, idx) => (
                  <li key={idx} className="cf-glass cf-glass--hover flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl px-4 py-4 sm:flex-nowrap sm:px-5">
                    <Initials name={member.name} index={idx + 1} size="cf-initials--glass" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-white">{member.name}</span>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300">{member.role || "Convener"}</span>
                    </span>
                    {member.mobile && (
                      <a
                        href={`tel:${String(member.mobile).replace(/[^\d+]/g, "")}`}
                        className={`ml-16 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-white/30 px-4 font-semibold tabular-nums text-white transition-colors hover:border-white hover:bg-white hover:text-vz-ink sm:ml-0 ${FOCUS} focus-visible:outline-white`}
                      >
                        <Phone size={16} aria-hidden="true" />
                        {member.mobile}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {organizers.length === 0 && (
            <div aria-hidden="true" className="cf-help-art relative hidden lg:block">
              <span className="cf-help-ring cf-help-ring--1" />
              <span className="cf-help-ring cf-help-ring--2" />
              <span className="cf-help-ring cf-help-ring--3" />
              <span className="cf-help-badge">
                <span className="svc-badge">
                  <Mail className="relative z-10 h-7 w-7" strokeWidth={1.8} />
                </span>
              </span>
              <span className="cf-help-badge cf-help-badge--a">
                <span className="svc-badge svc-badge--sm svc-badge--amber">
                  <Headset className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                </span>
              </span>
              <span className="cf-help-badge cf-help-badge--b">
                <span className="svc-badge svc-badge--sm svc-badge--sky">
                  <Globe className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// The section bar: a short name and the anchor for each band.
const BAND_NAV = {
  about: ["About", "conf-about"],
  fees: ["Fees", "conf-fees"],
  downloads: ["Downloads", "conf-downloads"],
  topics: ["Topics", "conf-tracks"],
  keynotes: ["Speakers", "conf-keynotes"],
  advisory: ["Committee", "conf-advisory"],
  experts: ["Experts", "conf-experts"],
  help: ["Contact", "conf-contact"],
};

/** The section bar under the hero: a link to each band this conference has,
 *  the one in view marked as you scroll. It sticks under the site navbar,
 *  floating over the top of the bands. */
function SectionNav({ keys }) {
  const [current, setCurrent] = useState(keys[0]);
  const keyList = keys.join(",");

  useEffect(() => {
    const list = keyList.split(",");
    const byId = Object.fromEntries(list.map((k) => [BAND_NAV[k][1], k]));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(byId[entry.target.id]);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    list.forEach((k) => {
      const el = document.getElementById(BAND_NAV[k][1]);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [keyList]);

  return (
    <nav aria-label="On this page" className="cf-subnav sticky top-[72px] z-30 h-0 lg:top-20">
      <div className={WRAP}>
        <ul className="cf-subnav-bar mx-auto mt-3 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full p-1.5">
          {keys.map((k) => (
            <li key={k} className="flex-none">
              <a
                href={`#${BAND_NAV[k][1]}`}
                aria-current={current === k ? "true" : undefined}
                className={`cf-subnav-link block rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${FOCUS} focus-visible:outline-sf-violet`}
              >
                {BAND_NAV[k][0]}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default function Conference() {
  const { confname } = useParams();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failedPoster, setFailedPoster] = useState(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(null);
  // The time the page opened, for deciding whether registration has closed.
  const [now] = useState(() => Date.now());
  const closePoster = useCallback(() => setPosterOpen(false), []);

  useEffect(() => {
    const fetchConference = async () => {
      try {
        const { data, error } = await supabase
          .from("veritaz_conferences")
          .select("*");

        if (error) throw error;

        const conferences = data || [];

        console.log("All Conferences:", conferences);
        console.log("URL confname:", confname);

        const selectedConference = conferences.find((item) => {
          const itemName = item.conferencename || item.conferenceName || "";
          return itemName.replace(/\s+/g, "-").toLowerCase() === confname;
        });

        console.log("Selected:", selectedConference);

        if (selectedConference) {
          const normalize = (value, fallback) => {
            if (!value) return fallback;

            if (typeof value === "string") {
              try {
                return JSON.parse(value);
              } catch {
                return fallback;
              }
            }

            return value;
          };

          setConference({
            ...selectedConference,

            topics: normalize(selectedConference.topics, []),
            speakers: normalize(selectedConference.speakers, []),
            organizingcommittee: normalize(selectedConference.organizingcommittee, []),
            advisorycommittee: normalize(selectedConference.advisorycommittee, []),
            globalexperts: normalize(selectedConference.globalexperts, []),
            certificatesdownload: normalize(selectedConference.certificatesdownload, []),

            fees: normalize(selectedConference.fees, {}),

            dates: normalize(selectedConference.dates, {}),

            bankdetails: normalize(selectedConference.bankdetails, {}),
          });
        } else {
          setConference(null);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConference();
  }, [confname]);

  useEffect(() => {
        document.title = "Conference Paper Listings";

        // 1. Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = "description";
          document.head.appendChild(metaDescription);
        }
        metaDescription.content = "Explore academic conferences, research symposiums, and publishing workshops hosted by Veritaz International. Join scholarly discussions and events.";

        // 2. Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = "keywords";
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = "Veritaz conferences, academic conferences India, research symposiums, publishing workshops, scholarly events, author seminars, academic webinars Veritaz";

        // 3. Robots Tag
        let metaRobots = document.querySelector('meta[name="robots"]');
        if (!metaRobots) {
          metaRobots = document.createElement('meta');
          metaRobots.name = "robots";
          document.head.appendChild(metaRobots);
        }
        metaRobots.content = "index, follow";

        // 4. Canonical Link
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.rel = "canonical";
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = "https://www.veritazinternational.com/conferences";
      }, []);

  if (loading) {
    return (
      <main className="vz-hero-v2 flex min-h-[calc(100svh-7.6rem)] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5">
          <span aria-hidden="true" className="h-12 w-12 rounded-full border-4 border-sf-indigo/15 border-t-sf-violet motion-safe:animate-spin" />
          <h2 className="text-xl text-vz-ink motion-safe:animate-pulse">Loading Conference Details...</h2>
        </div>
      </main>
    );
  }

  if (!conference || conference.message) {
    return (
      <main className="vz-hero-v2 flex min-h-[calc(100svh-7.6rem)] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <Rule />
          <h2 className={`${H2_FIT} leading-[1.1] text-vz-ink`}>Conference Not Found</h2>
        </div>
      </main>
    );
  }

  const getAssetUrl = (path) => {
    if (!path) return "";

    // Prepend the backend server host domain if it's a local relative path
    let fullUrl = path;
    if (!path.startsWith("http://") && !path.startsWith("https://")) {
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      fullUrl = `http://localhost:5000/${cleanPath}`;
    }

    // Encode spaces and special characters so <img> components can load them cleanly
    return encodeURI(fullUrl);
  };

  // Safe checks for validation variables
  const hasData = (field) => {
    if (!field) return false;
    if (Array.isArray(field) && field.length === 0) return false;
    if (typeof field === "object" && Object.values(field).every(val => !val)) return false;
    return true;
  };

  const parseJSONField = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    try { return JSON.parse(str); } catch { return []; }
  };

  const parsedCertificates = parseJSONField(conference.certificatesdownload);

  const dates = conference.dates || {};
  // Real posters are photos; an SVG in the poster field is a generated QR code
  // (e.g. ICMARD), which should not be shown as the hero artwork.
  const posterIsQr = /\.svg$/i.test((conference.poster || "").split(/[?#]/)[0]);
  const showPoster = Boolean(conference.poster) && !posterIsQr && failedPoster !== conference.poster;
  const hasProceedings = Boolean(conference.proceedingsdownload);
  const hasCertificates = parsedCertificates.length > 0;
  const hasOrganizers = hasData(conference.organizingcommittee);
  const hasAdvisory = hasData(conference.advisorycommittee);

  const shortDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const longDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Registration closes once the conference day is over (from the next day, local time).
  const registrationClosed = (() => {
    if (!dates.conferenceDate) return false;
    const end = new Date(dates.conferenceDate);
    if (Number.isNaN(end.getTime())) return false;
    end.setHours(23, 59, 59, 999);
    return now > end.getTime();
  })();

  // Key Details timeline: the deadlines, then the conference date.
  const timeline = [
    { value: dates.abstractSubmission, label: "Abstract Submission Deadline", Icon: FilePen, tone: "svc-badge--sky" },
    { value: dates.fullPaperSubmission, label: "Full Paper Submission Deadline", Icon: BookOpen, tone: "svc-badge--pink" },
    { value: dates.conferenceDate, label: "Event Date", Icon: CalendarCheck, tone: "" },
  ].filter((d) => d.value);
  const feeRows = Object.entries(conference.fees || {}).filter(([, val]) => val);
  const hasSidebar = timeline.length > 0 || feeRows.length > 0 || Boolean(conference.registerlink);
  const showAction = Boolean(conference.registerlink) || registrationClosed;

  // The bands below the hero, in order; each shows only when the conference
  // has content for it. White and lavender alternate; the fees and the
  // speakers sit on navy.
  const bands = [];
  if (conference.about || hasSidebar) {
    bands.push({
      key: "about",
      render: (tone) => (
        <About
          tone={tone}
          about={conference.about}
          keyDetails={
            hasSidebar && (
              <KeyDetails
                timeline={timeline}
                longDate={longDate}
                registrationClosed={registrationClosed}
                registerlink={conference.registerlink}
                showAction={showAction}
              />
            )
          }
        />
      ),
    });
  }
  if (feeRows.length > 0) {
    bands.push({
      key: "fees",
      dark: true,
      render: (tone) => (
        <Fees tone={tone} feeRows={feeRows} bankdetails={conference.bankdetails || {}} hasBank={hasData(conference.bankdetails)} />
      ),
    });
  }
  if (hasProceedings || hasCertificates) {
    bands.push({
      key: "downloads",
      render: (tone) => (
        <Downloads tone={tone} conference={conference} certificates={parsedCertificates} hasProceedings={hasProceedings} />
      ),
    });
  }
  if (hasData(conference.topics)) {
    bands.push({ key: "topics", render: (tone) => <Topics tone={tone} topics={conference.topics} /> });
  }
  if (hasData(conference.speakers)) {
    bands.push({
      key: "keynotes",
      dark: true,
      render: (tone) => <Keynotes tone={tone} speakers={conference.speakers} getAssetUrl={getAssetUrl} />,
    });
  }
  if (hasAdvisory) {
    bands.push({
      key: "advisory",
      render: (tone) => <People tone={tone} id="advisory" tag="People" title="Advisory Committee" people={conference.advisorycommittee} />,
    });
  }
  if (hasData(conference.globalexperts)) {
    bands.push({
      key: "experts",
      render: (tone) => (
        <People tone={tone} id="experts" tag="Advisory Committee" title="Meet Our Global Experts" people={conference.globalexperts} />
      ),
    });
  }
  bands.push({
    key: "help",
    render: (tone) => <Help tone={tone} conference={conference} organizers={hasOrganizers ? conference.organizingcommittee : []} />,
  });

  let lights = 0;
  let prevDark = false;
  const toned = bands.map((b) => {
    const dark = Boolean(b.dark) && !prevDark;
    prevDark = dark;
    return { ...b, tone: dark ? "navy" : lights++ % 2 ? "lavender" : "white" };
  });

  return (
    <main className="cf-page overflow-x-clip bg-white text-slate-800">
      <Hero
        conference={conference}
        dates={dates}
        shortDate={shortDate}
        registrationClosed={registrationClosed}
        showPoster={showPoster}
        posterReady={posterLoaded === conference.poster}
        onPosterLoad={() => setPosterLoaded(conference.poster)}
        onPosterError={() => setFailedPoster(conference.poster)}
        onOpenPoster={() => setPosterOpen(true)}
        waveFill={WAVE_FILL[toned[0].tone]}
      />

      {posterOpen && showPoster && (
        <PosterViewer src={conference.poster} alt="Conference Poster" onClose={closePoster} />
      )}

      <SectionNav keys={toned.map((b) => b.key)} />

      {toned.map((b) => (
        <Fragment key={b.key}>{b.render(b.tone)}</Fragment>
      ))}
    </main>
  );
}
