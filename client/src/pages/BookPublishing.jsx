import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  Feather,
  FileSearch,
  FileText,
  Globe,
  GraduationCap,
  PenTool,
  Printer,
  SquarePen,
  Users,
} from "lucide-react";
import CtaBanner, { CtaButton } from "../components/CtaBanner";

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-10";

const featuredService = {
  id: "edited-books",
  title: "Edited Books",
  text: "If you are collecting chapters or writing from different authors, we help you turn them into one complete, professionally published book.",
  points: [
    { label: "Author Communication:", text: "We handle tracking and gathering all author submissions." },
    { label: "Style Matching:", text: "We make sure all chapters follow the same formatting, fonts, and layout." },
    { label: "Book Organization:", text: "We arrange all chapters, pages, and indexing in proper order." },
    { label: "Official Rules:", text: "We ensure the final book meets all university and academic publishing standards." },
  ],
};

const services = [
  {
    id: "fiction-novels",
    title: "Fiction Novels",
    Icon: BookOpen,
    tile: "bg-brand-violet text-white",
    text: "Whether you write epic adventures, suspense, speculative fiction, or contemporary drama, we support authors across all story styles from raw manuscript to global release.",
    points: ["Professional editing", "Cover design", "Marketing support"],
  },
  {
    id: "thesis-books",
    title: "Thesis Books",
    Icon: GraduationCap,
    tile: "bg-brand-deep text-white",
    text: "Convert your academic thesis or dissertation into a published book that scholars and everyday readers can easily find and read.",
    points: ["Academic Formatting", "Editorial Review", "Library Distribution"],
  },
  {
    id: "poetry-books",
    title: "Poetry Books",
    Icon: Feather,
    tile: "bg-brand-gold text-brand-ink",
    text: "Celebrate your verse with beautifully published collections that honor the natural rhythm and emotion of your words.",
    points: ["Lyrical formatting", "Artistic layout", "Poetry community outreach"],
  },
  {
    id: "short-stories",
    title: "Short Stories",
    Icon: FileText,
    tile: "bg-brand-cyan text-brand-ink",
    text: "Whether publishing a single piece or a full story collection, we help writers create impactful books that captivate readers.",
    points: ["Collection compilation", "Anthology opportunities", "Literary magazine submissions"],
  },
  {
    id: "conference-proceedings",
    title: "Conference Proceedings",
    href: "/conference-proceedings",
    linkTitle: true,
    Icon: Users,
    tile: "bg-brand-orchid text-brand-ink",
    text: "Record and share the knowledge from your academic and professional conferences with professionally published books.",
    points: ["Rapid publication", "ISBN assignment", "Academic indexing"],
  },
];

const contents = [featuredService, ...services];
const contentIds = contents.map((service) => service.id);

const steps = [
  {
    title: "Submission & Review",
    text: "Submit your manuscript for initial review and evaluation.",
    Icon: FileSearch,
    ring: "border-brand-cyan",
    stem: "bg-brand-cyan",
    glow: "shadow-brand-cyan/35",
    tile: "bg-brand-cyan text-brand-ink",
  },
  {
    title: "Editing & Design",
    text: "Professional editing, typesetting, and cover design.",
    Icon: PenTool,
    ring: "border-brand-bright",
    stem: "bg-brand-bright",
    glow: "shadow-brand-bright/35",
    tile: "bg-brand-bright text-white",
  },
  {
    title: "Production",
    text: "Formatting for print and digital distribution.",
    Icon: Printer,
    ring: "border-brand-violet",
    stem: "bg-brand-violet",
    glow: "shadow-brand-violet/35",
    tile: "bg-brand-violet text-white",
  },
  {
    title: "Distribution",
    text: "Global distribution through major retailers.",
    Icon: Globe,
    ring: "border-brand-orchid",
    stem: "bg-brand-orchid",
    glow: "shadow-brand-orchid/35",
    tile: "bg-brand-orchid text-brand-ink",
  },
];

/** Tracks which service row is crossing a line 22% down the viewport. That line
 *  sits just below where the anchor links land, so a clicked row is the current one. */
function useCurrentSection(ids) {
  const [current, setCurrent] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: "-22% 0px -78% 0px" }
    );
    ids.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [ids]);

  return current;
}

/** Hero book (decorative): "Foundation of Quantum Computing" lies closed with its
 *  cover facing up, opens, and its pages turn one by one; at the last page it
 *  closes and opens again. Each leaf has a front (right-hand page) and a back
 *  (left-hand page once turned). Still and open on the first spread when the
 *  visitor prefers reduced motion. */
const HERO_COVER = "/assets/image/publishing-hero/quantum-computing-front.webp";
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
    <div className="pub-paper">
      {page.kind === "contents" ? (
        <>
          <p className="pub-paper-h">Contents</p>
          <ol className="pub-paper-toc">
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
            <p className="pub-paper-run">
              <span>{BOOK_TITLE}</span>
              <span>{page.running}</span>
            </p>
          )}
          {page.chapter && <p className="pub-paper-kicker">{page.chapter}</p>}
          {page.heading && <p className="pub-paper-h">{page.heading}</p>}
          {page.equation && <p className="pub-paper-eq">{page.equation}</p>}
          {page.paras.map((t) => (
            <p key={t.slice(0, 24)} className="pub-paper-p">{t}</p>
          ))}
          {page.figure && (
            <figure className="pub-paper-fig">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="44" />
                <ellipse cx="60" cy="60" rx="44" ry="13" />
                <line x1="60" y1="10" x2="60" y2="110" />
                <line x1="60" y1="60" x2="88" y2="32" />
                <circle cx="88" cy="32" r="3.5" className="pub-paper-dot" />
              </svg>
              <figcaption>{page.figure}</figcaption>
            </figure>
          )}
          {page.after && <p className="pub-paper-p">{page.after}</p>}
        </>
      )}
      <p className="pub-paper-num">{page.number}</p>
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

function OpenBook() {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // How many leaves lie turned on the left. 0 = closed.
  const [turned, setTurned] = useState(reduced ? 1 : 0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (reduced) return undefined;
    let delay;
    let next;
    if (closing) {
      delay = TURN_MS + LEAVES.length * STAGGER_MS + 1200; // closed: rest, then open again
      next = () => {
        setClosing(false);
        setTurned(1);
      };
    } else if (turned === 0) {
      delay = 900; // first view: closed, then open
      next = () => setTurned(1);
    } else if (turned < LEAVES.length) {
      delay = turned === 1 ? 2600 : 3000;
      next = () => setTurned((t) => t + 1);
    } else {
      delay = 3200; // last spread: rest, then close
      next = () => {
        setClosing(true);
        setTurned(0);
      };
    }
    const timer = setTimeout(next, delay);
    return () => clearTimeout(timer);
  }, [turned, closing, reduced]);

  const open = turned > 0;

  return (
    <div className="pub-book-stage" aria-hidden="true">
      <div className="pub-book">
        <div className={`pub-book-shift ${open ? "is-open" : ""}`}>
          {/* Back board and the block of pages under the right-hand stack */}
          <span className="pub-book-board" />
          <div className="pub-book-block">
            <BookPage page={LAST_PAGE} />
          </div>

          {LEAVES.map((leaf, i) => {
            const isTurned = i < turned;
            // Turning right-to-left the leaf sits above the right stack, then above the left one; the
            // z-index swaps at the half-way point, when the leaf stands on its edge.
            const stagger = closing ? (LEAVES.length - 1 - i) * STAGGER_MS : 0;
            return (
              <div
                key={i}
                className={`pub-leaf ${leaf.cover ? "pub-leaf--cover" : ""} ${isTurned ? "is-turned" : ""}`}
                style={{
                  zIndex: isTurned ? 100 + i : 50 - i,
                  transitionDelay: `${stagger}ms, ${stagger + TURN_MS / 2}ms`,
                }}
              >
                <div className="pub-leaf-face pub-leaf-face--front">
                  {leaf.cover ? <img src={HERO_COVER} alt="" decoding="async" /> : <BookPage page={leaf.front} />}
                </div>
                <div className="pub-leaf-face pub-leaf-face--back">
                  {leaf.cover ? <span className="pub-endpaper" /> : <BookPage page={leaf.back} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="pub-hero relative overflow-hidden bg-white" aria-labelledby="pub-title">
      <div className={`${WRAP} relative z-10 pt-10 text-center lg:pt-12`}>
        <h1 id="pub-title" className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-brand-ink sm:text-5xl xl:text-6xl">
          Book Publication Services
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          Turn your manuscript into a published book in three easy steps: professional formatting, official ISBN registration, and worldwide print and digital distribution.
        </p>
      </div>

      <OpenBook />
      <div className="logo-rule relative z-10" />
    </section>
  );
}

function ContentsNav({ current }) {
  return (
    <nav aria-labelledby="pub-services-title" className="mt-8 hidden border-l border-brand-deep/15 lg:block">
      <ul>
        {contents.map(({ id, title }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={current === id ? "true" : undefined}
              className="-ml-px block border-l-2 border-transparent py-2 pl-4 font-semibold text-slate-600 transition-colors hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-brand-deep aria-[current=true]:border-brand-violet aria-[current=true]:text-brand-ink"
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FeaturedService() {
  const { id, title, text, points } = featuredService;
  return (
    <article id={id} className="reveal relative scroll-mt-28 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-deep to-brand-violet p-7 text-white sm:p-10">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-white text-brand-deep">
          <SquarePen size={26} aria-hidden="true" />
        </span>
        <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h3>
      </div>
      <p className="mt-6 max-w-3xl text-lg text-white/90 leading-relaxed">{text}</p>
      <ul className="mt-8 grid gap-x-10 gap-y-6 border-t border-white/20 pt-8 sm:grid-cols-2">
        {points.map((point) => (
          <li key={point.label} className="text-white/90 leading-relaxed">
            <strong className="block font-bold text-brand-goldlight">{point.label}</strong> {point.text}
          </li>
        ))}
      </ul>
    </article>
  );
}

function ServiceRow({ service }) {
  const { id, title, href, linkTitle, Icon, tile, text, points } = service;
  return (
    // The reveal is on an inner element: an anchor target must not be mid-transform
    // when the browser scrolls to it, or it lands short.
    <article id={id} className="scroll-mt-28 border-b border-brand-deep/10 py-10 last:border-b-0">
      <div className="reveal grid gap-x-8 gap-y-5 sm:grid-cols-[auto_1fr] xl:grid-cols-[auto_1fr_280px]">
        <span className={`flex h-14 w-14 items-center justify-center rounded-xl ${tile}`}>
          <Icon size={26} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-brand-ink sm:text-[1.75rem]">
            {linkTitle ? (
              <a href={href} className="transition-colors hover:text-brand-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep">{title}</a>
            ) : title}
          </h3>
          <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">{text}</p>
        </div>
        <ul className="space-y-2 sm:col-start-2 xl:col-start-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2.5 font-medium text-slate-700">
              <Check size={18} aria-hidden="true" className="mt-0.5 flex-none text-brand-bright" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Services() {
  const current = useCurrentSection(contentIds);
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className={`${WRAP} grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-16 xl:grid-cols-[340px_1fr] xl:gap-24`}>
        <div className="self-start lg:sticky lg:top-28">
          <h2 id="pub-services-title" className="text-4xl font-bold leading-tight tracking-tight text-brand-ink lg:text-5xl">
            Our Publication Services
          </h2>
          <ContentsNav current={current} />
        </div>
        <div>
          <FeaturedService />
          <div className="mt-4">
            {services.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="pub-process py-16 lg:py-24">
      <div className={WRAP}>
        <h2 className="text-4xl font-bold tracking-tight text-brand-ink lg:text-5xl">
          Our Publication <em className="text-brand-violet">Process</em>
        </h2>
        <div className="relative mt-12 lg:mt-16">
          <span aria-hidden="true" className="absolute bottom-0 left-[39px] top-0 w-[3px] bg-brand-deep/10 lg:bottom-auto lg:left-0 lg:right-0 lg:top-[39px] lg:h-[3px] lg:w-auto" />
          <span
            aria-hidden="true"
            className="pub-rail-fill absolute bottom-0 left-[39px] top-0 w-[3px] bg-gradient-to-b from-brand-cyan via-brand-violet to-brand-orchid lg:bottom-auto lg:left-0 lg:right-0 lg:top-[39px] lg:h-[3px] lg:w-auto lg:bg-gradient-to-r"
          />
          <ol className="relative grid gap-8 lg:grid-cols-4">
            {steps.map(({ title, text, Icon, ring, stem, glow, tile }, index) => (
              <li key={title} className="pub-step flex gap-6 lg:flex-col lg:gap-0" style={{ "--i": index }}>
                <span className={`ml-[9px] mt-[9px] flex h-[62px] w-[62px] flex-none rotate-45 items-center justify-center rounded-lg border-[3px] bg-white shadow-[0_0_24px] ${ring} ${glow}`}>
                  <span className="-rotate-45 text-2xl font-bold text-brand-ink">{index + 1}</span>
                </span>
                <span aria-hidden="true" className={`ml-[39px] hidden h-12 w-[3px] lg:block ${stem}`} />
                <div className={`pub-step-card flex-1 rounded-2xl border-t-[3px] p-6 ${ring}`}>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tile}`}>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-brand-ink">{title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className={WRAP}>
        <CtaBanner
          eyebrow="Publish with Veritaz"
          title="Ready to Publish Your Book?"
          text="Join thousands of authors who have successfully published their works with our expert guidance and support."
          actions={
            <>
              <CtaButton>Start Your Publication Journey</CtaButton>
              <CtaButton variant="secondary">Request a Consultation</CtaButton>
            </>
          }
        />
      </div>
    </section>
  );
}

export default function BookPublishing() {
  useEffect(() => {
    document.title = "Book Publishing Services in India | Veritaz International";

    // 1. Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Publish your book with Veritaz International. We offer professional book publishing,ISBN ,editing,cover design,printing and global distribution services.";

    // 2. Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = "book publishing services Veritaz, textbook publication India, academic book publishing, professional editing and ISBN, research paper and book publication, author publishing services";
    
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
    canonicalLink.href = "https://www.veritazinternational.com/book-publishing";
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Services />
      <Process />
      <CallToAction />
    </main>
  );
}
