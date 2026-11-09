import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
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

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-10";
const SERIF = { fontFamily: "'Fraunces', Georgia, serif" };

const COVER_DIR = "/assets/image/publishing-covers";
const coverColumns = [
  ["research", "computer-vision", "whispers-of-night"],
  ["blue-economy", "digital-marketing", "development-economics"],
  ["biochemistry", "intellectual-property", "green-marketing"],
];

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

function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-ink text-white">
      <span className="orb orb-cyan" aria-hidden="true" />
      <span className="orb orb-orchid" aria-hidden="true" />
      <div className={`${WRAP} relative z-10 pt-14 lg:flex lg:min-h-[560px] lg:items-center lg:py-16`}>
        <div className="lg:max-w-[52%]">
          <h1 style={SERIF} className="text-[2.6rem] sm:text-6xl xl:text-7xl leading-[1.08] font-medium tracking-tight">
            Book Publication <em className="text-brand-gold">Services</em>
          </h1>
          <p className="hero-fade mt-6 max-w-2xl text-lg text-white/90 leading-relaxed">
            Turn your manuscript into a published book in three easy steps: professional formatting, official ISBN registration, and worldwide print and digital distribution.
          </p>
          <Link
            to="/contact"
            className="hero-fade mt-9 inline-flex items-center gap-2 rounded-full bg-brand-gold px-7 py-3.5 font-bold text-brand-ink transition-colors hover:bg-brand-goldlight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Get Started Now
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="pub-wall" aria-hidden="true">
        {coverColumns.map((column, index) => (
          <div key={column[0]} className="pub-wall-column" style={{ "--c": index }}>
            {column.map((cover) => (
              <img key={cover} src={`${COVER_DIR}/${cover}.webp`} alt="" decoding="async" />
            ))}
          </div>
        ))}
      </div>
      <div className="logo-rule relative" />
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
        <h3 style={SERIF} className="text-3xl font-medium tracking-tight sm:text-4xl">{title}</h3>
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
          <h3 style={SERIF} className="text-2xl font-medium tracking-tight text-brand-ink sm:text-[1.75rem]">
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
          <h2 id="pub-services-title" style={SERIF} className="text-4xl font-medium leading-tight tracking-tight text-brand-ink lg:text-5xl">
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
        <h2 style={SERIF} className="text-4xl font-medium tracking-tight text-brand-ink lg:text-5xl">
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
                  <span style={SERIF} className="-rotate-45 text-2xl font-medium text-brand-ink">{index + 1}</span>
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
        <div className="relative grid items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-ink via-brand-deep to-brand-violet p-8 text-white sm:p-12 lg:grid-cols-[1fr_auto] lg:gap-16 lg:p-16">
          <span className="pub-cta-glow" aria-hidden="true" />
          <div className="relative">
            <h2 style={SERIF} className="text-4xl font-medium tracking-tight lg:text-5xl">Ready to Publish Your Book?</h2>
            <p className="mt-4 max-w-2xl text-lg text-white/90 leading-relaxed">
              Join thousands of authors who have successfully published their works with our expert guidance and support.
            </p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button type="button" className="rounded-full bg-brand-gold px-7 py-3.5 font-bold text-brand-ink transition-colors hover:bg-brand-goldlight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Start Your Publication Journey
            </button>
            <button type="button" className="rounded-full border-2 border-white/70 px-7 py-3.5 font-bold text-white transition-colors hover:bg-white hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Request a Consultation
            </button>
          </div>
        </div>
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
    <main className="min-h-screen bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <Hero />
      <Services />
      <Process />
      <CallToAction />
    </main>
  );
}
