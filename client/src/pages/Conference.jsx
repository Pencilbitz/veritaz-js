import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookMarked,
  CalendarCheck,
  CalendarDays,
  Download,
  FileText,
  Globe,
  Info,
  Lock,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";
const EMAIL = "info@veritazinternational.com";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4";
const KICKER = "text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";

// Brand tints. Repeated items cycle through them; each content block's tag has its own.
const TONE = {
  blue: { bg: "bg-[#e8f0fc]", ink: "text-[#0848a8]", solid: "group-hover:bg-[#0848a8]", hover: "hover:bg-[#e8f0fc]", inkHover: "group-hover:text-[#0848a8]" },
  cyan: { bg: "bg-[#e0f5fa]", ink: "text-[#0d7f99]", solid: "group-hover:bg-[#0d7f99]", hover: "hover:bg-[#e0f5fa]", inkHover: "group-hover:text-[#0d7f99]" },
  violet: { bg: "bg-[#efebfd]", ink: "text-[#5858c8]", solid: "group-hover:bg-[#5858c8]", hover: "hover:bg-[#efebfd]", inkHover: "group-hover:text-[#5858c8]" },
  gold: { bg: "bg-[#fdf1df]", ink: "text-[#8a6413]", solid: "group-hover:bg-[#8a6413]", hover: "hover:bg-[#fdf1df]", inkHover: "group-hover:text-[#8a6413]" },
  teal: { bg: "bg-[#e0f4f1]", ink: "text-[#0f7a6b]", solid: "group-hover:bg-[#0f7a6b]", hover: "hover:bg-[#e0f4f1]", inkHover: "group-hover:text-[#0f7a6b]" },
  rose: { bg: "bg-[#fde8f0]", ink: "text-[#c0306a]", solid: "group-hover:bg-[#c0306a]", hover: "hover:bg-[#fde8f0]", inkHover: "group-hover:text-[#c0306a]" },
};
const TONE_LIST = [TONE.blue, TONE.cyan, TONE.violet, TONE.gold, TONE.teal, TONE.rose];

const initials = (name = "") =>
  name
    .replace(/^((Dr|Prof|Mrs|Ms|Mr)\.?\s+)+/i, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** Decorative backdrop for the hero: a blue glow swooping in from the top-right. */
function HeroBackdrop() {
  return (
    <>
      <svg aria-hidden="true" className="conf-hero-swoosh" viewBox="0 0 800 640" preserveAspectRatio="xMaxYMin slice">
        <defs>
          <linearGradient id="confSwoosh" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0878e8" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#5858c8" stopOpacity="0.18" />
            <stop offset="1" stopColor="#5858c8" stopOpacity="0" />
          </linearGradient>
          <filter id="confSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>
        <path d="M800 0 L800 520 C 720 330, 560 150, 300 0 Z" fill="url(#confSwoosh)" filter="url(#confSoft)" />
        <path d="M800 470 C 720 300, 570 140, 340 0" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
        <path d="M800 420 C 730 280, 600 140, 400 0" fill="none" stroke="#0878e8" strokeWidth="1" opacity="0.35" />
      </svg>
    </>
  );
}

// A few simple light lines behind the poster over a soft blue-violet glow: one
// long curve on each side that swings out past the poster's edge, a fainter arc
// crossing the left one, and a sparkle on each. Drawn in a 760 x 640 box centred
// on the poster, which covers roughly x 175-585.
const LIGHT_LINES = [
  { d: "M200 -10 C 60 120, 40 300, 120 420 S 230 600, 160 660", width: 1.6, opacity: 1 },
  { d: "M175 120 C 20 220, 40 420, 190 560", width: 1.2, opacity: 0.7 },
  { d: "M560 -10 C 700 120, 720 300, 640 420 S 530 600, 600 660", width: 1.6, opacity: 1 },
];
const SPARKLES = [
  { x: 120, y: 420, r: 16 },
  { x: 68, y: 325, r: 11 },
  { x: 640, y: 420, r: 16 },
];

function PosterStreaks() {
  return (
    <svg aria-hidden="true" className="conf-streaks" viewBox="0 0 760 640" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="confSparkle">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#dbe8ff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#7fb6ff" stopOpacity="0" />
        </radialGradient>
        <filter id="confGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g fill="none" stroke="#ffffff" filter="url(#confGlow)">
        {LIGHT_LINES.map(({ d, width, opacity }) => (
          <path key={d} d={d} strokeWidth={width} opacity={opacity} />
        ))}
      </g>

      {SPARKLES.map(({ x, y, r }, i) => (
        <g key={`${x}-${y}`} className="conf-sparkle" style={{ "--s": i }}>
          <circle cx={x} cy={y} r={r} fill="url(#confSparkle)" />
          <circle cx={x} cy={y} r="2.2" fill="#ffffff" />
        </g>
      ))}
    </svg>
  );
}

/** Hero globe for conferences without a poster: a drawn sphere whose meridians
 *  narrow and widen as it turns, with an orbit ring around it. It turns slowly
 *  on its own and speeds up while the page is scrolled, then eases back. Still
 *  when the visitor prefers reduced motion. */
const GLOBE_R = 78;
const MERIDIANS = [0, 30, 60, 90, 120, 150];
const PARALLELS = [-52, -26, 0, 26, 52];

function SpinningGlobe() {
  const meridianRefs = useRef([]);
  const orbitRef = useRef(null);

  useEffect(() => {
    const draw = (deg) => {
      MERIDIANS.forEach((offset, i) => {
        const el = meridianRefs.current[i];
        if (el) el.setAttribute("rx", (GLOBE_R * Math.abs(Math.cos(((deg + offset) * Math.PI) / 180))).toFixed(2));
      });
      if (orbitRef.current) orbitRef.current.style.transform = `rotateX(74deg) rotateZ(${(deg * 0.6) % 360}deg)`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(20);
      return undefined;
    }

    const BASE = 18; // degrees per second when idle
    const MAX_BOOST = 420;
    let angle = 0;
    let boost = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let frame;

    const onScroll = () => {
      const y = window.scrollY;
      boost = Math.min(MAX_BOOST, boost + Math.abs(y - lastY) * 1.6);
      lastY = y;
    };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      boost *= Math.exp(-dt * 2.5);
      angle = (angle + (BASE + boost) * dt) % 360;
      draw(angle);
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="conf-globe relative z-10">
      <svg viewBox="0 0 200 200" className="conf-globe-svg h-full w-full" focusable="false">
        <defs>
          <radialGradient id="confGlobeSphere" cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#e9f8fc" />
            <stop offset="45%" stopColor="#29a6db" />
            <stop offset="100%" stopColor="#064bae" />
          </radialGradient>
          <radialGradient id="confGlobeShine" cx="34%" cy="28%" r="30%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="confGlobeClip">
            <circle cx="100" cy="100" r={GLOBE_R} />
          </clipPath>
        </defs>
        <circle cx="100" cy="100" r={GLOBE_R} fill="url(#confGlobeSphere)" />
        <g clipPath="url(#confGlobeClip)" fill="none" stroke="#ffffff" strokeOpacity=".55" strokeWidth="1.2">
          {PARALLELS.map((y) => (
            <ellipse
              key={y}
              cx="100"
              cy={100 + y}
              rx={Math.sqrt(GLOBE_R * GLOBE_R - y * y)}
              ry={Math.max(4, 14 - Math.abs(y) / 6)}
            />
          ))}
          {MERIDIANS.map((offset, i) => (
            <ellipse
              key={offset}
              ref={(el) => {
                meridianRefs.current[i] = el;
              }}
              cx="100"
              cy="100"
              rx={GLOBE_R * Math.abs(Math.cos((offset * Math.PI) / 180))}
              ry={GLOBE_R}
            />
          ))}
        </g>
        <circle cx="100" cy="100" r={GLOBE_R} fill="url(#confGlobeShine)" />
        <circle cx="100" cy="100" r={GLOBE_R} fill="none" stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.5" />
      </svg>
      <span ref={orbitRef} className="conf-orbit">
        <span />
        <span />
      </span>
    </div>
  );
}

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
    <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-[1000] flex flex-col bg-slate-950/90 backdrop-blur-sm">
      <div className="flex flex-none items-center justify-end gap-1 p-3 sm:p-4">
        <div className="mr-auto flex items-center gap-1 rounded-full bg-white/10 p-1">
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
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={`${btn} bg-white/10`}>
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

/** Small coloured label above each block heading. */
function Tag({ tone, white = false, children }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${white ? "bg-white" : tone.bg} ${tone.ink}`}>
      {children}
    </span>
  );
}

/** A titled block in the main column; every block after the first sits below a rule. */
function Block({ id, tag, tone, title, children, first }) {
  return (
    <section
      id={`conf-${id}`}
      aria-labelledby={`conf-${id}-h`}
      className={`reveal scroll-mt-28 ${first ? "" : "mt-14 border-t border-slate-200 pt-14 lg:mt-16 lg:pt-16"}`}
    >
      <div className="mb-8">
        <Tag tone={tone}>{tag}</Tag>
        <h2 id={`conf-${id}-h`} className="mt-3 text-2xl font-bold tracking-tight text-brand-ink lg:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** About text: the first sentence as a lead-in, the rest as body text. */
function AboutText({ text }) {
  const m = String(text).match(/^(.+?[.!?])\s+([\s\S]*)$/);
  return (
    <>
      <p className="text-xl font-medium leading-relaxed text-brand-ink">{m ? m[1] : text}</p>
      {m && <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">{m[2]}</p>}
    </>
  );
}

/** Speaker photo on a tinted square; initials if there is no photo or it fails to load. */
function SpeakerPhoto({ src, name, tone }) {
  const [failed, setFailed] = useState(!src);
  return (
    <div className={`mb-4 aspect-square overflow-hidden rounded-2xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_30px_rgb(8_72_168/0.15)] ${tone.bg}`}>
      {failed ? (
        <span aria-hidden="true" className={`flex h-full w-full items-center justify-center text-4xl font-bold ${tone.ink}`}>
          {initials(name)}
        </span>
      ) : (
        <img src={src} alt={name} loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

/** Two-column directory of people with coloured initials. */
function Directory({ people }) {
  return (
    <ul className="grid gap-x-6 sm:grid-cols-2">
      {people.map((p, idx) => {
        const t = TONE_LIST[idx % TONE_LIST.length];
        return (
          <li key={idx} className={`group flex items-start gap-4 rounded-xl px-3 py-4 transition-colors ${t.hover}`}>
            <span aria-hidden="true" className={`flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold transition-colors group-hover:text-white ${t.bg} ${t.ink} ${t.solid}`}>
              {initials(p.name)}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-brand-ink">{p.name}</span>
              {p.designation && <span className={`block text-sm font-medium ${t.ink}`}>{p.designation}</span>}
              {(p.institution || p.location) && (
                <span className="block text-sm text-slate-500">
                  {p.institution}
                  {p.location && ` (${p.location})`}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
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
      <div className="flex min-h-screen items-center justify-center bg-brand-snow">
        <div className="flex flex-col items-center gap-5">
          <span aria-hidden="true" className="h-12 w-12 animate-spin rounded-full border-4 border-brand-deep/15 border-t-brand-violet" />
          <h2 className="text-xl font-bold text-brand-ink animate-pulse">Loading Conference Details...</h2>
        </div>
      </div>
    );
  }

  if (!conference || conference.message) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-snow px-4">
        <h2 className="text-4xl font-bold tracking-tight text-brand-ink">Conference Not Found</h2>
      </div>
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
    try { return JSON.parse(str); } catch (e) { return []; }
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
  const closedPill = "inline-flex cursor-not-allowed select-none items-center justify-center gap-2.5 rounded-full border-2 border-red-600 bg-red-50 font-bold text-red-600";

  // Key Details timeline: the deadlines, then the conference date (filled dot).
  const timeline = [
    { value: dates.abstractSubmission, label: "Abstract Submission Deadline", dot: "border-[#0d7f99] bg-white" },
    { value: dates.fullPaperSubmission, label: "Full Paper Submission Deadline", dot: "border-[#5858c8] bg-white" },
    { value: dates.conferenceDate, label: "Event Date", dot: "border-brand-deep bg-brand-deep" },
  ].filter((d) => d.value);
  const feeRows = Object.entries(conference.fees || {}).filter(([, val]) => val);
  const hasSidebar = timeline.length > 0 || feeRows.length > 0 || Boolean(conference.registerlink);

  // Main-column blocks, in order; each is shown only when the conference has content for it.
  const blocks = [];

  if (conference.about) {
    blocks.push({
      id: "about",
      tag: "About",
      tone: TONE.blue,
      title: "About the Conference",
      children: <AboutText text={conference.about} />,
    });
  }

  if (hasProceedings || hasCertificates) {
    blocks.push({
      id: "downloads",
      tag: "Downloads",
      tone: TONE.cyan,
      title: "Conference Downloads",
      children: (
        <>
          {hasProceedings && (
            <div className="flex flex-col gap-5 rounded-2xl bg-[#e8f0fc] p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgb(8_72_168/0.12)] sm:flex-row sm:items-center sm:gap-6 lg:p-8">
              <span aria-hidden="true" className="flex h-16 w-16 flex-none items-center justify-center rounded-xl bg-brand-deep text-white">
                <FileText size={28} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-deep">Official Research Compilation</p>
                <h3 className="mt-1 text-xl font-bold text-brand-ink">Conference Proceedings</h3>
                {conference.isbn && <p className="mt-1 text-sm text-slate-600">ISBN {conference.isbn}</p>}
              </div>
              <a
                href={conference.proceedingsdownload}
                download
                className={`inline-flex h-12 flex-none items-center justify-center gap-2 rounded-full bg-brand-deep px-6 font-bold text-white transition-colors hover:bg-brand-ink ${FOCUS} focus-visible:outline-brand-deep`}
              >
                <Download size={18} aria-hidden="true" />
                Download Proceedings
              </a>
            </div>
          )}

          {hasCertificates && (
            <div className={hasProceedings ? "mt-8" : ""}>
              <h3 className={KICKER}>Download Certificates</h3>
              <ul className="mt-3">
                {parsedCertificates.map((track, idx) => {
                  const t = TONE_LIST[(idx + 1) % TONE_LIST.length];
                  return (
                    <li key={idx} className={`group -mx-3 flex items-center gap-4 rounded-xl border-t border-slate-200 px-3 py-4 transition-colors last:border-b ${t.hover}`}>
                      <span aria-hidden="true" className={`flex h-9 w-9 flex-none items-center justify-center rounded-full transition-colors group-hover:text-white ${t.bg} ${t.ink} ${t.solid}`}>
                        <Award size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-brand-ink">{track.name || `Track 0${idx + 1}`}</span>
                        <span className="block text-sm text-slate-500">Conference Session Track</span>
                      </span>
                      <a
                        href={track.file}
                        download
                        className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap font-semibold text-brand-deep hover:underline ${FOCUS} focus-visible:outline-brand-deep`}
                      >
                        <Download size={16} aria-hidden="true" />
                        Download PDF
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-brand-ink">
                <span className={`${KICKER} inline-flex items-center gap-2`}>
                  <Info size={15} aria-hidden="true" />
                  Verification Details
                </span>
                {conference.conferencestatus && (
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck size={17} aria-hidden="true" className="text-emerald-600" />
                    <span className="sr-only">Status: </span>
                    {conference.conferencestatus}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={17} aria-hidden="true" className="text-brand-deep" />
                  <span className="sr-only">Security: </span>
                  Verified Records
                </span>
                {conference.conferencevalidity && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarCheck size={17} aria-hidden="true" className="text-brand-deep" />
                    <span className="sr-only">Validity: </span>
                    {conference.conferencevalidity}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      ),
    });
  }

  if (hasData(conference.topics)) {
    blocks.push({
      id: "tracks",
      tag: "Topics",
      tone: TONE.violet,
      title: "Conference Topics & Tracks",
      children: (
        <ol className="grid gap-2 sm:grid-cols-2 sm:gap-x-6">
          {conference.topics.map((topic, i) => {
            const t = TONE_LIST[i % TONE_LIST.length];
            return (
              <li key={i} className={`group flex items-center gap-4 rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-4 transition duration-300 hover:-translate-y-0.5 hover:border-transparent ${t.hover}`}>
                <span aria-hidden="true" className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg font-bold tabular-nums transition-colors group-hover:text-white ${t.bg} ${t.ink} ${t.solid}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`font-semibold leading-snug text-brand-ink transition-colors ${t.inkHover}`}>{topic}</span>
              </li>
            );
          })}
        </ol>
      ),
    });
  }

  if (hasData(conference.speakers)) {
    blocks.push({
      id: "keynotes",
      tag: "Expert Insights",
      tone: TONE.gold,
      title: "Keynote Speakers",
      children: (
        <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {conference.speakers.map((speaker, idx) => {
            const t = TONE_LIST[idx % TONE_LIST.length];
            return (
              <li key={idx} className="group">
                <SpeakerPhoto src={speaker.image ? getAssetUrl(speaker.image) : ""} name={speaker.name} tone={t} />
                <h3 className={`font-bold text-brand-ink transition-colors ${t.inkHover}`}>{speaker.name}</h3>
                <p className={`mt-1 text-sm font-semibold ${t.ink}`}>{speaker.designation}</p>
                <p className="mt-1 text-sm text-slate-500">{speaker.institution}</p>
              </li>
            );
          })}
        </ul>
      ),
    });
  }

  if (hasAdvisory) {
    blocks.push({
      id: "advisory",
      tag: "People",
      tone: TONE.teal,
      title: "Advisory Committee",
      children: <Directory people={conference.advisorycommittee} />,
    });
  }

  if (hasData(conference.globalexperts)) {
    blocks.push({
      id: "experts",
      tag: "Advisory Committee",
      tone: TONE.rose,
      title: "Meet Our Global Experts",
      children: <Directory people={conference.globalexperts} />,
    });
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* Hero: light banner, copy on the left and a stage on the right: the poster
          on a podium, or, when there is no poster, the globe-and-book artwork. */}
      <header className="conf-hero relative overflow-hidden">
        <HeroBackdrop />

        <div className={`${WRAP} relative z-10 grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:py-16 xl:gap-16`}>
          <div>
            {conference.type && (
              <span className="inline-block rounded-full bg-brand-gold px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-ink sm:text-sm">
                {conference.type}
              </span>
            )}
            <h1 className="mt-5 font-extrabold tracking-tight">
              <span className="inline-block rounded-full border border-brand-deep/15 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-deep backdrop-blur sm:text-sm">
                International E-Conference on
              </span>
              <span className="mt-4 block bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet bg-clip-text pb-1 text-[1.75rem] leading-[1.15] text-transparent sm:text-4xl lg:text-[2.5rem] xl:text-[2.75rem]">
                {conference.conferencetitle}
              </span>
            </h1>

            {conference.conferencename && (
              <div className="mt-6 flex max-w-2xl items-center gap-4">
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-deep/50" />
                <p className="text-lg font-bold text-brand-ink sm:text-xl">({conference.conferencename})</p>
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-deep/50" />
              </div>
            )}

            <ul className="mt-8 flex flex-wrap gap-3">
              {dates.conferenceDate && (
                <li className="flex items-center gap-2.5 rounded-full border border-brand-bright/20 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-ink backdrop-blur">
                  <CalendarDays size={18} aria-hidden="true" className="text-brand-bright" />
                  {shortDate(dates.conferenceDate)}
                </li>
              )}
              <li className="flex items-center gap-2.5 rounded-full border border-brand-bright/20 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-ink backdrop-blur">
                <Globe size={18} aria-hidden="true" className="text-brand-bright" />
                Online Mode
              </li>
              {conference.isbn && (
                <li className="flex items-center gap-2.5 rounded-full border border-brand-bright/20 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-ink backdrop-blur">
                  <BookMarked size={18} aria-hidden="true" className="text-brand-violet" />
                  ISBN: {conference.isbn}
                </li>
              )}
            </ul>

            {(conference.registerlink || conference.brochuredownload) && (
              <div className="mt-9 flex flex-wrap gap-4">
                {conference.registerlink && registrationClosed && (
                  <span aria-disabled="true" className={`${closedPill} px-7 py-3.5`}>
                    <Lock size={18} aria-hidden="true" />
                    Registration Closed
                  </span>
                )}
                {conference.registerlink && !registrationClosed && (
                  <a
                    href={conference.registerlink}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet px-7 py-3.5 font-bold text-white transition-transform hover:-translate-y-0.5 ${FOCUS} focus-visible:outline-brand-deep`}
                  >
                    Register Now
                    <ArrowRight size={18} aria-hidden="true" />
                  </a>
                )}
                {conference.brochuredownload && (
                  <a
                    href={conference.brochuredownload}
                    download
                    className={`inline-flex items-center gap-2.5 rounded-full border-2 border-brand-deep bg-white/80 px-7 py-3 font-bold text-brand-deep backdrop-blur transition-colors hover:bg-brand-deep hover:text-white ${FOCUS} focus-visible:outline-brand-deep`}
                  >
                    <Download size={18} aria-hidden="true" />
                    Download Brochure
                  </a>
                )}
              </div>
            )}
          </div>

          <figure className={`conf-stage relative mx-auto flex w-full max-w-[480px] flex-col items-center ${showPoster ? "" : "lg:mt-16 lg:self-end"}`}>
            {/* Panel and light lines sit behind posters only; the globe stands on the plain hero. */}
            {showPoster && <span aria-hidden="true" className="conf-panel" />}
            <span aria-hidden="true" className={showPoster ? "conf-beam" : "conf-spotlight"} />
            {showPoster && <PosterStreaks />}

            {showPoster ? (
              <button
                type="button"
                onClick={() => setPosterOpen(true)}
                aria-label="Zoom in on the conference poster"
                className={`group relative z-10 flex max-w-[82%] cursor-zoom-in justify-center rounded-md ${FOCUS} focus-visible:outline-brand-deep`}
              >
                <img
                  src={conference.poster}
                  alt="Conference Poster"
                  className="h-auto max-h-[440px] w-auto max-w-full rounded-md object-contain shadow-[0_30px_60px_rgb(5_47_115/0.35)] transition-transform duration-300 group-hover:scale-[1.02] xl:max-h-[520px]"
                  onLoad={() => setPosterLoaded(conference.poster)}
                  onError={() => setFailedPoster(conference.poster)}
                />
                <span
                  aria-hidden="true"
                  className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-deep text-white shadow-lg transition duration-300 group-hover:scale-110 ${posterLoaded === conference.poster ? "opacity-100" : "opacity-0"}`}
                >
                  <ZoomIn size={20} />
                </span>
              </button>
            ) : (
              <SpinningGlobe />
            )}

            {!showPoster && (
              <span aria-hidden="true" className="conf-gpodium">
                <span className="conf-gpodium-tier conf-gpodium-tier--top" />
                <span className="conf-gpodium-tier conf-gpodium-tier--base" />
              </span>
            )}
          </figure>
        </div>
        <div className="logo-rule relative z-10" />
      </header>

      {posterOpen && showPoster && (
        <PosterViewer src={conference.poster} alt="Conference Poster" onClose={closePoster} />
      )}

      {/* Body: content blocks on the left, Key Details sidebar on the right */}
      <section className="bg-brand-snow py-16 lg:py-24" aria-label="Conference details">
        <div className={`${WRAP} grid items-start gap-10 lg:grid-cols-12 lg:gap-x-8`}>
          {blocks.length > 0 && (
            <div className="min-w-0 lg:col-span-7">
              {blocks.map((b, i) => (
                <Block key={b.id} {...b} first={i === 0} />
              ))}
            </div>
          )}

          {hasSidebar && (
            <aside
              aria-label="Key details"
              className={`order-first min-w-0 lg:order-none lg:self-stretch ${blocks.length > 0 ? "lg:col-span-4 lg:col-start-9" : "lg:col-span-6"}`}
            >
              <div className="lg:sticky lg:top-28">
                <section aria-labelledby="conf-kd" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgb(8_72_168/0.08)]">
                  <div className="bg-[#e8f0fc] p-6">
                    <h2 id="conf-kd" className="text-xl font-bold text-brand-ink">Key Details</h2>
                    {timeline.length > 0 && (
                      <ol className="mt-5">
                        {timeline.map((d, i) => (
                          <li key={d.label} className="relative pb-5 pl-9 last:pb-0">
                            {i < timeline.length - 1 && (
                              <span aria-hidden="true" className="absolute bottom-0 left-[11px] top-6 w-0.5 bg-brand-deep/15" />
                            )}
                            <span aria-hidden="true" className={`absolute left-0 top-0 h-6 w-6 rounded-full border-2 ${d.dot}`} />
                            <span className="block text-sm text-slate-600">{d.label}</span>
                            <strong className="block tabular-nums text-brand-ink">{longDate(d.value)}</strong>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  {(feeRows.length > 0 || conference.registerlink) && (
                    <div className="space-y-4 p-6">
                      {feeRows.length > 0 && (
                        <div>
                          <h3 className={KICKER}>Registration Fees (Per Paper)</h3>
                          <ul className="mt-3 space-y-2">
                            {feeRows.map(([key, val]) => (
                              <li key={key} className="flex justify-between gap-4 rounded-lg bg-brand-snow px-3 py-2 text-sm">
                                <span className="capitalize text-slate-700">{key.replace(/([A-Z])/g, " $1")}</span>
                                <strong className="tabular-nums text-brand-deep">₹ {val}/-</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {conference.registerlink && registrationClosed && (
                        <span aria-disabled="true" className={`${closedPill} h-12 w-full`}>
                          <Lock size={18} aria-hidden="true" />
                          Registration Closed
                        </span>
                      )}
                      {conference.registerlink && !registrationClosed && (
                        <a
                          href={conference.registerlink}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-deep font-bold text-white transition-colors hover:bg-brand-ink ${FOCUS} focus-visible:outline-brand-deep`}
                        >
                          Link to Register
                          <ArrowRight size={18} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  )}

                  {feeRows.length > 0 && (
                    <div className="border-t border-slate-200 bg-brand-snow p-6">
                      <h3 className={KICKER}>Secure Checkout · Direct Bank Remittance</h3>
                      {hasData(conference.bankdetails) ? (
                        <dl className="mt-2 text-sm">
                          {[
                            ["Bank", conference.bankdetails.bankName],
                            ["Name", conference.bankdetails.accountName],
                            ["A/C No", conference.bankdetails.accountNo],
                            ["IFSC", conference.bankdetails.ifscCode],
                          ]
                            .filter(([, v]) => v)
                            .map(([k, v]) => (
                              <div key={k} className="flex justify-between gap-4 border-t border-slate-200 py-3 first:border-t-0">
                                <dt className="text-slate-500">{k}</dt>
                                <dd className="break-all text-right font-semibold tabular-nums text-brand-ink">{v}</dd>
                              </div>
                            ))}
                        </dl>
                      ) : (
                        <img
                          src="/assets/image/conference/ICGMRFT-QR%2031-Mar-2026.jpg"
                          alt="Conference Registration QR Code"
                          className="mt-3 h-40 w-40 rounded-lg bg-white object-contain p-2 shadow-sm"
                        />
                      )}
                    </div>
                  )}
                </section>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* Need assistance: the conveners and the enquiries email */}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="conf-help">
        <div className={WRAP}>
          <div className={`grid items-center gap-8 rounded-3xl bg-[#e0f4f1] p-6 sm:p-10 lg:p-12 ${hasOrganizers ? "lg:grid-cols-12 lg:gap-x-8" : ""}`}>
            <div className={hasOrganizers ? "lg:col-span-4" : "max-w-2xl"}>
              <Tag tone={TONE.teal} white>Contact</Tag>
              <h2 id="conf-help" className="mt-3 text-2xl font-bold tracking-tight text-brand-ink lg:text-3xl">Need Assistance?</h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                Contact the conveners for submissions, enquiries or registration.
              </p>
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(conference.conferencename || "Conference enquiry")}`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 break-all rounded-full bg-white px-5 font-semibold text-brand-deep shadow-sm transition-colors hover:bg-brand-deep hover:text-white"
              >
                <Mail size={18} aria-hidden="true" className="flex-none" />
                {EMAIL}
              </a>
            </div>

            {hasOrganizers && (
              <div className="lg:col-span-7 lg:col-start-6">
                <h3 className={`${KICKER} mb-3`}>Conference Conveners</h3>
                <ul className="overflow-hidden rounded-2xl bg-white shadow-[0_6px_20px_rgb(15_122_107/0.10)]">
                  {conference.organizingcommittee.map((member, idx) => {
                    const t = TONE_LIST[(idx + 1) % TONE_LIST.length];
                    return (
                      <li key={idx} className={`flex flex-wrap items-center gap-4 border-t border-slate-100 px-5 py-4 transition-colors first:border-t-0 sm:flex-nowrap ${t.hover}`}>
                        <span aria-hidden="true" className={`flex h-11 w-11 flex-none items-center justify-center rounded-full text-sm font-bold ${t.bg} ${t.ink}`}>
                          {initials(member.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-brand-ink">{member.name}</span>
                          <span className={`block text-[11px] font-semibold uppercase tracking-wider ${t.ink}`}>{member.role || "Convener"}</span>
                        </span>
                        {member.mobile && (
                          <a
                            href={`tel:${String(member.mobile).replace(/[^\d+]/g, "")}`}
                            className="ml-[60px] inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 font-semibold tabular-nums text-brand-deep transition-colors hover:border-brand-deep hover:bg-[#e8f0fc] sm:ml-0"
                          >
                            <Phone size={16} aria-hidden="true" />
                            {member.mobile}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
