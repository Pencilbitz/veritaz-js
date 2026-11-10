import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeIndianRupee,
  Barcode,
  BookCopy,
  BookOpen,
  BookOpenText,
  FileText,
  Globe,
  GraduationCap,
  Headset,
  Landmark,
  Languages,
  Layers,
  Lightbulb,
  Mail,
  Megaphone,
  MessageCircle,
  PenLine,
  Pause,
  Phone,
  Play,
  Presentation,
  Printer,
  Star,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

/* Home page in the "night press" look: night-ink bands lit by the logo's
   cyan-violet-orchid sweep, a display grotesque for headings, square corners
   and ruled hairline grids. The styles live under "Home page" in index.css. */

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";

const FALLBACK_COVERS = [
  "/assets/image/books/index-1.png",
  "/assets/image/books/index-2.png",
  "/assets/image/books/index-3.png",
];

const stats = [
  { value: "500+", label: "Books Published" },
  { value: "200+", label: "Patents Registered" },
  { value: "98%", label: "Client Satisfaction" },
];

const services = [
  {
    title: "Textbook & Book Publishing",
    text: "A leading book publishing company providing end-to-end self-publishing, professional manuscript editing, custom cover design, official ISBN registration, high-quality book printing, and eBook publishing with global distribution across major platforms including Flipkart.",
    icon: BookOpen,
    featured: true,
  },
  {
    title: "Patent Grant Support",
    text: "Protect your innovations with expert patent grant support. We offer complete patent registration, documentation, IP protection, and end-to-end patent consulting services for national and international patent filings across 12 countries.",
    icon: Lightbulb,
  },
  {
    title: "Educational Events",
    text: "Complete event coordination and academic organizing for international conferences, faculty development programs (FDPs), interactive workshops, and scholarly seminars designed to foster institutional growth and knowledge sharing.",
    icon: Presentation,
  },
  {
    title: "IEEE Conference Publications",
    text: "Dedicated editorial, formatting, and submission assistance for scholars aiming to publish high-impact papers in prestigious IEEE conferences globally.",
    icon: FileText,
  },
  {
    title: "Professional Upskilling Programs",
    text: "Industry aligned upskilling programs and specialized training modules built to advance professional competencies, research capabilities, and career growth for educators, students, and professionals.",
    icon: GraduationCap,
  },
];

const reasons = [
  { title: "ISBN Assignment", text: "Every book is published with an official ISBN for international tracking and cataloging.", icon: Barcode },
  { title: "Affordable Pricing", text: "Industry-leading publication packages with transparent, budget-friendly costs.", icon: BadgeIndianRupee },
  { title: "Government Recognized", text: "Fully registered company recognized under MSME for official compliance.", icon: Landmark },
  { title: "Author Copies", text: "Complimentary printed books provided to every author upon publication.", icon: BookCopy },
  { title: "Global Distribution Network", text: "Strategic partnerships with major distribution platforms including Flipkart and leading online booksellers.", icon: Globe },
  { title: "Academic Bestsellers", text: "Top-selling engineering, technical, and academic titles across major colleges and institutions.", icon: TrendingUp },
  { title: "Academic Credit & API Score", text: "Fully compliant with UGC and institutional accreditation guidelines to boost API and self-appraisal points.", icon: GraduationCap },
  { title: "Physical Certificate", text: "Hardcopy publication certificates delivered directly to every author.", icon: Award },
  { title: "Complimentary Online Marketing", text: "Free digital promotion and multi-channel distribution across national online marketplaces and publisher portals.", icon: Megaphone },
  { title: "Multilingual Publishing", text: "Complete editorial, layout, and printing capabilities in all regional languages.", icon: Languages },
  { title: "Premium Production Quality", text: "Printed on high-grade 80 GSM paper with crisp color/monochrome printing and durable glossy lamination.", icon: Printer },
  { title: "Dedicated Support", text: "Personalized publishing assistance backed by responsive 24/7 client care.", icon: Headset },
  { title: "Market Presence", text: "Proven track record with multiple national bestsellers across genres.", icon: Trophy },
];

const bookPath = (book) => `/books/${book.title.replace(/\s+/g, "-").toLowerCase()}-${book.id}`;

const prefersCalm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setMeta(selector, create, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(create.tag);
    Object.assign(el, create.attrs);
    document.head.appendChild(el);
  }
  el[create.prop] = value;
}

/** Counts up once when scrolled into view. The real value is rendered first,
 *  so it is still correct with reduced motion or if this effect never runs. */
function CountUp({ value }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const match = /^(\d+)(.*)$/.exec(value);
    if (!el || !match || prefersCalm()) return undefined;

    const target = Number(match[1]);
    const suffix = match[2];
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(Math.max((now - start) / 1400, 0), 1);
          const eased = 1 - (1 - t) ** 3;
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}

function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-vz-violet text-lg font-bold text-white">
        {(name || "?").trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name || "Client"}
      className="h-14 w-14 flex-shrink-0 rounded-full object-cover ring-1 ring-vz-line"
      onError={() => setFailed(true)}
    />
  );
}

/** Decorative mark above a heading: a short gradient rule ending in the
 *  logo's diamond. */
function Rule({ tone = "light", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`flex items-center gap-1.5 ${tone === "dark" ? "text-vz-cyan" : "text-vz-violet"} ${className}`}
    >
      <span className="vz-rule h-0.5 w-10" />
      <span className="h-2 w-2 rotate-45 border-[1.5px] border-current" />
    </span>
  );
}

/** Section label: a short gradient rule, then uppercase text. */
function Eyebrow({ children, tone = "light", className = "" }) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] ${
        tone === "dark" ? "text-vz-cyan" : "text-vz-violet"
      } ${className}`}
    >
      <span aria-hidden="true" className="vz-rule h-0.5 w-8 flex-none" />
      {children}
    </p>
  );
}

const BUTTON_VARIANTS = {
  primary: { button: "vz-btn-primary text-white focus-visible:outline-vz-violet", divider: "border-white/20" },
  ghostDark: {
    button: "border border-white/25 text-white hover:border-white/60 hover:bg-white/10 focus-visible:outline-vz-cyan",
    divider: "border-white/20",
  },
  ghostLight: {
    button: "border border-vz-ink/20 text-vz-ink hover:border-vz-ink hover:bg-vz-paper focus-visible:outline-vz-violet",
    divider: "border-vz-ink/15",
  },
};

/** Square button with the arrow in its own cell. Renders a router Link for
 *  `to`, an anchor for `href`, otherwise a button. */
function PressButton({ to, href, variant = "primary", type = "button", className = "", children, ...rest }) {
  const v = BUTTON_VARIANTS[variant];
  const classes = `group inline-flex h-14 items-stretch text-[15px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60 ${v.button} ${className}`;
  const content = (
    <>
      <span className="flex flex-1 items-center justify-center px-6 sm:px-7">{children}</span>
      <span aria-hidden="true" className={`flex w-14 flex-none items-center justify-center border-l ${v.divider}`}>
        <ArrowUpRight className="h-5 w-5 motion-safe:transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}

const ICON_BUTTON_DARK =
  "flex h-12 w-12 items-center justify-center border border-white/20 text-white transition-colors hover:bg-white hover:text-vz-night disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vz-cyan";
const ICON_BUTTON_LIGHT =
  "flex h-12 w-12 items-center justify-center border border-vz-ink/20 text-vz-ink transition-colors hover:border-vz-violet hover:bg-vz-violet hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vz-violet";

const H2 = "font-display text-4xl font-bold leading-[1.04] tracking-[-0.02em] sm:text-5xl lg:text-6xl";

// Process inks, as on a press sheet's colour bar: cyan, magenta (the logo's
// orchid), yellow (the logo's gold globe) and key, each solid then at a tint.
const COLOR_BAR = ["#3fd0e8", "#a5ebf5", "#d27af0", "#ecc4f8", "#f2c14e", "#f9e2a8", "#17133d", "#8f8bb0"];
const INKS = ["#3fd0e8", "#d27af0", "#f2c14e", "#17133d"];

/** The four process inks, as a press sheet's corner swatch. */
function InkSwatch({ className = "" }) {
  return (
    <span aria-hidden="true" className={`flex items-center gap-1.5 ${className}`}>
      {INKS.map((ink) => (
        <span key={ink} className="h-2.5 w-2.5" style={{ background: ink }} />
      ))}
      <span className="ml-2 h-px w-16 bg-vz-ink/20" />
    </span>
  );
}

// The publishing steps, as tiles under the hero's paragraph.
const HERO_FEATURES = [
  { icon: PenLine, label: "Editing & Typesetting" },
  { icon: BookOpen, label: "Cover Design" },
  { icon: Barcode, label: "ISBN & Patent Registration" },
  { icon: Printer, label: "Printing & Production" },
  { icon: Layers, label: "eBook Distribution" },
];

/** A box in the press scene's 3D stage. (x, y, z) is its centre in stage
 *  pixels: x to the right, y down (the floor is y 0, so things standing on it
 *  have negative y) and z towards the viewer. `faces` maps face names (front,
 *  back, left, right, top, bottom) to their contents; faces turned away from
 *  the camera are hidden, so only the ones that can show need content. */
function Cuboid({ w, h, d, x = 0, y = 0, z = 0, ry = 0, className = "", vars, faces }) {
  const style = {
    ...vars,
    "--w": `${w}px`,
    "--h": `${h}px`,
    "--d": `${d}px`,
    width: w,
    height: h,
    transform: `translate3d(${x - w / 2}px, ${y - h / 2}px, ${z}px) rotateY(${ry}deg)`,
  };
  return (
    <div className={`cube ${className}`} style={style}>
      {Object.entries(faces).map(([name, content]) => (
        <div key={name} className={`cube-face cube-${name}`}>
          {content}
        </div>
      ))}
    </div>
  );
}

/** A flat piece in the stage: `w` x `h`, centred on (x, y, z), then turned by
 *  `turn` (a CSS rotate, e.g. "rotateX(90deg)" to lie flat). */
function Plane({ w, h, x = 0, y = 0, z = 0, turn = "", className = "", style, children }) {
  return (
    <div
      className={`plane ${className}`}
      style={{ ...style, width: w, height: h, transform: `translate3d(${x - w / 2}px, ${y - h / 2}px, ${z}px) ${turn}` }}
    >
      {children}
    </div>
  );
}

/** A hardcover lying flat: the cover on top, page edges between the boards on
 *  three sides, and a cloth spine with gilt bands on the fourth. */
function Book3D({ cover, board, x, y, z, ry, className = "" }) {
  const pages = <span className="book3d-pages" />;
  return (
    <Cuboid
      w={150}
      h={24}
      d={200}
      x={x}
      y={y}
      z={z}
      ry={ry}
      className={`book3d ${className}`}
      vars={{ "--board": board }}
      faces={{
        top: (
          <img
            src={cover}
            alt=""
            className="book3d-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_COVERS[0];
            }}
          />
        ),
        front: pages,
        back: pages,
        right: pages,
        left: <span className="book3d-spine" />,
      }}
    />
  );
}

/** The hero's scene: a printing press built as real 3D boxes, seen from a
 *  little above. Sheets printed with real covers slide out of the slot onto
 *  the paper stack, and each time one lands, a bound book drops onto the stack
 *  beside it. Designed in a 600 x 500 box and scaled to fit. Decorative only:
 *  the same titles are linked in the shelf further down. */
function PressScene({ covers }) {
  const sceneRef = useRef(null);
  // The screen's progress bar and the sheets mount together, so their
  // animations start on the same frame and stay in step.
  const running = covers.length > 0;
  const cover = (i) => (covers.length ? covers[i % covers.length] : FALLBACK_COVERS[i % FALLBACK_COVERS.length]);

  // The stage is drawn at 600px wide; scale it to the scene's real width.
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      el.style.setProperty("--k", String(entry.contentRect.width / 600));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sceneRef} aria-hidden="true" className="scene">
      <div className="stage">
        {/* Soft contact shadows on the floor. */}
        <Plane w={400} h={300} x={-30} z={-45} turn="rotateX(90deg)" className="floor-shadow" />
        <Plane w={312} h={222} x={-30} z={-50} turn="rotateX(90deg)" className="floor-shadow floor-shadow--contact" />
        <Plane w={250} h={200} x={-30} z={150} turn="rotateX(90deg)" className="floor-shadow floor-shadow--soft" />
        <Plane w={240} h={290} x={205} z={135} turn="rotateX(90deg)" className="floor-shadow" />

        {/* The press body. */}
        <Cuboid
          w={300}
          h={250}
          d={210}
          x={-30}
          y={-125}
          z={-50}
          className="mc-body"
          faces={{
            front: (
              <>
                <span className="mc-slot" />
                <span className="mc-panel" />
                <span className="mc-plate">
                  <img src="/assets/image/veritaz-bg-Remove.png" alt="" />
                </span>
                <span className="mc-vents" />
                <span className="mc-screw mc-screw--tl" />
                <span className="mc-screw mc-screw--tr" />
                <span className="mc-screw mc-screw--bl" />
                <span className="mc-screw mc-screw--br" />
              </>
            ),
            top: <span className="mc-lid" />,
            // The control panel sits on the side the camera sees.
            right: (
              <>
                <span className="mc-side" />
                <span className="mc-lcd">
                  <span className="mc-lcd-line" />
                  <span className="mc-lcd-line mc-lcd-line--short" />
                  <span className="mc-lcd-track">{running && <span className="mc-lcd-fill" />}</span>
                </span>
                <span className="mc-btn mc-btn--go" />
                <span className="mc-btn mc-btn--warn" />
                <span className="mc-btn mc-btn--stop" />
                <span className="mc-led" />
              </>
            ),
          }}
        />

        {/* Brackets holding the roller, the chrome roller with its end cap,
            and the ink roller above it. */}
        <Cuboid w={14} h={58} d={34} x={-178} y={-205} z={72} className="mc-bracket" faces={{ front: null, top: null, right: null }} />
        <Cuboid w={14} h={58} d={34} x={118} y={-205} z={72} className="mc-bracket" faces={{ front: null, top: null, right: null }} />
        <Plane w={280} h={40} x={-30} y={-200} z={72} className="mc-roller" />
        <Plane w={40} h={40} x={110} y={-200} z={72} turn="rotateY(90deg)" className="mc-cap" />
        <Plane w={240} h={16} x={-30} y={-233} z={64} className="mc-ink" />
        <Plane w={16} h={16} x={90} y={-233} z={64} turn="rotateY(90deg)" className="mc-cap" />

        {/* Output tray and the paper stack on it. */}
        <Cuboid w={230} h={8} d={175} x={-30} y={-151} z={132} className="mc-tray" faces={{ top: null, front: null, right: null }} />
        <Cuboid w={186} h={20} d={160} x={-30} y={-165} z={137} className="mc-stack" faces={{ top: null, front: <span className="mc-stack-edge" />, right: <span className="mc-stack-edge" /> }} />

        {/* Printed sheets, sliding out of the slot onto the stack. */}
        {running &&
          [0, 1].map((i) => (
            <div key={i} className="sheet3d" style={{ "--i": i }}>
              <img
                src={cover(i)}
                alt=""
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_COVERS[0];
                }}
              />
            </div>
          ))}

        {/* The stack of bound books; light slides across the top cover's
            lamination now and then. */}
        <Book3D cover={cover(2)} board="#7a1f2b" x={205} y={-12} z={135} ry={176} />
        <Book3D cover={cover(3)} board="#1e3a8a" x={202} y={-36} z={131} ry={-6} />
        <Book3D cover={cover(4)} board="#3b0764" x={207} y={-60} z={137} ry={4} />
        <Book3D cover={cover(5)} board="#134e4a" x={204} y={-84} z={134} ry={-3} className="book3d--top" />
      </div>
    </div>
  );
}

function Hero({ covers, booksReady }) {
  const [gaveUp, setGaveUp] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);

  // The press waits for the book list, but a slow network should not leave it
  // empty, so fall back to the bundled covers after a while.
  useEffect(() => {
    const timer = setTimeout(() => setGaveUp(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Covers for the scene: two printed sheets and four books.
  const sceneCovers = useMemo(() => {
    if (!booksReady && !gaveUp) return [];
    const pool = covers.length ? covers : FALLBACK_COVERS;
    return Array.from({ length: 6 }, (_, i) => pool[i % pool.length]);
  }, [covers, booksReady, gaveUp]);

  return (
    // On wide screens the hero fills exactly one screen below the navbar
    // (7.6rem: the 40px contact strip plus the 80px bar); the scene and the
    // headline scale with the screen height to fit, and `short:` tightens
    // the spacing on low laptop screens.
    <section
      className="vz-hero vz-hero-v2 relative isolate overflow-hidden text-vz-ink lg:flex lg:min-h-[calc(100svh-7.6rem)] lg:flex-col"
      data-paused={motionPaused || undefined}
    >
      <svg aria-hidden="true" className="vz-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vz-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#ddd6fe" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" fill="url(#vz-wave)" opacity="0.55" />
        <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill="#f5f3fb" />
      </svg>

      <div
        className={`${WRAP} grid items-center gap-10 pb-16 pt-8 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:pb-10 lg:pt-6 xl:gap-12 short:pb-8 short:pt-4`}
      >
        <div>
          <p className="hero-fade inline-flex items-center gap-3 rounded-full bg-[#ece8ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#3b2a99] sm:px-5 sm:py-2.5 sm:text-[13px] short:py-2">
            <BookOpenText className="h-5 w-5 text-[#5b21b6]" aria-hidden="true" />
            Academic &amp; Professional Publishing
          </p>
          {/* The headline comes into register: its cyan, magenta and yellow
              plates start offset and settle onto each other. */}
          <h1 className="vz-misreg mt-6 text-balance text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.025em] text-vz-ink sm:text-6xl lg:text-[clamp(2.6rem,min(4.6vw,8svh),4.4rem)] short:mt-4">
            Where Great Writing Becomes a{" "}
            <span className="relative inline-block">
              <span className="hero-accent">Printed Reality</span>
              <svg aria-hidden="true" className="hero-swash" viewBox="0 0 300 24" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="vz-swash" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#4f46e5" />
                    <stop offset="1" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
                <path
                  d="M6 15 C 70 6 150 3 236 8 C 262 10 282 14 294 21"
                  fill="none"
                  stroke="url(#vz-swash)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  pathLength="1"
                />
              </svg>
            </span>
          </h1>
          <p className="hero-fade mt-6 max-w-xl text-lg leading-relaxed text-slate-600 short:mt-4 short:text-base">
            Seamless book creation through self-publishing, editing, cover design, ISBN &amp; patent
            registration, printing, and eBook distribution.
          </p>

          <ul className="hero-fade mt-6 grid max-w-2xl grid-cols-3 gap-2 sm:grid-cols-5 short:mt-4">
            {HERO_FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl bg-white/60 px-2 py-3 text-center text-[13px] font-semibold leading-tight text-vz-ink shadow-sm ring-1 ring-white backdrop-blur-sm short:gap-1 short:py-2 short:text-xs"
              >
                <Icon className="h-7 w-7 text-[#5b21b6] short:h-6 short:w-6" strokeWidth={1.6} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <div className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row short:mt-6">
            <a
              href="#publish-form"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(100deg,#3b1fd1,#6d28d9_60%,#8b3fe0)] px-8 text-[15px] font-bold text-white shadow-[0_14px_30px_-10px_rgb(91_33_182/0.6)] transition-shadow hover:shadow-[0_18px_36px_-10px_rgb(91_33_182/0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vz-violet short:h-12"
            >
              Start Publishing Today
              <ArrowRight className="h-5 w-5 motion-safe:transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <Link
              to="/book-store"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-full border-2 border-vz-ink/85 bg-white/50 px-8 text-[15px] font-bold text-vz-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vz-violet short:h-12"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Browse the Book Store
            </Link>
          </div>
        </div>

        <div className="relative">
          <PressScene covers={sceneCovers} />
          <button
            type="button"
            onClick={() => setMotionPaused((p) => !p)}
            aria-label={motionPaused ? "Play the press animation" : "Pause the press animation"}
            className="vz-motion-toggle absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-vz-ink/15 bg-white/80 text-vz-ink/60 transition-colors hover:border-vz-ink/50 hover:text-vz-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vz-violet"
          >
            {motionPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}

function ServiceTile({ service: { title, text, icon: Icon } }) {
  return (
    <li className="group flex flex-col bg-white p-7 transition-colors hover:bg-[#fbfaff] lg:p-9">
      <span className="vz-icon flex h-12 w-12 items-center justify-center">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 className="mt-10 font-display text-2xl font-bold leading-tight text-vz-ink">{title}</h3>
      <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
    </li>
  );
}

function FeaturedService({ service: { title, text, icon: Icon } }) {
  return (
    <li className="vz-feature relative isolate flex flex-col justify-between overflow-hidden p-8 text-white sm:col-span-2 lg:p-12">
      <span aria-hidden="true" className="vz-feature-diamond" />
      <span className="flex h-12 w-12 items-center justify-center border border-white/20 bg-white/10 text-vz-cyan">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="mt-16 lg:mt-24">
        <h3 className="max-w-xl font-display text-3xl font-bold leading-[1.05] tracking-[-0.01em] sm:text-4xl lg:text-5xl">
          {title}
        </h3>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{text}</p>
      </div>
    </li>
  );
}

/** Inside Our Process: a ruled bento grid, book publishing leading on a night tile. */
function Services() {
  return (
    <section className="bg-vz-paper py-20 lg:py-28">
      <div className={WRAP}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <Rule />
            <h2 className={`reveal mt-6 text-vz-ink ${H2}`}>Inside Our Process</h2>
          </div>
          <p className="text-lg leading-relaxed text-slate-600">
            A seamless, guided workflow ensuring precision, quality, and complete author support at
            every stage of the publishing journey.
          </p>
        </div>

        <ul className="mt-12 grid gap-px border border-vz-line bg-vz-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {services.map((s) =>
            s.featured ? <FeaturedService key={s.title} service={s} /> : <ServiceTile key={s.title} service={s} />
          )}
        </ul>
      </div>
    </section>
  );
}

/** From Draft to Global Bookshelves: the stats on a ruled strip, each topped
 *  by a stretch of one gradient rule with a diamond node. */
function FromDraft() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className={WRAP}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <Rule />
            <h2 className={`reveal mt-6 text-vz-ink ${H2}`}>From Draft to Global Bookshelves</h2>
          </div>
          <p className="reveal text-lg leading-relaxed text-slate-600">
            Veritaz International Press bridges the gap between innovative ideas and global
            recognition through complete publishing, patent protection, and academic support.
          </p>
        </div>

        <dl className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-3 lg:mt-20">
          {stats.map((s, i) => (
            <div key={s.label} className="vz-step reveal flex flex-col-reverse gap-3" style={{ "--i": i }}>
              <dt className="font-medium text-slate-600">{s.label}</dt>
              <dd className="vz-gradient-text-deep font-display text-6xl font-bold tabular-nums lg:text-8xl">
                <CountUp value={s.value} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row lg:mt-16">
          <PressButton href="#publish-form">Start Publishing Today</PressButton>
          <PressButton to="/contact" variant="ghostLight">
            Contact us
          </PressButton>
        </div>
      </div>
    </section>
  );
}

/** A row of covers the visitor pages through with the arrow buttons, or by
 *  swiping. Nothing moves on its own. */
function Shelf({ books }) {
  const rowRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [books, updateEdges]);

  const page = (direction) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: prefersCalm() ? "auto" : "smooth" });
  };

  if (!books.length) return null;

  return (
    <section className="vz-aurora relative isolate overflow-hidden py-20 text-white lg:py-28">
      <div className={`${WRAP} flex flex-wrap items-end justify-between gap-6`}>
        <div>
          <Rule tone="dark" />
          <h2 className={`reveal mt-6 ${H2}`}>From our shelves</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/book-store"
            className="mr-4 inline-flex items-center gap-2 font-bold text-white transition-colors hover:text-vz-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vz-cyan"
          >
            View all books
            <ArrowUpRight className="h-5 w-5" />
          </Link>
          <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-label="Previous books" className={ICON_BUTTON_DARK}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => page(1)} disabled={edge.end} aria-label="More books" className={ICON_BUTTON_DARK}>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className={`${WRAP} mt-10 lg:mt-14`}>
        {/* Runs out to the right edge of the page so the cut-off cover hints
            at more. The small inset on the left keeps focus rings unclipped. */}
        <ul
          ref={rowRef}
          onScroll={updateEdges}
          className="vz-shelf -ml-3 -mr-4 flex snap-x snap-mandatory scroll-pl-3 gap-5 overflow-x-auto py-4 pl-3 pr-4 sm:-mr-6 sm:pr-6 lg:-mr-20 lg:gap-8 lg:pr-20"
        >
          {books.map((book) => (
            <li key={book.id} className="w-[150px] flex-none snap-start sm:w-[180px] lg:w-[210px]">
              <Link
                to={bookPath(book)}
                className="vz-book group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vz-cyan"
              >
                <img
                  src={book.cover1}
                  alt={book.title}
                  loading="lazy"
                  className="vz-book-cover aspect-[3/4] w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_COVERS[0];
                  }}
                />
                <h3 className="mt-4 line-clamp-2 text-sm font-bold text-white transition-colors group-hover:text-vz-cyan">
                  {book.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-white/55">{book.authors}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Why authors choose us: the heading stays put while the reasons run down a
 *  ruled two-column sheet beside it. */
function Reasons() {
  return (
    <section className="bg-vz-paper py-20 lg:py-28">
      <div className={`${WRAP} grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16`}>
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Rule />
          <h2 className={`reveal mt-6 text-vz-ink ${H2}`}>Why Authors Choose Us</h2>
        </div>

        <ul className="grid border-t border-vz-line sm:grid-cols-2">
          {reasons.map(({ title, text, icon: Icon }) => (
            <li
              key={title}
              className="reveal group flex gap-5 border-b border-vz-line py-7 sm:last:col-span-2 sm:odd:pr-8 sm:even:pl-8 sm:[&:nth-child(odd):not(:last-child)]:border-r"
            >
              <span className="vz-icon flex h-11 w-11 flex-none items-center justify-center">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-vz-ink">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-slate-600">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Testimonials({ testimonials }) {
  const [index, setIndex] = useState(0);
  // Visitors who ask for less motion start paused and can press play.
  const [paused, setPaused] = useState(prefersCalm);
  const [held, setHeld] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const count = testimonials.length;

  useEffect(() => {
    if (count < 2 || paused || held || videoUrl) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 8000);
    return () => clearInterval(timer);
  }, [count, paused, held, videoUrl]);

  useEffect(() => {
    if (!videoUrl) return undefined;
    const onKey = (e) => e.key === "Escape" && setVideoUrl(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoUrl]);

  if (!count) return null;

  const current = testimonials[index % count];
  const hasVideo = (current.is_video_testimonial === true || current.is_video_testimonial === 1) && current.video_url;
  const long = (current.content || "").length > 280;
  const go = (step) => setIndex((i) => (i + step + count) % count);

  return (
    <section className="bg-white py-20 lg:py-28">
      <div
        className={`${WRAP} grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-x-16`}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
      >
        <div>
          <Eyebrow>Testimonials</Eyebrow>
          <h2 className={`reveal mt-5 text-vz-ink ${H2}`}>In our authors&apos; words</h2>
        </div>

        {/* Re-keyed so each new quote replays its entrance. */}
        <figure key={current.id ?? index} className="vz-quote flex flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-[420px]">
          {/* The glyph sits high in its em box, so the box is cut to its top half. */}
          <span aria-hidden="true" className="vz-gradient-text block h-[0.5em] w-fit font-display text-[7rem] font-bold leading-none lg:text-[9rem]">
            &ldquo;
          </span>
          <blockquote
            className={`mb-10 mt-4 font-display font-medium leading-snug tracking-[-0.01em] text-vz-ink ${
              long ? "text-xl lg:text-2xl" : "text-2xl lg:text-[2rem]"
            }`}
          >
            {current.content}
          </blockquote>
          <figcaption className="mt-auto flex flex-wrap items-center gap-4 border-t border-vz-line pt-8">
            <Avatar src={current.avatar_url} name={current.name} />
            <div className="min-w-0">
              <p className="font-bold text-vz-ink">{current.name}</p>
              <p className="text-sm text-slate-600">{current.designation}</p>
              <div className="mt-1 flex gap-0.5" role="img" aria-label={`${current.rating || 5} out of 5 stars`}>
                {Array.from({ length: Number(current.rating) || 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" aria-hidden="true" />
                ))}
              </div>
            </div>
            {hasVideo && (
              <button
                type="button"
                onClick={() => setVideoUrl(current.video_url)}
                className="vz-btn-primary inline-flex h-11 items-center gap-2 px-5 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vz-violet sm:ml-auto"
              >
                <Play className="h-4 w-4 fill-white" aria-hidden="true" />
                Watch Video
              </button>
            )}
          </figcaption>
        </figure>

        {count > 1 && (
          <div className="flex items-center gap-2 lg:col-start-1 lg:row-start-2 lg:self-end">
            <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className={ICON_BUTTON_LIGHT}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play testimonials" : "Pause testimonials"}
              className={ICON_BUTTON_LIGHT}
            >
              {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className={ICON_BUTTON_LIGHT}>
              <ArrowRight className="h-5 w-5" />
            </button>
            <span className="ml-3 text-sm font-bold tabular-nums text-slate-500">
              {(index % count) + 1} / {count}
            </span>
          </div>
        )}
      </div>

      {videoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Testimonial video"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-vz-night/85 p-4"
          onClick={(e) => e.target === e.currentTarget && setVideoUrl(null)}
        >
          <button
            type="button"
            onClick={() => setVideoUrl(null)}
            aria-label="Close video"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center border border-white/20 text-white hover:bg-white/15"
          >
            <X className="h-6 w-6" />
          </button>
          <video src={videoUrl} className="w-full max-w-3xl" controls autoPlay />
        </div>
      )}
    </section>
  );
}

// #8f8bb0 keeps the field outline at 3:1 against white.
const FIELD =
  "w-full border border-[#8f8bb0] bg-white px-4 text-slate-900 transition-colors focus:outline-none focus:border-vz-violet focus:ring-2 focus:ring-vz-violet/20";
const LABEL = "mb-1.5 block text-sm font-semibold text-vz-ink";

const contacts = [
  { href: "tel:+916380658876", icon: Phone, label: "+91 6380658876" },
  { href: "mailto:info@veritazinternational.com", icon: Mail, label: "info@veritazinternational.com" },
  { href: "https://wa.me/916380658876", icon: MessageCircle, label: "Join WhatsApp", external: true },
];

function InquiryForm() {
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading", message: "Sending..." });
    try {
      const { error } = await supabase.from("veritaz_inquiries").insert({
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        message: data.get("message"),
        form_type: "Book Publishing",
      });
      if (error) throw error;
      setStatus({ type: "success", message: "Thank you! We'll be in touch within 24 hours." });
      form.reset();
    } catch (error) {
      console.error("Inquiry failed:", error);
      setStatus({ type: "error", message: "Something went wrong. Please try again or call us." });
    }
  };

  return (
    // On wide screens the section is exactly one screen below the sticky
    // navbar (72px on phones, 80px from lg), and scroll-mt lands the anchor
    // links right under it. The `short` variant tightens it on low laptop
    // screens so the whole form still fits.
    <section
      id="publish-form"
      className="vz-proof-band relative isolate scroll-mt-[72px] overflow-hidden text-vz-ink lg:flex lg:min-h-[calc(100svh-5rem)] lg:scroll-mt-20 lg:items-center"
    >
      <span aria-hidden="true" className="vz-cmyk-band vz-cmyk-band--top" />
      <span aria-hidden="true" className="vz-halftone" />

      <div
        className={`${WRAP} grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 lg:py-12 xl:gap-24 short:py-8`}
      >
        <div>
          <InkSwatch />
          <h2 className="mt-6 font-display text-4xl font-bold leading-[1.04] tracking-[-0.02em] text-vz-ink sm:text-5xl xl:text-[3.6rem] short:mt-4 short:text-[2.75rem]">
            Have a manuscript? <span className="vz-gradient-text-deep">Let&apos;s publish it.</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600 short:mt-3 short:text-base">
            Tell us about your book and our team will get back to you within 24 hours.
          </p>
          <ul className="mt-8 grid max-w-lg gap-3 short:mt-5 short:gap-2">
            {contacts.map(({ href, icon: Icon, label, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex items-center gap-4 border border-vz-line bg-white px-3 py-3 font-semibold break-all transition-colors hover:border-vz-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vz-violet short:py-2"
                >
                  <span className="vz-icon flex h-10 w-10 flex-none items-center justify-center">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {label}
                  <ArrowUpRight
                    className="ml-auto h-4 w-4 flex-none text-vz-ink/35 transition-colors group-hover:text-vz-violet"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* The form as a press proof: crop marks and registration targets
            around a sheet with the process colours along its head. */}
        <div className="relative p-5 sm:p-7 short:p-4">
          <span aria-hidden="true" className="press-crop press-crop--tl" />
          <span aria-hidden="true" className="press-crop press-crop--tr" />
          <span aria-hidden="true" className="press-crop press-crop--bl" />
          <span aria-hidden="true" className="press-crop press-crop--br" />
          <span aria-hidden="true" className="press-reg press-reg--l" />
          <span aria-hidden="true" className="press-reg press-reg--r" />

          <form
            onSubmit={handleSubmit}
            className="reveal relative border border-vz-line bg-white p-6 text-slate-800 shadow-[0_30px_60px_-28px_rgb(23_19_61/0.35)] sm:p-8 short:p-6"
          >
            <span aria-hidden="true" className="vz-cmyk-band vz-cmyk-band--top" />
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl font-bold text-vz-ink lg:text-3xl short:text-2xl">Publish Your Book</h3>
              <span aria-hidden="true" className="hidden gap-0.5 sm:flex">
                {COLOR_BAR.map((color) => (
                  <span key={color} className="h-2 w-3" style={{ background: color }} />
                ))}
              </span>
            </div>
            <div className="mt-6 space-y-4 short:mt-4 short:space-y-3">
              <div>
                <label htmlFor="home-name" className={LABEL}>Your Name</label>
                <input id="home-name" name="name" type="text" autoComplete="name" required className={`${FIELD} h-11`} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 short:gap-3">
                <div>
                  <label htmlFor="home-email" className={LABEL}>Email Address</label>
                  <input id="home-email" name="email" type="email" autoComplete="email" required className={`${FIELD} h-11`} />
                </div>
                <div>
                  <label htmlFor="home-phone" className={LABEL}>Phone Number</label>
                  <input id="home-phone" name="phone" type="tel" autoComplete="tel" required className={`${FIELD} h-11`} />
                </div>
              </div>
              <div>
                <label htmlFor="home-message" className={LABEL}>Message</label>
                <textarea id="home-message" name="message" rows={3} className={`${FIELD} h-24 resize-y py-2.5 short:h-16`} />
              </div>
              <PressButton type="submit" disabled={status.type === "loading"} className="w-full">
                {status.type === "loading" ? "Sending..." : "Send Inquiry"}
              </PressButton>
              <p
                role="status"
                className={`min-h-5 text-center text-sm font-medium ${
                  status.type === "error" ? "text-red-600" : status.type === "success" ? "text-green-700" : "text-slate-500"
                }`}
              >
                {status.type === "loading" ? "" : status.message}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [books, setBooks] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [booksReady, setBooksReady] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      const [bookResult, testimonialResult] = await Promise.all([
        supabase
          .from("veritaz_books")
          .select("id, title, authors, cover1")
          .eq("status", "In Stock")
          .order("id", { ascending: false })
          .limit(24),
        supabase.from("veritaz_testimonials").select("*").order("id", { ascending: true }),
      ]);

      if (bookResult.error) console.error("Error fetching books:", bookResult.error);
      else setBooks((bookResult.data || []).filter((b) => b.cover1 && b.title));

      if (testimonialResult.error) console.error("Error fetching testimonials:", testimonialResult.error);
      else setTestimonials(testimonialResult.data || []);
    };

    fetchHomeData().finally(() => setBooksReady(true));
  }, []);

  useEffect(() => {
    document.title = "Best Book Publication Company in India | Veritaz International";
    setMeta('meta[name="description"]', { tag: "meta", attrs: { name: "description" }, prop: "content" },
      "Publish textbooks, research papers, patents, copyrights and academic journals with Veritaz International. Trusted publication experts across India.");
    setMeta('meta[name="keywords"]', { tag: "meta", attrs: { name: "keywords" }, prop: "content" },
      "Textbook Publishing India, Patent Filing Services, ISBN Registration, Copyright Services, Book Publishing Company, Veritaz International Press, Academic Publishing");
    setMeta('meta[name="robots"]', { tag: "meta", attrs: { name: "robots" }, prop: "content" }, "index, follow");
    setMeta('link[rel="canonical"]', { tag: "link", attrs: { rel: "canonical" }, prop: "href" },
      "https://www.veritazinternational.com/");
  }, []);

  const covers = useMemo(() => books.map((b) => b.cover1), [books]);

  return (
    <main>
      <Hero covers={covers} booksReady={booksReady} />
      <Services />
      <FromDraft />
      <Shelf books={books.slice(0, 12)} />
      <Reasons />
      <Testimonials testimonials={testimonials} />
      <InquiryForm />
    </main>
  );
}
