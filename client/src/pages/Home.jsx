import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Play,
  Quote,
  Star,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";
const SERIF = { fontFamily: "var(--font-serif)" };

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
  },
  {
    title: "Patent Grant Support",
    text: "Protect your innovations with expert patent grant support. We offer complete patent registration, documentation, IP protection, and end-to-end patent consulting services for national and international patent filings across 12 countries.",
  },
  {
    title: "Educational Events",
    text: "Complete event coordination and academic organizing for international conferences, faculty development programs (FDPs), interactive workshops, and scholarly seminars designed to foster institutional growth and knowledge sharing.",
  },
  {
    title: "IEEE Conference Publications",
    text: "Dedicated editorial, formatting, and submission assistance for scholars aiming to publish high-impact papers in prestigious IEEE conferences globally.",
  },
  {
    title: "Professional Upskilling Programs",
    text: "Industry aligned upskilling programs and specialized training modules built to advance professional competencies, research capabilities, and career growth for educators, students, and professionals.",
  },
];

const reasons = [
  { title: "ISBN Assignment", text: "Every book is published with an official ISBN for international tracking and cataloging." },
  { title: "Affordable Pricing", text: "Industry-leading publication packages with transparent, budget-friendly costs." },
  { title: "Government Recognized", text: "Fully registered company recognized under MSME for official compliance." },
  { title: "Author Copies", text: "Complimentary printed books provided to every author upon publication." },
  { title: "Global Distribution Network", text: "Strategic partnerships with major distribution platforms including Flipkart and leading online booksellers." },
  { title: "Academic Bestsellers", text: "Top-selling engineering, technical, and academic titles across major colleges and institutions." },
  { title: "Academic Credit & API Score", text: "Fully compliant with UGC and institutional accreditation guidelines to boost API and self-appraisal points." },
  { title: "Physical Certificate", text: "Hardcopy publication certificates delivered directly to every author." },
  { title: "Complimentary Online Marketing", text: "Free digital promotion and multi-channel distribution across national online marketplaces and publisher portals." },
  { title: "Multilingual Publishing", text: "Complete editorial, layout, and printing capabilities in all regional languages." },
  { title: "Premium Production Quality", text: "Printed on high-grade 80 GSM paper with crisp color/monochrome printing and durable glossy lamination." },
  { title: "Dedicated Support", text: "Personalized publishing assistance backed by responsive 24/7 client care." },
  { title: "Market Presence", text: "Proven track record with multiple national bestsellers across genres." },
];

const bookPath = (book) => `/books/${book.title.replace(/\s+/g, "-").toLowerCase()}-${book.id}`;

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
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || !match || calm) return undefined;

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
      <span className="w-14 h-14 rounded-full bg-brand-violet text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
        {(name || "?").trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name || "Client"}
      className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white"
      onError={() => setFailed(true)}
    />
  );
}

const HERO_WORDS = ["Where", "Great", "Writing", "Becomes", "a"];

function Hero({ covers, booksReady }) {
  const [gaveUp, setGaveUp] = useState(false);

  // The cover columns wait for the book list, but a slow network should not
  // leave the panel empty, so fall back to the bundled covers after a while.
  useEffect(() => {
    const timer = setTimeout(() => setGaveUp(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Eight covers, set around a 3D ring.
  const ring = useMemo(() => {
    if (!booksReady && !gaveUp) return [];
    const pool = covers.length ? covers : FALLBACK_COVERS;
    return Array.from({ length: 8 }, (_, i) => pool[i % pool.length]);
  }, [covers, booksReady, gaveUp]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-brand-snow to-brand-paper">
      <div className={`${WRAP} relative grid items-center gap-8 pb-10 pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:pb-8 lg:pt-6`}>
        <div className="text-center lg:text-left">
          <h1 className="text-[2.4rem] sm:text-5xl xl:text-[3.75rem] leading-[1.1] font-extrabold tracking-tight text-brand-ink">
            {HERO_WORDS.map((word, i) => (
              <span key={word}>
                <span className="hero-word" style={{ "--w": i }}>{word}</span>{" "}
              </span>
            ))}
            <em className="hero-word not-italic text-brand-violet" style={{ "--w": 5 }}>Printed</em>{" "}
            <em className="hero-word not-italic text-brand-violet" style={{ "--w": 6 }}>Reality</em>
          </h1>
          <p className="hero-fade mx-auto mt-6 max-w-xl text-lg text-slate-600 leading-relaxed lg:mx-0">
            Seamless book creation through self-publishing, editing, cover design, ISBN &amp; patent
            registration, printing, and eBook distribution.
          </p>
          <div className="hero-fade mt-9 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
            <a
              href="#publish-form"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-brand-deep text-white font-bold hover:bg-brand-ink transition-colors"
            >
              Start Publishing Today
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              to="/book-store"
              className="inline-flex items-center justify-center h-14 px-8 rounded-full border-2 border-brand-deep/20 font-semibold text-brand-deep hover:border-brand-deep transition-colors"
            >
              Browse the Book Store
            </Link>
          </div>
        </div>

        {/* 3D ring of covers. It turns slowly on its own and turns further as
            the page scrolls (see .ring-* in index.css). Decorative: the same
            titles are linked in the shelf below. */}
        <div aria-hidden="true" className="ring-stage">
          <span className="ring-floor" />
          <div className="ring-tilt">
            <div className="ring-spin">
              <div className="ring-scroll">
                {ring.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="ring-card"
                    style={{ "--i": i }}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_COVERS[0];
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pins on wide screens and pans sideways through the services as you scroll
 *  (see .process-* in index.css). Everywhere else it is a plain card grid. */
function Process() {
  return (
    <section className="process-pin bg-brand-paper">
      <div className="process-sticky">
        <div className="process-layout">
          {/* The intro stays put while only the cards pan sideways beside it. */}
          <div className="process-intro">
            <h2 style={SERIF} className="text-5xl lg:text-7xl font-medium text-brand-deep tracking-tight leading-[1.05]">
              Inside Our Process
            </h2>
            <p className="mt-5 max-w-md text-lg text-slate-600 leading-relaxed">
              A seamless, guided workflow ensuring precision, quality, and complete author support at
              every stage of the publishing journey.
            </p>
          </div>

          <div className="process-viewport">
            <div className="process-track">
          {services.map((s, i) => (
            <article key={s.title} className="process-card reveal">
              <span style={SERIF} className="block text-6xl lg:text-8xl font-medium text-brand-violet/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 style={SERIF} className="mt-4 text-2xl lg:text-3xl font-medium text-brand-deep">
                {s.title}
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{s.text}</p>
            </article>
          ))}
            </div>
          </div>
        </div>
        <span aria-hidden="true" className="process-bar" />
      </div>
    </section>
  );
}

function FromDraft() {
  return (
    <section className="bg-brand-snow text-brand-ink py-20 lg:py-32">
      <div className={`${WRAP} text-center`}>
        <h2 style={SERIF} className="reveal mx-auto max-w-4xl text-4xl lg:text-7xl font-medium tracking-tight leading-[1.05]">
          From Draft to Global Bookshelves
        </h2>
        <p className="reveal mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
          Veritaz International Press bridges the gap between innovative ideas and global
          recognition through complete publishing, patent protection, and academic support.
        </p>

        <dl className="mx-auto mt-14 max-w-4xl grid sm:grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="reveal">
              <dd style={SERIF} className="text-6xl lg:text-7xl font-medium text-brand-violet tabular-nums">
                <CountUp value={s.value} />
              </dd>
              <dt className="mt-2 font-medium text-slate-600">{s.label}</dt>
            </div>
          ))}
        </dl>

        <div className="reveal mt-14 flex flex-col sm:flex-row justify-center gap-3">
          <a
            href="#publish-form"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-brand-deep text-white font-bold hover:bg-brand-ink transition-colors"
          >
            Start Publishing Today
            <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full border-2 border-brand-deep/20 font-semibold text-brand-deep hover:border-brand-deep transition-colors"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}

function ShelfBook({ book, hidden = false }) {
  return (
    <Link
      to={bookPath(book)}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="shelf-book group"
    >
      <img
        src={book.cover1}
        alt={hidden ? "" : book.title}
        loading="lazy"
        className="w-full aspect-[3/4] object-cover rounded shadow-lg"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_COVERS[0];
        }}
      />
      <h3 className="mt-3 text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-brand-violet transition-colors">
        {book.title}
      </h3>
      <p className="mt-1 text-xs text-slate-500 line-clamp-1">{book.authors}</p>
    </Link>
  );
}

/** Endless belt of books. The list is doubled so -50% lands on an identical
 *  frame; the copy is hidden from keyboards and screen readers. */
function Shelf({ books }) {
  if (!books.length) return null;
  return (
    <section className="bg-white py-16 lg:py-24 overflow-hidden">
      <div className={`${WRAP} flex flex-wrap items-end justify-between gap-4 mb-10`}>
        <h2 style={SERIF} className="reveal text-4xl lg:text-5xl font-medium text-brand-deep tracking-tight">
          From our shelves
        </h2>
        <Link to="/book-store" className="inline-flex items-center gap-2 font-bold text-brand-violet hover:gap-3 transition-all">
          View all books
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      <div className="shelf-window">
        <div className="shelf-belt">
          {books.map((book) => (
            <ShelfBook key={book.id} book={book} />
          ))}
          {books.map((book) => (
            <ShelfBook key={`copy-${book.id}`} book={book} hidden />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Why Authors Choose Us: the heading stays put on the left while the
 *  numbered reasons run down two columns beside it. */
function Reasons() {
  return (
    <section className="bg-brand-paper py-16 lg:py-28">
      <div className={`${WRAP} grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16`}>
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 style={SERIF} className="reveal text-4xl lg:text-6xl font-medium tracking-tight leading-[1.05] text-brand-deep">
            Why Authors Choose Us
          </h2>
          <span aria-hidden="true" className="mt-6 block h-1 w-20 rounded-full bg-brand-gold" />
        </div>

        <ol className="grid gap-x-10 sm:grid-cols-2">
          {reasons.map((r, i) => (
            <li key={r.title} className="reveal flex gap-4 border-t border-brand-violet/20 py-6">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-sm font-bold tabular-nums text-brand-violet">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-bold text-brand-ink">{r.title}</h3>
                <p className="mt-1 leading-relaxed text-slate-600">{r.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonials({ testimonials }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const count = testimonials.length;

  useEffect(() => {
    if (count < 2 || paused || videoUrl) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(timer);
  }, [count, paused, videoUrl]);

  useEffect(() => {
    if (!videoUrl) return undefined;
    const onKey = (e) => e.key === "Escape" && setVideoUrl(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoUrl]);

  if (!count) return null;

  const current = testimonials[index % count];
  const hasVideo = (current.is_video_testimonial === true || current.is_video_testimonial === 1) && current.video_url;

  return (
    <section
      className="bg-brand-mist py-16 lg:py-24 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={WRAP}>
        <div className="text-center">
          <p className="text-brand-violet text-sm font-bold uppercase tracking-[0.2em]">Testimonials</p>
          <h2 style={SERIF} className="reveal mt-4 text-4xl lg:text-5xl font-medium text-brand-deep tracking-tight">
            In our authors' words
          </h2>
        </div>

        <div className="page-stack mx-auto mt-10 max-w-4xl">
          {/* Re-keyed so each new quote replays the page turn. */}
          <figure key={current.id ?? index} className="page-turn flex flex-col min-h-[340px] bg-white rounded-2xl p-6 sm:p-10">
            <Quote className="w-10 h-10 text-brand-violet/30" />
            <blockquote
              style={SERIF}
              className={`mt-4 leading-snug text-brand-deep ${
                (current.content || "").length > 280 ? "text-lg lg:text-xl" : "text-xl sm:text-2xl lg:text-3xl"
              }`}
            >
              {current.content}
            </blockquote>
            <figcaption className="mt-auto pt-8 flex flex-wrap items-center gap-4">
              <Avatar src={current.avatar_url} name={current.name} />
              <div className="min-w-0">
                <p className="font-bold text-brand-deep">{current.name}</p>
                <p className="text-sm text-slate-600">{current.designation}</p>
                <div className="mt-1 flex gap-0.5" aria-label={`${current.rating || 5} out of 5 stars`}>
                  {Array.from({ length: current.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
              </div>
              {hasVideo && (
                <button
                  onClick={() => setVideoUrl(current.video_url)}
                  className="sm:ml-auto inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-violet text-white text-sm font-bold hover:bg-brand-deep transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Video
                </button>
              )}
            </figcaption>
          </figure>
        </div>

        {count > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              aria-label="Previous testimonial"
              className="w-12 h-12 rounded-full border border-brand-violet/30 text-brand-violet flex items-center justify-center hover:bg-brand-violet hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="px-2 text-sm font-semibold text-slate-500 tabular-nums">
              {(index % count) + 1} / {count}
            </span>
            <button
              onClick={() => setIndex((i) => (i + 1) % count)}
              aria-label="Next testimonial"
              className="w-12 h-12 rounded-full border border-brand-violet/30 text-brand-violet flex items-center justify-center hover:bg-brand-violet hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {videoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Testimonial video"
          className="fixed inset-0 z-[110] bg-black/75 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setVideoUrl(null)}
        >
          <button
            onClick={() => setVideoUrl(null)}
            aria-label="Close video"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
          >
            <X className="w-6 h-6" />
          </button>
          <video src={videoUrl} className="w-full max-w-3xl rounded-xl" controls autoPlay />
        </div>
      )}
    </section>
  );
}

const fieldClass =
  "w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20";

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
    // scroll-mt keeps the heading clear of the sticky navbar on the hero's anchor link.
    <section id="publish-form" className="bg-white text-brand-ink py-16 lg:py-24 scroll-mt-40">
      <div className={`${WRAP} grid lg:grid-cols-2 gap-12 lg:gap-20 items-center`}>
        <div>
          <h2 style={SERIF} className="text-4xl lg:text-6xl font-medium tracking-tight leading-tight text-brand-deep">
            Have a manuscript? <em className="text-brand-violet">Let's publish it.</em>
          </h2>
          <p className="mt-5 max-w-lg text-lg text-slate-600 leading-relaxed">
            Tell us about your book and our team will get back to you within 24 hours.
          </p>
          <ul className="mt-8 space-y-4 font-medium">
            <li>
              <a href="tel:+916380658876" className="inline-flex items-center gap-3 hover:text-brand-violet transition-colors">
                <Phone className="w-5 h-5 text-brand-violet" />
                +91 6380658876
              </a>
            </li>
            <li>
              <a href="mailto:info@veritazinternational.com" className="inline-flex items-center gap-3 hover:text-brand-violet transition-colors break-all">
                <Mail className="w-5 h-5 text-brand-violet flex-shrink-0" />
                info@veritazinternational.com
              </a>
            </li>
            <li>
              <a href="https://wa.me/916380658876" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-brand-violet transition-colors">
                <MessageCircle className="w-5 h-5 text-brand-violet" />
                Join WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="reveal bg-brand-snow text-slate-800 rounded-2xl border border-brand-deep/10 p-6 sm:p-8 lg:p-10 space-y-4">
          <h3 className="text-2xl font-bold text-brand-deep">Publish Your Book</h3>
          <div>
            <label htmlFor="home-name" className="block text-sm font-semibold mb-1.5">Your Name</label>
            <input id="home-name" name="name" type="text" autoComplete="name" required className={fieldClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="home-email" className="block text-sm font-semibold mb-1.5">Email Address</label>
              <input id="home-email" name="email" type="email" autoComplete="email" required className={fieldClass} />
            </div>
            <div>
              <label htmlFor="home-phone" className="block text-sm font-semibold mb-1.5">Phone Number</label>
              <input id="home-phone" name="phone" type="tel" autoComplete="tel" required className={fieldClass} />
            </div>
          </div>
          <div>
            <label htmlFor="home-message" className="block text-sm font-semibold mb-1.5">Message</label>
            <textarea id="home-message" name="message" rows={3} className={`${fieldClass} h-auto py-3 resize-y`} />
          </div>
          <button
            type="submit"
            disabled={status.type === "loading"}
            className="w-full h-14 rounded-full bg-brand-violet text-white font-bold hover:bg-brand-deep disabled:opacity-60 transition-colors"
          >
            {status.type === "loading" ? "Sending..." : "Send Inquiry"}
          </button>
          <p
            role="status"
            className={`min-h-5 text-center text-sm font-medium ${
              status.type === "error" ? "text-red-600" : status.type === "success" ? "text-green-700" : "text-slate-500"
            }`}
          >
            {status.type === "loading" ? "" : status.message}
          </p>
        </form>
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
      <Process />
      <FromDraft />
      <Shelf books={books.slice(0, 12)} />
      <Reasons />
      <Testimonials testimonials={testimonials} />
      <InquiryForm />
    </main>
  );
}
