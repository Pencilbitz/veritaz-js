import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookMarked,
  Building2,
  CalendarCheck,
  CalendarDays,
  Clock,
  Download,
  FileText,
  Globe,
  Info,
  Landmark,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";
const SERIF = { fontFamily: "var(--font-serif)" };

// Light sections alternate between plain white and a soft logo-colour wash.
const TONES = ["bg-white", "conf-tint"];

// Accent colours from the logo, cycled across repeated cards.
const ACCENTS = [
  { bar: "bg-brand-cyan", border: "border-brand-cyan", text: "text-[#0d7f99]", tile: "bg-brand-cyan text-brand-ink" },
  { bar: "bg-brand-bright", border: "border-brand-bright", text: "text-brand-bright", tile: "bg-brand-bright text-white" },
  { bar: "bg-brand-violet", border: "border-brand-violet", text: "text-brand-violet", tile: "bg-brand-violet text-white" },
  { bar: "bg-brand-orchid", border: "border-brand-orchid", text: "text-[#9a3fbf]", tile: "bg-brand-orchid text-brand-ink" },
];

const CARD = "rounded-2xl bg-white shadow-[0_0_0_1px_rgb(8_72_168/0.07),0_14px_34px_rgb(8_72_168/0.08)]";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4";

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

function SectionTitle({ eyebrow, title, center = false, dark = false }) {
  return (
    <div className={`mb-10 lg:mb-12 ${center ? "text-center" : ""}`}>
      {eyebrow && (
        <p className={`mb-3 text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-brand-cyanlight" : "text-brand-bright"}`}>
          {eyebrow}
        </p>
      )}
      <h2 style={SERIF} className={`text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl ${dark ? "text-white" : "text-brand-ink"}`}>
        {title}
      </h2>
      <span aria-hidden="true" className={`logo-rule mt-5 block w-20 rounded-full ${center ? "mx-auto" : ""}`} />
    </div>
  );
}

function PanelHeader({ title, accent }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-brand-deep/10 pb-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`h-7 w-1.5 rounded-full ${accent}`} />
        <h3 className="text-lg font-bold uppercase tracking-tight text-brand-ink">{title}</h3>
      </div>
      <span className="hidden rounded-full border border-brand-deep/10 bg-white px-3 py-1 text-[11px] font-bold text-slate-500 sm:block">
        Format: Digital PDF
      </span>
    </div>
  );
}

export default function Conference() {
  const { confname } = useParams();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failedPoster, setFailedPoster] = useState(null);

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
        <h2 style={SERIF} className="text-4xl font-medium tracking-tight text-brand-ink">Conference Not Found</h2>
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
  const hasDeadlines = Boolean(dates.abstractSubmission || dates.fullPaperSubmission);
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
  const numericDate = (d) => new Date(d).toLocaleDateString('en-GB').replace(/\//g, '-');

  // Each light section that is actually shown takes the next tone, so the page
  // keeps alternating however many sections a conference has. A section with its
  // own background passes it in; it still uses up a turn in the alternation.
  let toneIndex = 0;
  const nextTone = (override) => {
    const tone = TONES[toneIndex++ % TONES.length];
    return override || tone;
  };

  const deadlines = [
    { value: dates.abstractSubmission, label: "Abstract Submission Deadline", bar: "bg-brand-gold", tile: "bg-brand-gold/20 text-[#8a6413]" },
    { value: dates.fullPaperSubmission, label: "Full Paper Submission Deadline", bar: "bg-brand-cyan", tile: "bg-brand-cyan/15 text-[#0d7f99]" },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* Hero: light banner, copy on the left and a stage on the right: the poster
          on a podium, or, when there is no poster, the globe-and-book artwork. */}
      <header className="conf-hero relative overflow-hidden">
        <HeroBackdrop />

        <div className={`${WRAP} relative z-10 grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:py-16 xl:gap-16`}>
          <div>
            {conference.type && (
              <span className="inline-block rounded-full bg-brand-gold px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-ink shadow-[0_6px_16px_rgb(230_184_79/0.35)] sm:text-sm">
                {conference.type}
              </span>
            )}
            <h1 className="mt-5 font-extrabold tracking-tight">
              <span className="inline-block rounded-full border border-brand-deep/15 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-deep shadow-sm backdrop-blur sm:text-sm">
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
                <li className="flex items-center gap-2.5 rounded-full border border-brand-bright/20 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-ink shadow-[0_6px_18px_rgb(8_72_168/0.08)] backdrop-blur">
                  <CalendarDays size={18} aria-hidden="true" className="text-brand-bright" />
                  {shortDate(dates.conferenceDate)}
                </li>
              )}
              <li className="flex items-center gap-2.5 rounded-full border border-brand-bright/20 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-ink shadow-[0_6px_18px_rgb(8_72_168/0.08)] backdrop-blur">
                <Globe size={18} aria-hidden="true" className="text-brand-bright" />
                Online Mode
              </li>
              {conference.isbn && (
                <li className="flex items-center gap-2.5 rounded-full border border-brand-bright/20 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-ink shadow-[0_6px_18px_rgb(8_72_168/0.08)] backdrop-blur">
                  <BookMarked size={18} aria-hidden="true" className="text-brand-violet" />
                  ISBN: {conference.isbn}
                </li>
              )}
            </ul>

            {(conference.registerlink || conference.brochuredownload) && (
              <div className="mt-9 flex flex-wrap gap-4">
                {conference.registerlink && (
                  <a
                    href={conference.registerlink}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet px-7 py-3.5 font-bold text-white shadow-[0_14px_30px_rgb(8_72_168/0.35)] transition-transform hover:-translate-y-0.5 ${FOCUS} focus-visible:outline-brand-deep`}
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
            <span aria-hidden="true" className="conf-panel" />
            <span aria-hidden="true" className="conf-beam" />
            <PosterStreaks />

            {showPoster ? (
              <img
                src={conference.poster}
                alt="Conference Poster"
                className="relative z-10 h-auto max-h-[440px] w-auto max-w-[82%] rounded-md object-contain shadow-[0_30px_60px_rgb(5_47_115/0.35)] xl:max-h-[520px]"
                onError={() => setFailedPoster(conference.poster)}
              />
            ) : (
              <img
                src="/assets/image/conference/conference-hero-globe.png"
                alt=""
                width="1719"
                height="915"
                className="relative z-10 h-auto w-[96%] translate-y-4 drop-shadow-[0_24px_30px_rgb(5_47_115/0.3)]"
              />
            )}

            <span aria-hidden="true" className="conf-podium">
              <span className="conf-podium-glow" />
              <span className="conf-podium-ring" />
              <span className="conf-podium-side" />
              <span className="conf-podium-top" />
            </span>
          </figure>
        </div>
        <div className="logo-rule relative z-10" />
      </header>

      {/* About & key dates */}
      {(conference.about || hasDeadlines) && (
        <section className={`${nextTone()} py-16 lg:py-24`}>
          <div className={`${WRAP} grid gap-10 ${hasDeadlines && conference.about ? "lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16" : ""}`}>
            {conference.about && (
              <div className={`reveal ${hasDeadlines ? "" : "max-w-4xl"}`}>
                {dates.conferenceDate && (
                  <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-violet/20 bg-brand-paper px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-violet">
                    <CalendarDays size={14} aria-hidden="true" />
                    Event Date: {longDate(dates.conferenceDate)}
                  </span>
                )}
                <SectionTitle title="About the Conference" />
                <p className="whitespace-pre-line text-justify text-lg leading-relaxed text-slate-600">
                  {conference.about}
                </p>
              </div>
            )}

            {hasDeadlines && (
              <div className={`grid gap-4 self-start ${conference.about ? "" : "sm:grid-cols-2"}`}>
                {deadlines.map((d) => (
                  <div key={d.label} className={`reveal relative overflow-hidden p-6 ${CARD}`}>
                    <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${d.bar}`} />
                    <div className="flex items-center gap-4">
                      <span className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${d.tile}`}>
                        <Clock size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="tabular-nums text-2xl font-black text-brand-ink">{numericDate(d.value)}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">{d.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Proceedings & certificates, always on the dot grid */}
      {(hasProceedings || hasCertificates) && (
        <section className={`${nextTone("conf-dots")} py-16 lg:py-24`}>
          <div className={WRAP}>
            <div className={`grid gap-10 ${hasProceedings && hasCertificates ? "lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] xl:gap-14" : ""}`}>

              {hasProceedings && (
                <div className={hasCertificates ? "" : "mx-auto w-full max-w-xl"}>
                  <PanelHeader title="Conference Downloads" accent="bg-brand-bright" />
                  <div className="reveal relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-deep to-brand-violet p-7 text-white shadow-[0_20px_40px_rgb(8_72_168/0.25)]">
                    <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-cyan/30 blur-2xl" />
                    <div className="relative flex items-start gap-4">
                      <span className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-white text-brand-deep">
                        <FileText size={26} aria-hidden="true" />
                      </span>
                      <div>
                        <h4 style={SERIF} className="text-2xl font-medium tracking-tight">Conference Proceedings</h4>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-brand-goldlight">Official Research Compilation</p>
                      </div>
                    </div>
                    <a
                      href={conference.proceedingsdownload}
                      download
                      className={`relative mt-8 flex items-center justify-center gap-2 rounded-full bg-brand-gold py-3 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-goldlight ${FOCUS} focus-visible:outline-white`}
                    >
                      <Download size={17} aria-hidden="true" />
                      Download Proceedings
                    </a>
                  </div>
                </div>
              )}

              {hasCertificates && (
                <div>
                  <PanelHeader title="Download Certificates" accent="bg-brand-orchid" />
                  <div className={`grid gap-5 sm:grid-cols-2 ${hasProceedings ? "xl:grid-cols-3" : "lg:grid-cols-3"}`}>
                    {parsedCertificates.map((track, idx) => {
                      const accent = ACCENTS[idx % ACCENTS.length];
                      return (
                        <div key={idx} className={`reveal flex flex-col justify-between border-t-[3px] p-5 ${accent.border} ${CARD}`}>
                          <div className="mb-5 flex items-start gap-4">
                            <span className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${accent.tile}`}>
                              <Award size={22} aria-hidden="true" />
                            </span>
                            <div>
                              <h4 className="text-base font-bold text-brand-ink">{track.name || `Track 0${idx + 1}`}</h4>
                              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Conference Session Track</p>
                            </div>
                          </div>
                          <a
                            href={track.file}
                            download
                            className={`flex items-center justify-center gap-2 rounded-full border-2 border-brand-deep/15 py-2.5 text-xs font-bold text-brand-deep transition-colors hover:border-brand-deep hover:bg-brand-deep hover:text-white ${FOCUS} focus-visible:outline-brand-deep`}
                          >
                            <Download size={15} aria-hidden="true" />
                            Download PDF
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Verification details */}
            {hasCertificates && (
              <div className="mt-12 border-t border-brand-deep/10 pt-8">
                <h4 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-ink">
                  <Info size={17} aria-hidden="true" className="text-brand-bright" />
                  Verification Details
                </h4>
                <div className="grid gap-4 text-sm sm:grid-cols-3">
                  {conference.conferencestatus && (
                    <div className={`flex items-center gap-4 p-4 ${CARD}`}>
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <BadgeCheck size={20} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                        <p className="font-bold text-emerald-700">{conference.conferencestatus}</p>
                      </div>
                    </div>
                  )}
                  <div className={`flex items-center gap-4 p-4 ${CARD}`}>
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-paper text-brand-violet">
                      <ShieldCheck size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security</p>
                      <p className="font-bold text-brand-violet">Verified Records</p>
                    </div>
                  </div>
                  {conference.conferencevalidity && (
                    <div className={`flex items-center gap-4 p-4 ${CARD}`}>
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-mist text-brand-deep">
                        <CalendarCheck size={20} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Validity</p>
                        <p className="font-bold text-brand-deep">{conference.conferencevalidity}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Topics & tracks */}
      {hasData(conference.topics) && (
        <section className={`${nextTone()} py-16 lg:py-24`}>
          <div className={WRAP}>
            <SectionTitle title="Conference Topics & Tracks" />
            <ol className="grid gap-4 md:grid-cols-2 md:gap-x-6">
              {conference.topics.map((topic, i) => {
                const accent = ACCENTS[i % ACCENTS.length];
                return (
                  <li key={i} className={`reveal group flex items-center gap-5 p-4 transition-shadow hover:shadow-[0_0_0_1px_rgb(8_72_168/0.12),0_20px_40px_rgb(8_72_168/0.14)] ${CARD}`}>
                    <span className={`ml-1.5 flex h-10 w-10 flex-none rotate-45 items-center justify-center rounded-lg border-[3px] bg-white ${accent.border}`}>
                      <span className="-rotate-45 text-sm font-extrabold text-brand-ink">{String(i + 1).padStart(2, "0")}</span>
                    </span>
                    <p className="font-semibold leading-snug text-slate-700">{topic}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* Registration fees & payment */}
      {hasData(conference.fees) && (
        <section id="Register" className={`${nextTone()} scroll-mt-24 py-16 lg:py-24`}>
          <div className={`${WRAP} grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-stretch`}>
            <div className={`reveal p-6 sm:p-10 ${CARD}`}>
              <h2 style={SERIF} className="flex items-center gap-3 text-2xl font-medium tracking-tight text-brand-ink sm:text-3xl">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-gold text-brand-ink">
                  <Ticket size={22} aria-hidden="true" />
                </span>
                Registration Fees (Per Paper)
              </h2>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-brand-deep/10">
                      <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Participant Category</th>
                      <th className="pb-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Fee Standard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-deep/5">
                    {Object.entries(conference.fees).map(([key, val], idx) => {
                      if (!val) return null;
                      const accent = ACCENTS[idx % ACCENTS.length];
                      return (
                        <tr key={key} className="transition-colors hover:bg-brand-snow">
                          <td className="py-4 pr-4 font-semibold capitalize text-slate-700">
                            <span className="flex items-center gap-3">
                              <span aria-hidden="true" className={`h-2.5 w-2.5 rotate-45 rounded-[2px] ${accent.bar}`} />
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                          </td>
                          <td className="py-4 text-right tabular-nums text-lg font-extrabold text-brand-deep">₹ {val}/-</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="reveal relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-ink via-brand-deep to-brand-violet p-7 text-center text-white shadow-[0_20px_40px_rgb(5_47_115/0.3)] sm:p-8">
              <span aria-hidden="true" className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-brand-orchid/40 blur-3xl" />
              <h3 style={SERIF} className="relative text-2xl font-medium tracking-tight">Secure Checkout</h3>

              {hasData(conference.bankdetails) ? (
                <div className="relative w-full rounded-xl border border-white/15 bg-white/10 p-5 text-left">
                  <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                    <Landmark size={15} aria-hidden="true" />
                    Direct Bank Remittance
                  </p>
                  <dl className="space-y-2 tabular-nums text-xs text-white/85">
                    {conference.bankdetails.bankName && <div className="flex justify-between gap-4"><dt className="font-sans font-bold text-white">Bank:</dt><dd className="text-right">{conference.bankdetails.bankName}</dd></div>}
                    {conference.bankdetails.accountName && <div className="flex justify-between gap-4"><dt className="font-sans font-bold text-white">Name:</dt><dd className="text-right">{conference.bankdetails.accountName}</dd></div>}
                    {conference.bankdetails.accountNo && <div className="flex justify-between gap-4"><dt className="font-sans font-bold text-white">A/C No:</dt><dd className="text-right">{conference.bankdetails.accountNo}</dd></div>}
                    {conference.bankdetails.ifscCode && <div className="flex justify-between gap-4"><dt className="font-sans font-bold text-white">IFSC:</dt><dd className="text-right">{conference.bankdetails.ifscCode}</dd></div>}
                  </dl>
                </div>
              ) : (
                <div className="relative rounded-2xl bg-white p-3 shadow-lg">
                  <img
                    src="/assets/image/conference/ICGMRFT-QR%2031-Mar-2026.jpg"
                    alt="Conference Registration QR Code"
                    className="h-40 w-40 rounded-lg object-contain"
                  />
                </div>
              )}

              {conference.registerlink && (
                <a
                  href={conference.registerlink}
                  target="_blank"
                  rel="noreferrer"
                  className={`relative block w-full rounded-full bg-brand-gold px-6 py-3.5 text-xs font-black uppercase tracking-wider text-brand-ink transition-colors hover:bg-brand-goldlight ${FOCUS} focus-visible:outline-white`}
                >
                  Link to Register
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Keynote speakers */}
      {hasData(conference.speakers) && (
        <section className={`${nextTone()} py-16 lg:py-24`}>
          <div className={WRAP}>
            <SectionTitle eyebrow="Expert Insights" title="Keynote Speakers" center />
            <div className="flex flex-wrap justify-center gap-6">
              {conference.speakers.map((speaker, idx) => {
                const accent = ACCENTS[idx % ACCENTS.length];
                return (
                  <div key={idx} className={`reveal w-full p-6 text-center sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] ${CARD}`}>
                    {speaker.image && (
                      <div className="mx-auto mb-5 h-28 w-28 rounded-full bg-gradient-to-br from-brand-cyan via-brand-violet to-brand-orchid p-[3px]">
                        <img
                          src={getAssetUrl(speaker.image)}
                          alt={speaker.name}
                          className="h-full w-full rounded-full border-4 border-white bg-white object-cover"
                          onError={(e) => {
                            // Fallback to a placeholder icon if the local image fails entirely
                            e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                          }}
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-brand-ink">{speaker.name}</h3>
                    <p className={`mb-2 mt-1 text-sm font-semibold ${accent.text}`}>{speaker.designation}</p>
                    <p className="text-xs leading-snug text-slate-500">{speaker.institution}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Conveners & advisory committee */}
      {(hasOrganizers || hasAdvisory) && (
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-paper via-white to-brand-mist py-16 lg:py-24">
          <div className="logo-rule absolute inset-x-0 top-0" aria-hidden="true" />
          <div className={`${WRAP} relative space-y-14`}>

            {hasOrganizers && (
              <div>
                <h3 style={SERIF} className="mb-6 flex items-center gap-3 text-2xl font-medium tracking-tight text-brand-ink sm:text-3xl">
                  <span aria-hidden="true" className="h-3 w-3 flex-none rotate-45 rounded-[3px] bg-brand-gold" />
                  Conference Conveners
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {conference.organizingcommittee.map((member, idx) => {
                    const accent = ACCENTS[idx % ACCENTS.length];
                    return (
                      <div key={idx} className={`reveal relative overflow-hidden p-5 pl-7 transition-shadow hover:shadow-[0_0_0_1px_rgb(8_72_168/0.12),0_20px_40px_rgb(8_72_168/0.14)] ${CARD}`}>
                        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${accent.bar}`} />
                        <p className="font-bold text-brand-ink">{member.name}</p>
                        <p className={`mt-1 text-[11px] font-bold uppercase tracking-wide ${accent.text}`}>{member.role || "Convener"}</p>
                        {member.mobile && (
                          <p className="mt-3 flex items-center gap-2 tabular-nums text-sm text-slate-600">
                            <Phone size={14} aria-hidden="true" className="text-brand-deep" />
                            {member.mobile}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {hasAdvisory && (
              <div className={hasOrganizers ? "border-t border-brand-deep/10 pt-14" : ""}>
                <h3 style={SERIF} className="mb-6 flex items-center gap-3 text-2xl font-medium tracking-tight text-brand-ink sm:text-3xl">
                  <span aria-hidden="true" className="h-3 w-3 flex-none rotate-45 rounded-[3px] bg-brand-violet" />
                  Advisory Committee
                </h3>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {conference.advisorycommittee.map((member, idx) => {
                    const accent = ACCENTS[idx % ACCENTS.length];
                    return (
                      <li key={idx} className={`reveal relative overflow-hidden p-5 pl-7 transition-shadow hover:shadow-[0_0_0_1px_rgb(8_72_168/0.12),0_20px_40px_rgb(8_72_168/0.14)] ${CARD}`}>
                        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${accent.bar}`} />
                        <p className="font-bold text-brand-ink">{member.name}</p>
                        <p className="mt-1 text-[11px] uppercase leading-relaxed tracking-wide text-slate-500">
                          {member.designation && `${member.designation}, `}{member.institution}{member.location && ` (${member.location})`}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Global experts */}
      {hasData(conference.globalexperts) && (
        <section className={`${nextTone()} py-16 lg:py-24`}>
          <div className={WRAP}>
            <SectionTitle eyebrow="Advisory Committee" title="Meet Our Global Experts" center />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {conference.globalexperts.map((exp, idx) => {
                const accent = ACCENTS[idx % ACCENTS.length];
                return (
                  <div key={idx} className={`reveal relative overflow-hidden border-t-[3px] p-6 transition-shadow hover:shadow-[0_0_0_1px_rgb(8_72_168/0.12),0_20px_40px_rgb(8_72_168/0.14)] ${accent.border} ${CARD}`}>
                    <h3 className="text-lg font-bold text-brand-ink">{exp.name}</h3>
                    <p className={`mb-4 mt-0.5 text-sm font-semibold ${accent.text}`}>{exp.designation}</p>
                    <p className="mb-1.5 flex items-start gap-2 text-sm text-slate-600">
                      <Building2 size={16} aria-hidden="true" className="mt-0.5 flex-none text-slate-400" />
                      {exp.institution}
                    </p>
                    {exp.location && (
                      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <MapPin size={14} aria-hidden="true" className="flex-none text-slate-400" />
                        {exp.location}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
