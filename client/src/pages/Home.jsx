import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeIndianRupee,
  Barcode,
  BookCopy,
  BookOpen,
  FileText,
  Globe,
  GraduationCap,
  Headset,
  Landmark,
  Languages,
  Layers,
  Lightbulb,
  Mail,
  MessageCircle,
  Megaphone,
  PenLine,
  Play,
  Phone,
  Presentation,
  Printer,
  Smile,
  Star,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { db } from "../lib/db";
import { mediaImg, retryOriginal } from "../lib/media";
import { useRowEdges } from "../lib/layout";
import { Accent, Pill, Rule, Swash } from "../components/PressUI";
import { BADGE_TONES as TONES, H2_FIT, SCREEN, SCREEN_PAD, WRAP } from "../components/pressLayout";
import LOGO from "../components/logo";
import { useSeo } from "../seo/useSeo";
import { PAGES, bookPath } from "../seo/site";
import cover1 from "photo:/assets/image/books/index-1.webp?cover";
import cover2 from "photo:/assets/image/books/index-2.webp?cover";
import cover3 from "photo:/assets/image/books/index-3.webp?cover";
import deskPhoto from "photo:/assets/image/our-company/laptop-books.webp?card";
// The hero's blurred library backdrop; seo/site.js preloads it, as the
// largest thing on the first screen.
import libraryBackdrop from "photo:/assets/image/our-company/bookshelf.webp?backdrop";

/* Home page in the "night press" look: night-ink bands lit by the logo's
   cyan-violet-orchid sweep, a display grotesque for headings, square corners
   and ruled hairline grids. The styles live under "Home page" in index.css. */


// Bundled covers, shown until the book list arrives or if a cover fails.
const FALLBACK_COVERS = [cover1, cover2, cover3];

/** Shows the first bundled cover in place of one that failed to load. */
function showFallbackCover(event) {
  const img = event.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  const { src, srcSet = "", sizes = "" } = FALLBACK_COVERS[0];
  img.srcset = srcSet;
  img.sizes = sizes;
  img.src = src;
}

/** <img> attributes for a cover: a bundled photo as it is, or a book's cover
 *  resized by Supabase; if that fails, the full file, then a bundled cover.
 *  `sizes` overrides how wide it is drawn (the shelf's 190px by default). */
function coverProps(cover, sizes) {
  const props =
    typeof cover === "string"
      ? { ...mediaImg(cover, "cover"), onError: retryOriginal(cover, showFallbackCover) }
      : { ...cover };
  if (sizes && props.srcSet) props.sizes = sizes;
  return props;
}

// Covers in the 3D press and the book fan: about 150px wide beside the text
// on wide screens, about a quarter of the screen on phones.
const SCENE_SIZES = "(min-width: 1024px) 160px, 26vw";

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

const prefersCalm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

function Avatar({ src, name, size = "h-14 w-14 text-lg" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className={`flex ${size} flex-shrink-0 items-center justify-center rounded-full bg-vz-violet font-bold text-white`}>
        {(name || "?").trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      {...mediaImg(src, "avatar")}
      alt={name || "Client"}
      className={`${size} flex-shrink-0 rounded-full object-cover ring-1 ring-vz-line`}
      onError={retryOriginal(src, () => setFailed(true))}
    />
  );
}

const ROUND_BUTTON =
  "flex h-12 w-12 flex-none items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-35";
const ROUND_DARK = `${ROUND_BUTTON} bg-white/10 text-white ring-1 ring-white/25 hover:bg-white hover:text-sf-navy focus-visible:outline-white`;
const ROUND_LIGHT = `${ROUND_BUTTON} bg-white text-vz-ink shadow-sm ring-1 ring-vz-line hover:bg-sf-indigo hover:text-white hover:ring-transparent focus-visible:outline-sf-violet`;


// The publishing steps, as tiles under the hero's paragraph.
const HERO_FEATURES = [
  { icon: PenLine, label: "Editing & Typesetting", color: "text-sf-indigo" },
  { icon: BookOpen, label: "Cover Design", color: "text-pink-600" },
  { icon: Barcode, label: "ISBN & Patent Registration", color: "text-amber-600" },
  { icon: Printer, label: "Printing & Production", color: "text-sky-600" },
  { icon: Layers, label: "eBook Distribution", color: "text-emerald-600" },
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
        top: <img {...coverProps(cover, SCENE_SIZES)} alt="" className="book3d-cover" />,
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
                  <img {...LOGO} sizes="34px" alt="" />
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
              <img {...coverProps(cover(i), SCENE_SIZES)} alt="" />
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
    <section className="vz-hero vz-hero-v2 relative isolate overflow-hidden text-vz-ink lg:flex lg:min-h-[calc(100svh-7.6rem)] lg:flex-col">
      {/* A library softly out of focus behind the press, fading out before
          the text. */}
      <span aria-hidden="true" className="vz-hero-library" style={{ "--vz-library": `url("${libraryBackdrop.src}")` }} />
      <svg aria-hidden="true" className="vz-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vz-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#ddd6fe" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" fill="url(#vz-wave)" opacity="0.55" />
        <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill="#f5f3ff" />
      </svg>

      <div
        className={`${WRAP} grid items-center gap-10 pb-16 pt-8 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:pb-10 lg:pt-6 xl:gap-12 short:pb-8 short:pt-4`}
      >
        <div>
          {/* The headline comes into register: its cyan, magenta and yellow
              plates start offset and settle onto each other. */}
          <h1 className="vz-misreg text-balance text-[2.25rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-vz-ink sm:text-5xl lg:text-[clamp(2.4rem,min(3.9vw,7.2svh),3.5rem)]">
            Where Great Writing Becomes a{" "}
            <span className="relative inline-block">
              <span className="hero-accent">Printed Reality</span>
              <Swash />
            </span>
          </h1>
          <p className="hero-fade mt-6 max-w-xl text-base leading-relaxed text-slate-600 lg:text-[17px] short:mt-4 short:text-[15px]">
            Seamless book creation through self-publishing, editing, cover design, ISBN &amp; patent
            registration, printing, and eBook distribution.
          </p>

          <ul className="hero-fade mt-6 grid max-w-2xl grid-cols-3 gap-2 sm:grid-cols-5 short:mt-4">
            {HERO_FEATURES.map(({ icon: Icon, label, color }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl bg-white/60 px-2 py-3 text-center text-[13px] font-semibold leading-tight text-vz-ink shadow-sm ring-1 ring-white backdrop-blur-sm short:gap-1 short:py-2 short:text-xs"
              >
                <Icon className={`h-7 w-7 short:h-6 short:w-6 ${color}`} strokeWidth={1.6} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <div className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row short:mt-6">
            <Pill to="/contact" arrow>
              Start Publishing Today
            </Pill>
            <Pill to="/book-store" variant="outline" icon={BookOpen}>
              Browse the Book Store
            </Pill>
          </div>
        </div>

        <div className="relative">
          <PressScene covers={sceneCovers} />
        </div>
      </div>
    </section>
  );
}

/** A hardcover standing up, cover to the front: its fore-edge pages show on
 *  the right, the cloth spine on the left. Stands on the floor of a 3D stage. */
function StandingBook({ cover, board, x, z, ry, className = "" }) {
  return (
    <Cuboid
      w={118}
      h={158}
      d={22}
      x={x}
      y={-79}
      z={z}
      ry={ry}
      className={`bookstand ${className}`}
      vars={{ "--board": board }}
      faces={{
        front: <img {...coverProps(cover, SCENE_SIZES)} alt="" className="book3d-cover" />,
        right: <span className="bookstand-pages" />,
        top: <span className="bookstand-top" />,
        left: <span className="book3d-spine" />,
      }}
    />
  );
}

/** Three real books standing in a fan; they spread when the card is hovered. */
function BookFan({ covers }) {
  const pick = (i) => covers[i % covers.length];
  return (
    <div aria-hidden="true" className="fan">
      <div className="fan-stage">
        <Plane w={380} h={170} z={0} turn="rotateX(90deg)" className="floor-shadow fan-shadow" />
        <StandingBook cover={pick(1)} board="#1e3a8a" x={-98} z={-34} ry={16} className="fan-book--l" />
        <StandingBook cover={pick(2)} board="#7a1f2b" x={98} z={-34} ry={-16} className="fan-book--r" />
        <StandingBook cover={pick(0)} board="#3b0764" x={0} z={26} ry={0} className="fan-book--c" />
      </div>
    </div>
  );
}

function ServiceTile({ service: { title, text, icon: Icon }, tone = "" }) {
  return (
    <li className="svc-card group relative isolate flex flex-col overflow-hidden rounded-3xl bg-white p-6 short:p-4">
      <span aria-hidden="true" className="svc-card-glow" />
      <div className="flex items-center gap-4 short:gap-3">
        <span className={`svc-badge svc-badge--sm ${tone}`}>
          <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h3 className="text-[17px] font-bold leading-snug tracking-[-0.01em] text-vz-ink short:text-base">{title}</h3>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600 short:mt-2 short:text-[13px] short:leading-normal">{text}</p>
    </li>
  );
}

function FeaturedService({ service: { title, text, icon: Icon }, covers }) {
  return (
    <li className="svc-feature group relative isolate overflow-hidden rounded-3xl p-6 text-white sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:flex lg:flex-col short:p-5">
      <div className="grid gap-6 md:grid-cols-2 md:items-center lg:flex lg:flex-1 lg:flex-col lg:items-stretch lg:gap-0">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <span className="svc-badge svc-badge--glass">
              <Icon className="relative z-10 h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h3 className="text-xl font-bold leading-tight tracking-[-0.02em] xl:text-2xl short:text-lg">{title}</h3>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-white/80 short:mt-3 short:text-[13px] short:leading-normal">{text}</p>
        </div>
        <div className="lg:my-auto">
          <BookFan covers={covers} />
        </div>
      </div>
    </li>
  );
}


const H2_SANS = "font-extrabold leading-[1.05] tracking-[-0.025em] text-vz-ink";

/** Inside Our Process: book publishing leads on a tall violet card with real
 *  books standing in 3D, beside the other four services in a 2 x 2 grid of
 *  cards with glossy icon badges. Fits one screen on wide screens. */
function Services({ covers }) {
  const books = covers.length ? covers : FALLBACK_COVERS;
  return (
    <section className={`vz-services relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={WRAP}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <Rule />
            <h2 className={`reveal mt-5 ${H2_SANS} ${H2_FIT} short:mt-3`}>
              Inside Our <Accent>Process</Accent>
            </h2>
          </div>
          <p className="reveal text-base leading-relaxed text-slate-600 lg:text-[17px] short:text-[15px]">
            A seamless, guided workflow ensuring precision, quality, and complete author support at
            every stage of the publishing journey.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,3.5fr)_minmax(0,3.5fr)] short:mt-5 short:gap-3">
          {services.map((s, i) =>
            s.featured ? (
              <FeaturedService key={s.title} service={s} covers={books} />
            ) : (
              <ServiceTile key={s.title} service={s} tone={TONES[i % TONES.length]} />
            )
          )}
        </ul>
      </div>
    </section>
  );
}

/** From Draft to Global Bookshelves: the three stats as glass cards on a
 *  dashed journey line, each with a glossy badge and a count-up number. */
const STAT_ICONS = [BookOpen, Lightbulb, Smile];
const STAT_TONES = ["", "svc-badge--amber", "svc-badge--emerald"];

function FromDraft() {
  return (
    <section className={`vz-draft relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={WRAP}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <Rule />
            <h2 className={`reveal mt-5 ${H2_SANS} ${H2_FIT} short:mt-3`}>
              From Draft to Global <Accent>Bookshelves</Accent>
            </h2>
          </div>
          <p className="reveal text-base leading-relaxed text-slate-600 lg:text-[17px] short:text-[15px]">
            Veritaz International Press bridges the gap between innovative ideas and global
            recognition through complete publishing, patent protection, and academic support.
          </p>
        </div>

        <div className="relative mt-10 lg:mt-14 short:mt-8">
          <span aria-hidden="true" className="draft-path" />
          <dl className="relative grid gap-4 sm:grid-cols-3 lg:gap-6">
            {stats.map((s, i) => {
              const Icon = STAT_ICONS[i];
              return (
                <div key={s.label} className="draft-card svc-card reveal relative isolate flex flex-col overflow-hidden rounded-3xl p-6 short:p-5">
                  <span aria-hidden="true" className="svc-card-glow" />
                  <dt className="order-last mt-2 font-semibold text-slate-600">{s.label}</dt>
                  <dd>
                    <span aria-hidden="true" className={`svc-badge svc-badge--sm mb-5 short:mb-3 ${STAT_TONES[i]}`}>
                      <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="vz-gradient-text-deep block text-[clamp(2.5rem,min(4.4vw,8svh),3.75rem)] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
                      <CountUp value={s.value} />
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row lg:mt-12 short:mt-8">
          <Pill to="/contact" arrow>
            Start Publishing Today
          </Pill>
          <Pill to="/contact" variant="outline">
            Contact us
          </Pill>
        </div>
      </div>
    </section>
  );
}

/** From our shelves: real books standing on a lit glass shelf in a violet
 *  band, paged with the arrow buttons or by swiping. Nothing moves on its own. */
function Shelf({ books }) {
  const rowRef = useRef(null);
  // The arrows turn off at either end of the row (watched without measuring).
  const edge = useRowEdges(rowRef, [books]);

  const page = (direction) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: prefersCalm() ? "auto" : "smooth" });
  };

  if (!books.length) return null;

  return (
    <section className={`vz-shelf-band relative isolate overflow-hidden text-white ${SCREEN_PAD} ${SCREEN}`}>
      <div className={`${WRAP} flex flex-wrap items-end justify-between gap-6`}>
        <div>
          <Rule tone="dark" />
          <h2 className={`reveal mt-5 ${H2_SANS} ${H2_FIT} text-white short:mt-3`}>
            From our <Accent tone="light">shelves</Accent>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Pill to="/book-store" variant="light" arrow className="mr-1">
            View all books
          </Pill>
          <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-label="Previous books" className={ROUND_DARK}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => page(1)} disabled={edge.end} aria-label="More books" className={ROUND_DARK}>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className={`${WRAP} shelf-wrap relative mt-8 lg:mt-10 short:mt-5`}>
        {/* The glass shelf stays put while the books slide along it. */}
        <span aria-hidden="true" className="shelf-plank" />
        {/* Runs out to the right edge of the page so the cut-off book hints
            at more. The inset on the left keeps focus rings unclipped. */}
        <ul
          ref={rowRef}
          className="vz-shelf relative -ml-3 -mr-4 flex snap-x snap-mandatory scroll-pl-3 gap-6 overflow-x-auto pb-4 pl-3 pr-4 pt-5 sm:-mr-6 sm:pr-6 lg:-mr-20 lg:gap-9 lg:pr-20"
        >
          {books.map((book) => (
            <li key={book.id} className="shelf-item flex-none snap-start">
              <Link
                to={bookPath(book)}
                className="shelf-book group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <span className="shelf-book-3d">
                  <img {...coverProps(book.cover1)} alt={book.title} loading="lazy" />
                </span>
                <h3 className="mt-6 line-clamp-2 text-sm font-bold text-white transition-colors group-hover:text-sf-lavender">
                  {book.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-white/60">{book.authors}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Why authors choose us: the reasons printed in a hardcover book that opens
 *  as it scrolls into view and then turns its own pages, a spread every few
 *  seconds, riffling back to the start after the last; it holds while the
 *  pointer or keyboard focus is on it.
 *  Click or swipe a page, use the arrows, or pick a reason from the contents
 *  to turn to it (a jump riffles through the pages in between). On phones the
 *  pages sit in a row you swipe through. The rb-* styles live in index.css. */

// The cover's back carries the first reason; each leaf after it carries two,
// front (a right-hand page) and back (the left-hand page once turned).
const BOOK_LEAVES = 1 + Math.ceil((reasons.length - 1) / 2);
const LAST_SPREAD = BOOK_LEAVES - 1;
// How long each spread stays open while the pages turn by themselves, and
// how long the book waits after a visitor turns a page themselves.
const TURN_EVERY = 2000;
const WAIT_AFTER_USER = 7000;
const pageNo = (i) => String(i + 1).padStart(2, "0");

/** One printed page: a running head, the reason's badge, title and text with
 *  a drop cap, its icon faint in the corner, and the page number. */
function ReasonPage({ index }) {
  const reason = reasons[index];
  if (!reason) {
    // The last page: the press's mark, as at the end of a book.
    return (
      <div className="rb-page rb-page--end" aria-hidden="true">
        <span className="rb-end-mark">
          <img {...LOGO} alt="" loading="lazy" />
        </span>
        <span className="rb-end-rule" />
      </div>
    );
  }
  const { title, text, icon: Icon } = reason;
  return (
    <div className="rb-page">
      <span className="rb-runhead" aria-hidden="true">
        <img {...LOGO} sizes="18px" alt="" loading="lazy" />
        <span />
      </span>
      <span className={`svc-badge svc-badge--sm rb-badge ${TONES[index % TONES.length]}`} aria-hidden="true">
        <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
      </span>
      <h3 className="rb-title">{title}</h3>
      <p className="rb-text">{text}</p>
      <Icon className="rb-ghost" strokeWidth={1.2} aria-hidden="true" />
      <span className="rb-folio" aria-hidden="true">
        {pageNo(index)}
      </span>
    </div>
  );
}

function Reasons() {
  // s: the open spread (-1 = closed); from: the spread it last turned from,
  // so the pages in between can turn one after another.
  // by: who turned last ("auto" or "user"), so the book waits longer after a
  // visitor turns a page themselves.
  const [view, setView] = useState(() => ({ s: prefersCalm() ? 0 : -1, from: -1, by: "auto" }));
  const { s, from, by } = view;
  // The pages turn by themselves while the book is on screen, holding while
  // the pointer is over it or a key has focused one of its controls. Not for
  // visitors who ask for less motion.
  const [autoTurn] = useState(() => !prefersCalm());
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const stageRef = useRef(null);
  const touched = useRef(false);
  const opened = useRef(false);
  const swipe = useRef({ x: 0, moved: false });
  const running = autoTurn && !hovered && !focused && inView && s >= 0;

  const go = useCallback((next, who = "auto") => {
    setView((v) => {
      const n = Math.max(-1, Math.min(LAST_SPREAD, next));
      return n === v.s ? v : { s: n, from: v.s, by: who };
    });
  }, []);
  const turnTo = (next) => {
    touched.current = true;
    go(next, "user");
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Open the book the first time it comes into view, unless the visitor has
  // already turned to a page.
  useEffect(() => {
    if (!inView || opened.current || touched.current || s !== -1) return;
    const t = setTimeout(() => {
      opened.current = true;
      go(0);
    }, 300);
    return () => clearTimeout(t);
  }, [inView, s, go]);

  // Turn to the next spread after a pause; from the last one, riffle back to
  // the first and carry on.
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => go(s >= LAST_SPREAD ? 0 : s + 1), by === "user" ? WAIT_AFTER_USER : TURN_EVERY);
    return () => clearTimeout(t);
  }, [running, s, by, go]);

  // Once a jump has finished turning, clear its delays so hovering a page
  // lifts it at once.
  useEffect(() => {
    if (from === s) return;
    const steps = Math.abs(s - from);
    const t = setTimeout(() => setView((v) => (v.s === s ? { ...v, from: v.s } : v)), 700 + steps * 60);
    return () => clearTimeout(t);
  }, [s, from]);

  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, moved: false };
  };
  const onPointerUp = (e) => {
    const dx = e.clientX - swipe.current.x;
    if (Math.abs(dx) < 40) return;
    swipe.current.moved = true;
    turnTo(dx < 0 ? s + 1 : s - 1);
  };
  const onLeafClick = (leaf) => {
    if (swipe.current.moved) {
      swipe.current.moved = false;
      return;
    }
    if (leaf === s + 1 || (s === -1 && leaf === 0)) turnTo(s + 1);
    else if (leaf === s) turnTo(s - 1);
  };

  const shown = s < 0 ? [] : [2 * s, 2 * s + 1];

  return (
    <section className={`vz-services rb-section relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={`${WRAP} grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center lg:gap-12 xl:gap-16`}>
        {/* min-w-0: the phone row of pages must not widen the column. */}
        <div className="min-w-0">
          <Rule />
          <h2 className={`reveal mt-5 ${H2_SANS} ${H2_FIT} short:mt-3`}>
            Why Authors <Accent>Choose Us</Accent>
          </h2>

          {/* Contents: each reason with its page number; picks its spread. */}
          <ol className="rb-toc mt-7 hidden lg:block short:mt-4">
            {reasons.map(({ title }, i) => {
              const current = shown.includes(i);
              return (
                <li key={title}>
                  <button
                    type="button"
                    onClick={() => turnTo(Math.floor(i / 2))}
                    aria-current={current ? "true" : undefined}
                    className="rb-toc-item group flex w-full items-baseline gap-2 rounded-md py-[5px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-violet short:py-[3px]"
                  >
                    <span className="rb-toc-mark" aria-hidden="true" />
                    <span className="rb-toc-title">{title}</span>
                    <span className="rb-toc-leader" aria-hidden="true" />
                    <span className="rb-toc-no" aria-hidden="true">
                      {pageNo(i)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="min-w-0">
          {/* The book (tablets and up). */}
          <div
            ref={stageRef}
            className="rb-stage hidden md:block"
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
          >
            <div
              className="rb-book"
              data-closed={s < 0 || undefined}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              <div className="rb-body">
                <span className="rb-shadow" aria-hidden="true" />
                <span className="rb-board" aria-hidden="true">
                  <span className="rb-ribbon" />
                </span>
                <div className="rb-base rb-paper rb-paper--right">
                  <ReasonPage index={reasons.length + 1} />
                </div>

                {Array.from({ length: BOOK_LEAVES }, (_, leaf) => {
                  const turned = leaf <= s;
                  // Turned leaves stack up on the left, the latest on top;
                  // the rest wait on the right, the next one on top.
                  const z = turned ? leaf + 1 : BOOK_LEAVES - leaf + 1;
                  const delay =
                    from < s && leaf > from && leaf <= s
                      ? (leaf - from - 1) * 60
                      : s < from && leaf > s && leaf <= from
                        ? (from - leaf) * 60
                        : 0;
                  const backIndex = leaf === 0 ? 0 : 2 * leaf;
                  const frontIndex = 2 * leaf - 1;
                  const isNext = leaf === s + 1;
                  const isPrev = leaf === s;
                  // Leaves turning right now: their faces shade as they lift.
                  const turning = from !== s && leaf > Math.min(from, s) && leaf <= Math.max(from, s);
                  return (
                    <div
                      key={leaf}
                      className={`rb-leaf ${leaf === 0 ? "rb-leaf--cover" : ""}`}
                      data-turned={turned || undefined}
                      data-turning={turning || undefined}
                      data-next={isNext || undefined}
                      data-prev={isPrev || undefined}
                      style={{ zIndex: z, "--d": `${delay}ms` }}
                      onClick={() => onLeafClick(leaf)}
                    >
                      <div className={`rb-face rb-face--front ${leaf === 0 ? "rb-cover" : "rb-paper rb-paper--right"}`} aria-hidden={!isNext}>
                        {leaf === 0 ? (
                          <>
                            <span className="rb-cover-dots" />
                            <span className="rb-cover-frame" />
                            <span className="rb-cover-medal">
                              <img {...LOGO} alt="" loading="lazy" />
                            </span>
                          </>
                        ) : (
                          <ReasonPage index={frontIndex} />
                        )}
                      </div>
                      <div className={`rb-face rb-face--back ${leaf === 0 ? "rb-endpaper" : "rb-paper rb-paper--left"}`} aria-hidden={!isPrev}>
                        {leaf === 0 ? (
                          <div className="rb-paper rb-paper--left rb-pasted">
                            <ReasonPage index={backIndex} />
                          </div>
                        ) : (
                          <ReasonPage index={backIndex} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 short:mt-5">
              <button type="button" onClick={() => turnTo(s - 1)} disabled={s < 0} aria-label="Previous page" className={ROUND_LIGHT}>
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="rb-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${(s + 1) / BOOK_LEAVES})` }} />
              </span>
              <button type="button" onClick={() => turnTo(s + 1)} disabled={s >= LAST_SPREAD} aria-label="Next page" className={ROUND_LIGHT}>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Phones: the pages in a row to swipe through. */}
          <ol className="rb-strip -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-2 sm:-mx-6 sm:px-6 md:hidden">
            {reasons.map(({ title }, i) => (
              <li key={title} className="rb-card rb-paper rb-paper--right flex-none snap-center">
                <ReasonPage index={i} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const isVideo = (t) => (t.is_video_testimonial === true || t.is_video_testimonial === 1) && Boolean(t.video_url);

/** One review on its newsprint cutting: quote, then the author's byline,
 *  with a Watch Video button when `onWatch` is given. */
function ClipPaper({ t, onWatch }) {
  const long = (t.content || "").length > 280;
  return (
    <div className="tm-paper">
      <span className="tm-mark" aria-hidden="true">
        &ldquo;
      </span>
      <blockquote
        className={`mb-6 font-medium leading-relaxed text-vz-ink short:mb-4 ${long ? "text-[15px] lg:text-base" : "text-base lg:text-[17px]"}`}
      >
        {t.content}
      </blockquote>
      <figcaption className="tm-byline mt-auto flex flex-wrap items-center gap-4 pt-5 short:pt-4">
        <span className="rounded-full bg-[linear-gradient(135deg,var(--color-sf-indigo),var(--color-sf-violet))] p-[2px]">
          <Avatar src={t.avatar_url} name={t.name} />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-vz-ink">{t.name}</p>
          <p className="text-sm text-slate-600">{t.designation}</p>
          <div className="mt-1 flex gap-0.5" role="img" aria-label={`${t.rating || 5} out of 5 stars`}>
            {Array.from({ length: Number(t.rating) || 5 }).map((_, k) => (
              <Star key={k} className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" aria-hidden="true" />
            ))}
          </div>
        </div>
        {onWatch && (
          <Pill onClick={onWatch} icon={Play} className="h-11 px-5 text-sm sm:ml-auto short:h-11">
            Watch Video
          </Pill>
        )}
      </figcaption>
    </div>
  );
}

/** Testimonials: each review set as a press clipping taped up, with the
 *  previous and next clippings fanned out behind it. The reviews change by
 *  themselves, holding while the pointer or focus is on them (not for
 *  visitors who ask for less motion); the arrows, the side clippings and the
 *  authors' portraits pick one directly. Every clipping stays in the page so
 *  each change slides them between places. The tm-* styles live in index.css. */
function Testimonials({ testimonials }) {
  const [index, setIndex] = useState(0);
  const [calm] = useState(prefersCalm);
  const [held, setHeld] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const stageRef = useRef(null);
  const count = testimonials.length;

  // Each clipping is cut to its own review, and the two tucked behind are
  // cut to the one in front, so a short review shows no blank newsprint.
  // The front clipping's height is handed to the CSS as --tm-front. The
  // ResizeObserver reports it once layout is done (and again whenever it
  // changes), still before the frame is painted; reading offsetHeight here
  // instead would make the browser lay the page out on the spot.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const front = stage?.querySelector('.tm-clip[data-role="front"]');
    if (!front) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
      stage.style.setProperty("--tm-front", `${height}px`);
    });
    observer.observe(front, { box: "border-box" });
    return () => observer.disconnect();
  }, [index, count]);

  useEffect(() => {
    if (count < 2 || calm || held || videoUrl) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(timer);
  }, [count, calm, held, videoUrl]);

  useEffect(() => {
    if (!videoUrl) return undefined;
    const onKey = (e) => e.key === "Escape" && setVideoUrl(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoUrl]);

  if (!count) return null;

  const at = (i) => ((i % count) + count) % count;
  const current = at(index);
  const go = (step) => setIndex((i) => at(i + step));
  // Where each clipping sits: in front, tucked behind to either side, or put away.
  const roleOf = (i) => {
    if (i === current) return "front";
    if (count > 1 && i === at(current + 1)) return "next";
    if (count > 2 && i === at(current - 1)) return "prev";
    return "away";
  };
  const longest = testimonials.reduce((a, b) => ((b.content || "").length > (a.content || "").length ? b : a));

  return (
    <section className={`vz-draft relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div
        className={`${WRAP} grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center lg:gap-x-16`}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
      >
        <div className="min-w-0">
          <Rule />
          <h2 className={`reveal mt-5 ${H2_SANS} ${H2_FIT}`}>
            In our authors&apos; <Accent>words</Accent>
          </h2>

          {count > 1 && (
            <>
              {/* The authors' portraits: each brings up their clipping. */}
              <ul className="mt-8 flex flex-wrap gap-2.5 short:mt-5">
                {testimonials.map((t, i) => (
                  <li key={t.id ?? i}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={t.name || `Testimonial ${i + 1}`}
                      aria-current={i === current ? "true" : undefined}
                      className="tm-face rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-violet"
                    >
                      <Avatar src={t.avatar_url} name={t.name} size="h-11 w-11 text-base" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-2 short:mt-4">
                <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className={ROUND_LIGHT}>
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className={ROUND_LIGHT}>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <span className="ml-3 text-sm font-bold tabular-nums text-slate-500">
                  {current + 1} / {count}
                </span>
              </div>
            </>
          )}
        </div>

        <div ref={stageRef} className="tm-stage min-w-0">
          <span className="tm-dots" aria-hidden="true" />
          {testimonials.map((t, i) => {
            const role = roleOf(i);
            const front = role === "front";
            const turn = role === "prev" ? () => go(-1) : role === "next" ? () => go(1) : undefined;
            return (
              <figure
                key={t.id ?? i}
                className="tm-clip"
                data-role={role}
                aria-hidden={front ? undefined : "true"}
                inert={role === "away" || undefined}
                onClick={turn}
              >
                <span className="tm-tape" aria-hidden="true" />
                <ClipPaper t={t} onWatch={front && isVideo(t) ? () => setVideoUrl(t.video_url) : undefined} />
              </figure>
            );
          })}
          {/* An unseen copy of the longest review holds the stage at its
              height, so the section, its heading and the arrows stay put
              whichever review is in front. */}
          <figure className="tm-clip tm-sizer" aria-hidden="true" inert>
            <ClipPaper t={longest} onWatch={isVideo(longest) ? () => {} : undefined} />
          </figure>
        </div>
      </div>

      {videoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Testimonial video"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-sf-navy/85 p-4"
          onClick={(e) => e.target === e.currentTarget && setVideoUrl(null)}
        >
          <button
            type="button"
            onClick={() => setVideoUrl(null)}
            aria-label="Close video"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>
          <video src={videoUrl} className="w-full max-w-3xl rounded-2xl" controls autoPlay />
        </div>
      )}
    </section>
  );
}

/** Reach out: the page closes on an invitation to get in touch, on a violet
 *  card with a desk photo, two real book covers and a telephone receiver
 *  hanging in from the top that sways a little as the card scrolls by. The
 *  button leads to the Contact page. The ro-* styles live in index.css. */
function ReachOut() {
  return (
    <section className={`vz-draft relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={WRAP}>
        <div className="ro-card relative isolate overflow-hidden rounded-[2.5rem] text-white lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-stretch">
          <span className="ro-dots" aria-hidden="true" />

          <div className="relative z-10 px-6 pb-4 pt-12 sm:px-12 lg:py-16 lg:pl-16 xl:pl-20 short:py-10">
            <Rule tone="dark" />
            <h2 className={`reveal mt-5 ${H2_FIT} leading-[1.1] text-white short:mt-3`}>
              Ready To Publish Your <Accent tone="light">Book?</Accent>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 lg:text-[17px] short:mt-4">
              Tell us about your book and our team will get back to you within 24 hours.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap short:mt-6">
              <Pill to="/contact" variant="light" arrow>
                Get in Touch
              </Pill>
              <Pill href="tel:+916380658876" variant="outline-light" icon={Phone}>
                +91 6380658876
              </Pill>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-white/85 short:mt-5">
              <li>
                <a
                  href="mailto:info@veritazinternational.com"
                  className="inline-flex items-center gap-2 break-all transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <Mail className="h-4 w-4 flex-none text-amber-300" aria-hidden="true" />
                  info@veritazinternational.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/916380658876"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <MessageCircle className="h-4 w-4 flex-none text-amber-300" aria-hidden="true" />
                  Join WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* The picture: desk photo, book covers and the hanging receiver. */}
          <div className="ro-visual relative" aria-hidden="true">
            <img {...deskPhoto} sizes="(min-width: 1024px) 18rem, 54vw" alt="" loading="lazy" className="ro-photo" />
            <img {...FALLBACK_COVERS[1]} alt="" loading="lazy" className="ro-cover ro-cover--back" />
            <img {...FALLBACK_COVERS[0]} alt="" loading="lazy" className="ro-cover ro-cover--front" />
            <img src="/assets/image/contact-phone.webp" alt="" loading="lazy" className="ro-phone" />
          </div>
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
      const supabase = await db();
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

  useSeo(PAGES["/"]);

  const covers = useMemo(() => books.map((b) => b.cover1), [books]);

  return (
    <main>
      <Hero covers={covers} booksReady={booksReady} />
      <Services covers={covers} />
      <FromDraft />
      <Shelf books={books.slice(0, 12)} />
      <Reasons />
      <Testimonials testimonials={testimonials} />
      <ReachOut />
    </main>
  );
}
