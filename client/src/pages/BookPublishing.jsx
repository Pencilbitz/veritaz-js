import { Fragment, useEffect, useRef, useState } from "react";
import {
  Barcode,
  BookOpen,
  Check,
  ChevronRight,
  Feather,
  FileSearch,
  FileText,
  Globe,
  GraduationCap,
  ListOrdered,
  MessagesSquare,
  PenTool,
  Printer,
  ShieldCheck,
  Sparkles,
  SquarePen,
  Type,
  Users,
} from "lucide-react";
import { Accent, Eyebrow, Pill, Rule, Swash } from "../components/PressUI";
import { H2_FIT, SCREEN, SCREEN_PAD, WRAP } from "../components/pressLayout";
import { useSeo } from "../seo/useSeo";
import { PAGES } from "../seo/site";
import LOGO from "../components/logo";
import { afterPaint } from "../lib/layout";
// The hero book's cover; seo/site.js preloads it (with the sizes used below).
import HERO_COVER from "photo:/assets/image/publishing-hero/quantum-computing-front.webp?cover";
import tomeFront from "photo:/assets/image/publishing-hero/data-structures-front.webp?cover";
import tomeBack from "photo:/assets/image/publishing-hero/data-structures-back.webp?cover";
import pileBlue from "photo:/assets/image/publishing-covers/blue-economy.webp?cover";
import pileResearch from "photo:/assets/image/publishing-covers/research.webp?cover";
// This page's own styles (index.css has the shared ones).
import "../styles/publishing.css";

/* Book Publishing, in the home page's "press" look: a lavender hero with a
   real book that opens on the desk, the services on white as tabs (each
   opening like a book spread, with its own hardcover), the process on the navy band beside a finished
   book, and a close on an indigo-to-violet card with a pile of books. The
   bp-* styles live in styles/publishing.css. */

const H2 =`${H2_FIT} leading-[1.1] text-vz-ink`;
const H2_LIGHT = `${H2_FIT} leading-[1.1] text-white`;

const featuredService = {
  id: "edited-books",
  cover: ["#1e1b4b", "#4f46e5"],
  tint: "#eef2ff",
  title: "Edited Books",
  Icon: SquarePen,
  chip: "bg-vz-ink text-white",
  text: "If you are collecting chapters or writing from different authors, we help you turn them into one complete, professionally published book.",
  points: [
    { label: "Author Communication:", text: "We handle tracking and gathering all author submissions.", Icon: MessagesSquare },
    { label: "Style Matching:", text: "We make sure all chapters follow the same formatting, fonts, and layout.", Icon: Type },
    { label: "Book Organization:", text: "We arrange all chapters, pages, and indexing in proper order.", Icon: ListOrdered },
    { label: "Official Rules:", text: "We ensure the final book meets all university and academic publishing standards.", Icon: ShieldCheck },
  ],
};

const services = [
  {
    id: "fiction-novels",
    cover: ["#2e1065", "#7c3aed"],
    tint: "#f5f3ff",
    title: "Fiction Novels",
    Icon: BookOpen,
    tone: "",
    chip: "bg-violet-100 text-violet-700",
    text: "Whether you write epic adventures, suspense, speculative fiction, or contemporary drama, we support authors across all story styles from raw manuscript to global release.",
    points: ["Professional editing", "Cover design", "Marketing support"],
  },
  {
    id: "thesis-books",
    cover: ["#0c4a6e", "#0284c7"],
    tint: "#f0f9ff",
    title: "Thesis Books",
    Icon: GraduationCap,
    tone: "svc-badge--sky",
    chip: "bg-sky-100 text-sky-700",
    text: "Convert your academic thesis or dissertation into a published book that scholars and everyday readers can easily find and read.",
    points: ["Academic Formatting", "Editorial Review", "Library Distribution"],
  },
  {
    id: "poetry-books",
    cover: ["#78350f", "#d97706"],
    tint: "#fffbeb",
    title: "Poetry Books",
    Icon: Feather,
    tone: "svc-badge--amber",
    chip: "bg-amber-100 text-amber-700",
    text: "Celebrate your verse with beautifully published collections that honor the natural rhythm and emotion of your words.",
    points: ["Lyrical formatting", "Artistic layout", "Poetry community outreach"],
  },
  {
    id: "short-stories",
    cover: ["#831843", "#db2777"],
    tint: "#fdf2f8",
    title: "Short Stories",
    Icon: FileText,
    tone: "svc-badge--pink",
    chip: "bg-pink-100 text-pink-700",
    text: "Whether publishing a single piece or a full story collection, we help writers create impactful books that captivate readers.",
    points: ["Collection compilation", "Anthology opportunities", "Literary magazine submissions"],
  },
  {
    id: "conference-proceedings",
    cover: ["#064e3b", "#059669"],
    tint: "#ecfdf5",
    title: "Conference Proceedings",
    href: "/conference-proceedings",
    linkTitle: true,
    Icon: Users,
    tone: "svc-badge--emerald",
    chip: "bg-emerald-100 text-emerald-700",
    text: "Record and share the knowledge from your academic and professional conferences with professionally published books.",
    points: ["Rapid publication", "ISBN assignment", "Academic indexing"],
  },
];

const contents = [featuredService, ...services];
const contentIds = contents.map((service) => service.id);

// The services change by themselves, one every SERVICE_EVERY ms, and wait
// SERVICE_WAIT_AFTER_USER ms after a visitor picks one themselves.
const SERVICE_EVERY = 2500;
const SERVICE_WAIT_AFTER_USER = 6000;
const prefersCalm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const steps = [
  {
    title: "Submission & Review",
    text: "Submit your manuscript for initial review and evaluation.",
    Icon: FileSearch,
    tone: "svc-badge--sky",
    mark: "var(--color-sf-sky)",
  },
  {
    title: "Editing & Design",
    text: "Professional editing, typesetting, and cover design.",
    Icon: PenTool,
    tone: "",
    mark: "var(--color-sf-lilac)",
  },
  {
    title: "Production",
    text: "Formatting for print and digital distribution.",
    Icon: Printer,
    tone: "svc-badge--amber",
    mark: "var(--color-sf-amber)",
  },
  {
    title: "Distribution",
    text: "Global distribution through major retailers.",
    Icon: Globe,
    tone: "svc-badge--emerald",
    mark: "var(--color-sf-emerald)",
  },
];

/** Hero book (decorative): "Foundation of Quantum Computing" lies closed with its
 *  cover up, opens, and turns one page to Chapter 1, then rests. Nothing moves
 *  after that unless the visitor clicks the book: the right half turns a page
 *  forward (from the last spread it riffles back to the start), the left half
 *  turns one back. Each leaf has a front (right-hand page) and a back
 *  (left-hand page once turned). Open on Chapter 1 from the start when the
 *  visitor prefers reduced motion. */
const BOOK_TITLE = "Foundation of Quantum Computing";

// Sample page text, for illustration only.
const BOOK_PAGES = [
  {
    kind: "contents",
    number: "v",
    entries: [
      ["1", "Introduction to Quantum Computing", "1"],
      ["2", "Qubits and Superposition", "14"],
      ["3", "Entanglement", "29"],
      ["4", "Quantum Gates and Circuits", "41"],
      ["5", "Quantum Algorithms", "58"],
      ["6", "Error Correction", "77"],
      ["7", "Quantum Hardware", "93"],
    ],
  },
  {
    kind: "chapter",
    number: "1",
    chapter: "Chapter 1",
    heading: "Introduction to Quantum Computing",
    paras: [
      "Classical computers store information as bits, each either 0 or 1. Quantum computers use qubits, which follow the rules of quantum mechanics and can hold a blend of both states at once.",
      "This chapter traces the ideas that led from early quantum theory to today's experimental machines, and sets out the vocabulary used throughout the book.",
    ],
  },
  {
    kind: "text",
    number: "2",
    running: "Introduction",
    paras: [
      "Three properties set quantum computation apart: superposition, entanglement and interference. Together they let a quantum algorithm explore many possibilities and amplify the useful ones.",
    ],
    figure: "Figure 1.1  A qubit on the Bloch sphere",
    after: "Measuring a qubit gives a definite answer, so algorithms are designed to make the right answer the most likely outcome.",
  },
  {
    kind: "chapter",
    number: "14",
    chapter: "Chapter 2",
    heading: "Qubits and Superposition",
    equation: "|ψ⟩ = α|0⟩ + β|1⟩",
    paras: [
      "A qubit's state is written as a combination of the basis states |0⟩ and |1⟩. The amplitudes α and β are complex numbers whose squared sizes add up to one.",
    ],
  },
  {
    kind: "text",
    number: "15",
    running: "Qubits and Superposition",
    paras: [
      "Superposition does not mean the qubit is secretly 0 or 1. Until it is measured, both possibilities contribute to how the state evolves.",
      "Physical qubits can be built from trapped ions, superconducting circuits, photons or electron spins, each with its own strengths and sources of noise.",
    ],
  },
  {
    kind: "chapter",
    number: "29",
    chapter: "Chapter 3",
    heading: "Entanglement",
    paras: [
      "When two qubits are entangled, measuring one immediately tells us about the other, however far apart they are. Entanglement is a resource that many quantum protocols depend on.",
    ],
  },
  {
    kind: "text",
    number: "30",
    running: "Entanglement",
    paras: [
      "The simplest entangled states are the Bell states. They are prepared with a Hadamard gate followed by a controlled-NOT, a circuit met again in Chapter 4.",
      "Entanglement underpins quantum teleportation, superdense coding and several approaches to secure communication.",
    ],
  },
];

function BookPage({ page }) {
  return (
    <div className="bp-paper">
      {page.kind === "contents" ? (
        <>
          <p className="bp-paper-h">Contents</p>
          <ol className="bp-paper-toc">
            {page.entries.map(([n, title, at]) => (
              <li key={n}>
                <span>{n}</span>
                <span>{title}</span>
                <span>{at}</span>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          {page.running && (
            <p className="bp-paper-run">
              <span>{BOOK_TITLE}</span>
              <span>{page.running}</span>
            </p>
          )}
          {page.chapter && <p className="bp-paper-kicker">{page.chapter}</p>}
          {page.heading && <p className="bp-paper-h">{page.heading}</p>}
          {page.equation && <p className="bp-paper-eq">{page.equation}</p>}
          {page.paras.map((t) => (
            <p key={t.slice(0, 24)} className="bp-paper-p">{t}</p>
          ))}
          {page.figure && (
            <figure className="bp-paper-fig">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="44" />
                <ellipse cx="60" cy="60" rx="44" ry="13" />
                <line x1="60" y1="10" x2="60" y2="110" />
                <line x1="60" y1="60" x2="88" y2="32" />
                <circle cx="88" cy="32" r="3.5" className="bp-paper-dot" />
              </svg>
              <figcaption>{page.figure}</figcaption>
            </figure>
          )}
          {page.after && <p className="bp-paper-p">{page.after}</p>}
        </>
      )}
      <p className="bp-paper-num">{page.number}</p>
    </div>
  );
}

// Leaves from the top of the right-hand stack: the cover, then the paper leaves.
// The last page lies under them all.
const LEAVES = [
  { cover: true },
  { front: BOOK_PAGES[0], back: BOOK_PAGES[1] },
  { front: BOOK_PAGES[2], back: BOOK_PAGES[3] },
  { front: BOOK_PAGES[4], back: BOOK_PAGES[5] },
];
const LAST_PAGE = BOOK_PAGES[6];
const TURN_MS = 1400;
const STAGGER_MS = 160;
// The intro stops here: cover and contents turned, Chapter 1 open.
const REST_SPREAD = 2;

function OpenBook() {
  const [calm] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  // turned: how many leaves lie on the left (0 = closed). from: where the last
  // turn started, so leaves riffling back one after another can be staggered.
  const [view, setView] = useState(() => (calm ? { turned: REST_SPREAD, from: REST_SPREAD } : { turned: 0, from: 0 }));
  const [touched, setTouched] = useState(false);
  const { turned, from } = view;

  // The intro, once: rest closed, open the cover, turn to Chapter 1, stop.
  useEffect(() => {
    if (touched || turned >= REST_SPREAD) return undefined;
    const timer = setTimeout(
      () => setView((v) => ({ turned: v.turned + 1, from: v.turned })),
      turned === 0 ? 900 : 2000
    );
    return () => clearTimeout(timer);
  }, [turned, touched]);

  const turnTo = (next) => {
    setTouched(true);
    setView((v) => (next === v.turned ? v : { turned: next, from: v.turned }));
  };

  const onClick = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    if (e.clientX > box.left + box.width / 2) turnTo(turned >= LEAVES.length ? 1 : turned + 1);
    else turnTo(Math.max(1, turned - 1));
  };

  return (
    <div className="bp-stage" aria-hidden="true">
      <div className="bp-scene">
        <span className="bp-stage-disc" />
        <span className="bp-stage-dots" />
        <div className={`bp-book ${turned > 0 ? "is-open" : ""}`} onClick={onClick}>
          <div className="bp-body">
            <span className="bp-shadow" />
            {/* Back board and the block of pages under the right-hand stack */}
            <span className="bp-board">
              <span className="bp-ribbon" />
            </span>
            <div className="bp-block">
              <BookPage page={LAST_PAGE} />
            </div>

            {LEAVES.map((leaf, i) => {
              const isTurned = i < turned;
              // Leaves that change sides in one go turn one after another.
              let stagger = 0;
              if (from < turned && i >= from && i < turned) stagger = (i - from) * STAGGER_MS;
              if (from > turned && i >= turned && i < from) stagger = (from - 1 - i) * STAGGER_MS;
              // A leaf sits above the right stack, then above the left one; its
              // z-index swaps half-way through the turn, when it stands on its edge.
              return (
                <div
                  key={i}
                  className={`bp-leaf ${leaf.cover ? "bp-leaf--cover" : ""} ${isTurned ? "is-turned" : ""} ${i === turned ? "is-next" : ""}`}
                  style={{
                    zIndex: isTurned ? 100 + i : 50 - i,
                    transitionDelay: `${stagger}ms, ${stagger + TURN_MS / 2}ms`,
                  }}
                >
                  <div className={`bp-face bp-face--front ${leaf.cover ? "bp-cover" : ""}`}>
                    {leaf.cover ? <img {...HERO_COVER} sizes="320px" alt="" decoding="async" /> : <BookPage page={leaf.front} />}
                  </div>
                  <div className={`bp-face bp-face--back ${leaf.cover ? "bp-inside" : ""}`}>
                    {leaf.cover ? (
                      <span className="bp-endpaper">
                        <img {...LOGO} alt="" decoding="async" />
                      </span>
                    ) : (
                      <BookPage page={leaf.back} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The three steps the lead names (formatting, ISBN, distribution), drawn as
 *  linked badges under it. Decorative. */
const HERO_STEPS = [
  { Icon: Type, tone: "" },
  { Icon: Barcode, tone: "svc-badge--amber" },
  { Icon: Globe, tone: "svc-badge--emerald" },
];

/** Hero: lavender with violet waves along the foot (as on the home page); the
 *  title and lead on the left, the book on a violet disc on the right. */
function Hero() {
  return (
    <section
      className="vz-hero-v2 relative isolate overflow-hidden text-vz-ink lg:flex lg:min-h-[calc(100svh-7.6rem)] lg:flex-col"
      aria-labelledby="pub-title"
    >
      <svg aria-hidden="true" className="vz-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bp-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#ddd6fe" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" fill="url(#bp-wave)" opacity="0.55" />
        <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill="#fff" />
      </svg>

      <div
        className={`${WRAP} grid items-center gap-6 pb-20 pt-12 lg:flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10 lg:pb-16 lg:pt-6 xl:gap-14 short:pb-12 short:pt-2`}
      >
        <div className="min-w-0">
          <Rule />
          <h1
            id="pub-title"
            className="mt-5 text-balance text-[2.25rem] leading-[1.1] text-vz-ink sm:text-5xl lg:text-[clamp(2.4rem,min(3.9vw,7.2svh),3.5rem)] short:mt-3"
          >
            Book Publication{" "}
            <span className="relative inline-block">
              <span className="hero-accent">Services</span>
              <Swash className="hero-swash--word" />
            </span>
          </h1>
          <p className="hero-fade mt-7 max-w-xl text-base leading-relaxed text-slate-600 lg:text-[17px] short:mt-5 short:text-[15px]">
            Turn your manuscript into a published book in three easy steps: professional formatting, official ISBN registration, and worldwide print and digital distribution.
          </p>

          <div aria-hidden="true" className="hero-fade mt-8 flex items-center short:mt-5">
            {HERO_STEPS.map(({ Icon, tone }, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="bp-trail-link" />}
                <span className="bp-trail-stop">
                  <span className={`svc-badge svc-badge--sm ${tone}`}>
                    <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                  </span>
                </span>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <OpenBook />
        </div>
      </div>
    </section>
  );
}

/** The services as the contents page of a book, working as tabs: each with
 *  its icon, a dotted leader and an arrow; the chosen one marked with a
 *  gradient bar and, while they change by themselves, a fine line filling
 *  until the next (timer: its duration, or 0 when holding). Arrow keys, Home
 *  and End move between them. On phones the tabs run in a row of chips you
 *  can swipe, which scrolls along to keep the chosen one in view. */
function ServiceTabs({ selected, onSelect, timer, timerKey }) {
  const refs = useRef({});
  const listRef = useRef(null);

  // Measured once the new tab state has been laid out and painted, so the
  // browser is not made to lay the page out early (on load, and each time
  // the tabs advance on their own).
  useEffect(
    () =>
      afterPaint(() => {
        const list = listRef.current;
        const tab = refs.current[selected];
        if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
        list.scrollTo({ left: tab.offsetLeft - 16, behavior: prefersCalm() ? "auto" : "smooth" });
      }),
    [selected]
  );

  const onKeyDown = (e) => {
    const i = contentIds.indexOf(selected);
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    let next = null;
    if (step) next = (i + step + contentIds.length) % contentIds.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = contentIds.length - 1;
    if (next === null) return;
    e.preventDefault();
    onSelect(contentIds[next]);
    refs.current[contentIds[next]]?.focus();
  };
  return (
    <div ref={listRef} role="tablist" aria-labelledby="pub-services-title" onKeyDown={onKeyDown} className="bp-tabs relative mt-7 short:mt-4">
      {contents.map(({ id, title, Icon, chip }) => {
        const on = id === selected;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[id] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab`}
            aria-selected={on}
            aria-controls={id}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(id)}
            className="bp-tab group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-violet"
          >
            <span aria-hidden="true" className={`bp-tab-chip flex h-8 w-8 flex-none items-center justify-center rounded-[10px] ${chip}`}>
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="min-w-0">{title}</span>
            <span aria-hidden="true" className="bp-tab-leader" />
            <ChevronRight aria-hidden="true" className="bp-tab-arrow h-4 w-4 flex-none" />
            {on && timer > 0 && <span key={timerKey} aria-hidden="true" className="bp-tab-timer" style={{ "--every": `${timer}ms` }} />}
          </button>
        );
      })}
    </div>
  );
}

/** One service, opened like a book spread: on the left page its own
 *  hardcover (its title in gilt on the service's colour, with its icon in the
 *  press's diamond); on the right page its description and points. */
function ServicePanel({ service, hidden }) {
  const { id, title, href, linkTitle, Icon, tone = "", text, points, cover, tint } = service;
  const detailed = typeof points[0] !== "string";
  return (
    <article
      role="tabpanel"
      id={id}
      aria-labelledby={`${id}-tab`}
      hidden={hidden}
      tabIndex={0}
      style={{ "--tint": tint, "--c1": cover[0], "--c2": cover[1] }}
      className="bp-sv group relative isolate overflow-hidden rounded-[2rem] bg-white outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-violet lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div aria-hidden="true" className="bp-sv-art">
        <span className="bp-sv-dots" />
        <div className="bp-sv-stand">
          <span className="bp-sv-shadow" />
          <div className="bp-sv-book">
          <div className="bp-sv-cover">
            <span className="bp-sv-frame" />
            <span className="bp-sv-emblem">
              <Icon strokeWidth={1.5} />
            </span>
            <span className="bp-sv-title">{title}</span>
            <span className="bp-sv-logo">
              <img {...LOGO} alt="" />
            </span>
          </div>
          <span className="bp-sv-pages" />
          </div>
        </div>
      </div>

      <div className="bp-sv-body min-w-0 p-6 sm:p-9 xl:p-10 short:p-6">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className={`svc-badge ${tone}`}>
            <Icon className="relative z-10 h-6 w-6" strokeWidth={1.8} />
          </span>
          <h3 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-vz-ink sm:text-[1.75rem] short:text-2xl">
            {linkTitle ? (
              <a
                href={href}
                className="transition-colors hover:text-sf-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-violet"
              >
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
        </div>
        <p className="mt-5 text-base leading-relaxed text-slate-600 lg:text-[17px] short:mt-3 short:text-[15px]">{text}</p>

        {detailed ? (
          <ul className="mt-7 grid gap-2.5 short:mt-4 short:gap-2">
            {points.map(({ label, text: pointText, Icon: PointIcon }) => (
              <li key={label} className="bp-sv-point flex items-center gap-3.5 rounded-2xl px-4 py-3 short:py-2">
                <span aria-hidden="true" className="bp-sv-point-icon">
                  <PointIcon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 text-[15px] leading-snug text-slate-600 short:text-[14px]">
                  <strong className="font-bold text-vz-ink">{label}</strong> {pointText}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-7 grid gap-3 short:mt-4 short:gap-2">
            {points.map((point) => (
              <li key={point} className="bp-sv-point flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-vz-ink short:py-2.5">
                <span aria-hidden="true" className="bp-check">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/** Our publication services, as tabs: the services listed like a book's
 *  contents on the left, the chosen one opened on the right. They change by
 *  themselves, one by one, while the section is on screen, holding while the
 *  pointer is on the open service or the keyboard is on the tabs (not for
 *  visitors who ask for less motion). All six panels stay in the page (all
 *  but the chosen one hidden), and an address naming a service
 *  (#thesis-books) opens it and scrolls here. One screen tall. */
function Services() {
  // by: who chose last ("auto" or "user"), so the wait is longer after a visitor picks.
  const [choice, setChoice] = useState({ id: contentIds[0], by: "auto" });
  const selected = choice.id;
  const [calm] = useState(prefersCalm);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const sectionRef = useRef(null);
  const running = !calm && inView && !hovered && !focused;
  const delay = choice.by === "user" ? SERVICE_WAIT_AFTER_USER : SERVICE_EVERY;
  const choose = (id) => setChoice({ id, by: "user" });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.45 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      setChoice(({ id }) => ({ id: contentIds[(contentIds.indexOf(id) + 1) % contentIds.length], by: "auto" }));
    }, delay);
    return () => clearTimeout(t);
  }, [running, choice, delay]);

  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!contentIds.includes(id)) return;
      setChoice({ id, by: "user" });
      requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: "start" }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return (
    <section ref={sectionRef} className={`bp-services relative isolate scroll-mt-20 overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div
        className={`${WRAP} grid gap-8 lg:grid-cols-[minmax(0,18.5rem)_minmax(0,1fr)] lg:items-center lg:gap-12 xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] xl:gap-16`}
        onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      >
        <div className="min-w-0">
          <Rule />
          <h2 id="pub-services-title" className={`reveal mt-5 ${H2} short:mt-3`}>
            Our Publication <Accent>Services</Accent>
          </h2>
          <ServiceTabs selected={selected} onSelect={choose} timer={running ? delay : 0} timerKey={`${selected}-${choice.by}`} />
        </div>
        <div
          className="min-w-0"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          {contents.map((service) => (
            <ServicePanel key={service.id} service={service} hidden={service.id !== selected} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** A finished book standing on a lit shelf, slightly turned so its pages show;
 *  it turns round on hover to show the back cover. Decorative. */
function FinishedBook() {
  return (
    <div aria-hidden="true" className="bp-tome mt-12 hidden xl:block short:mt-8">
      <div className="bp-tome-body">
        <img {...tomeFront} sizes="196px" alt="" loading="lazy" className="bp-tome-face bp-tome-front" />
        <img {...tomeBack} sizes="196px" alt="" loading="lazy" className="bp-tome-face bp-tome-back" />
        <span className="bp-tome-face bp-tome-pages" />
        <span className="bp-tome-face bp-tome-spine" />
        <span className="bp-tome-face bp-tome-top" />
      </div>
      <span className="bp-tome-shelf" />
    </div>
  );
}

/** Our publication process: the navy band; the four steps down a rail that
 *  draws itself as it scrolls in. On wide screens the heading and a finished
 *  book sit to their left; below that the heading sits above them. */
function Process() {
  return (
    <section className={`vz-shelf-band relative isolate overflow-hidden text-white ${SCREEN_PAD} ${SCREEN}`}>
      <span className="vz-grid" aria-hidden="true" />
      <div className={`${WRAP} grid gap-10 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:items-center xl:gap-20`}>
        <div className="min-w-0">
          <Rule tone="dark" />
          <h2 className={`reveal mt-5 ${H2_LIGHT} short:mt-3`}>
            Our Publication <Accent tone="light">Process</Accent>
          </h2>
          <FinishedBook />
        </div>

        <div className="min-w-0">
          <ol className="grid gap-4 short:gap-3">
            {steps.map(({ title, text, Icon, tone, mark }, index) => (
              <li
                key={title}
                className="reveal relative flex items-start gap-4 sm:items-center sm:gap-6"
                style={{ "--mark": mark, "--mark-next": steps[index + 1]?.mark }}
              >
                {/* The rail, one stretch from this step's mark to the next. */}
                {index < steps.length - 1 && (
                  <span className="bp-link" aria-hidden="true">
                    <span className="bp-link-fill" />
                  </span>
                )}
                <span className="bp-step-no mt-5 sm:mt-0">
                  <span>{index + 1}</span>
                </span>
                <div className="bp-glass bp-step-card flex min-w-0 flex-1 flex-col items-start gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6 short:py-4">
                  <span aria-hidden="true" className={`svc-badge svc-badge--sm ${tone}`}>
                    <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold leading-snug text-white short:text-base">{title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-white/75 short:text-sm">{text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** The close: an indigo-to-violet card asking authors to publish with us, with
 *  a pile of cloth-bound books and a real one standing on top. */
function CallToAction() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-16 lg:py-20 short:py-12">
      <div className={WRAP}>
        <div className="bp-cta relative isolate overflow-hidden rounded-[2.5rem] text-white lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center">
          <span className="bp-cta-dots" aria-hidden="true" />
          <div className="relative z-10 px-6 pb-2 pt-12 sm:px-12 lg:py-16 lg:pl-16 xl:pl-20">
            <Eyebrow tone="light" icon={Sparkles}>
              Publish with Veritaz
            </Eyebrow>
            <h2 className={`mt-5 ${H2_LIGHT}`}>
              Ready to Publish Your <Accent tone="light">Book?</Accent>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 lg:text-[17px]">
              Join thousands of authors who have successfully published their works with our expert guidance and support.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Pill to="/contact" variant="light" arrow className="max-sm:gap-2 max-sm:px-5 max-sm:text-sm">
                Start Your Publication Journey
              </Pill>
              <Pill to="/contact" variant="outline-light">
                Request a Consultation
              </Pill>
            </div>
          </div>

          <div className="bp-pile relative" aria-hidden="true">
            <div className="bp-pile-set">
              <span className="bp-pile-shelf" />
              <span className="bp-spine bp-spine--0" />
              <span className="bp-spine bp-spine--1" />
              <span className="bp-spine bp-spine--2" />
              <img {...pileBlue} alt="" loading="lazy" className="bp-pile-cover bp-pile-cover--lean" />
              <img {...pileResearch} alt="" loading="lazy" className="bp-pile-cover bp-pile-cover--top" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BookPublishing() {
  useSeo(PAGES["/book-publishing"]);

  return (
    <main className="overflow-x-clip bg-white text-slate-800">
      <Hero />
      <Services />
      <Process />
      <CallToAction />
    </main>
  );
}
