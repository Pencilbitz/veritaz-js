import { useState, useEffect, useRef } from "react";
import { Search, SearchX, Barcode, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { db } from "../lib/db";
import { mediaImg, retryOriginal } from "../lib/media";
import { Accent, Rule } from "../components/PressUI";
import { WRAP } from "../components/pressLayout";
import { useSeo } from "../seo/useSeo";
import { PAGES, bookPath } from "../seo/site";

/* Book Store, in the home page's "press" look: a lavender hero with the
   search set large and our books spine out in a walnut bookcase, then the catalogue
   on white, each book standing on its own little display shelf and turning
   to face you on hover. The bs-* styles live in styles/book-store.css. */

// Three full rows of the four-column grid.
const PAGE_SIZE = 12;

// Book orders go to the same WhatsApp number as the order form on the book
// details page, so every book order reaches the same person.
const ORDER_WHATSAPP = "919042007413";

const NO_COVER = "https://via.placeholder.com/150x200?text=No+Cover";


const whatsappOrderHref = (book) => {
  const lines = [
    "Hello, I would like to order this book:",
    "",
    `Book: ${book.title}`,
    book.isbn && `ISBN: ${book.isbn}`,
    "",
    "Please confirm availability and payment details.",
  ].filter((line) => line !== undefined && line !== null && line !== false);
  return `https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
};

/** Swap a cover that fails to load for the placeholder, once (so a failing
 *  placeholder cannot loop). */
const coverFallback = (e) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = NO_COVER;
};

/** Page numbers to show: always the first and last, the current page and its
 *  neighbours, with "…" standing in for each gap. */
function pageList(current, total) {
  const pages = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  return pages;
}

export default function BookStore() {
  const [books, setBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  // The page lives in the URL (?page=3) so the Back button from a book returns
  // to the same page of results, and a page can be linked to.
  const [searchParams, setSearchParams] = useSearchParams();
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const supabase = await db();
        // Only what the shelves, cards and search use: the covers wait on
        // this list, and whole rows (descriptions and all) are four times
        // the size.
        const { data, error } = await supabase
          .from("veritaz_books")
          .select("id, title, authors, isbn, cover1")
          .eq("status", "In Stock");

        if (error) throw error;

        setBooks(data || []);
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoaded(true);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const value = search.toLowerCase();

    // FIX 2: Changed book.author to book.authors to match your API
    return (
      (book.title && book.title.toLowerCase().includes(value)) ||
      (book.authors && book.authors.toLowerCase().includes(value)) ||
      (book.isbn && book.isbn.toLowerCase().includes(value))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(searchParams.get("page"), 10) || 1;
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageBooks = filteredBooks.slice(pageStart, pageStart + PAGE_SIZE);

  const goToPage = (next) => {
    setSearchParams(next > 1 ? { page: String(next) } : {});
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // A new search starts again from the first page of its results.
  const handleSearch = (value) => {
    setSearch(value);
    if (searchParams.has("page")) setSearchParams({}, { replace: true });
  };

  useSeo(PAGES["/book-store"]);

  const shelfBooks = books.filter((b) => b.title);

  return (
    <main className="overflow-x-clip bg-white text-slate-800">
      {/* ── Hero: the title and search, with real books on a lit shelf ── */}
      <header className="vz-hero-v2 relative isolate overflow-hidden">
        <svg aria-hidden="true" className="bs-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" className="bs-wave-back" />
          <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill="#fff" />
        </svg>
        <span aria-hidden="true" className="bs-hero-dots" />

        <div className={`${WRAP} grid items-center gap-10 pb-16 pt-10 sm:pb-24 sm:pt-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:pb-28 lg:pt-10 short:pb-20 short:pt-6`}>
          <div className="min-w-0">
            <Rule />
            <h1 className="mt-5 text-[2.25rem] leading-[1.1] text-vz-ink sm:text-5xl lg:text-[clamp(2.4rem,min(3.9vw,7.2svh),3.5rem)] short:mt-3">
              Find Your <Accent>Book</Accent>
            </h1>

            <div role="search" className="group relative mt-8 max-w-2xl short:mt-6">
              <span aria-hidden="true" className="bs-search-badge">
                <span className="svc-badge svc-badge--xs">
                  <Search className="relative z-10 h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
              </span>
              <input
                type="search"
                aria-label="Search by title, author or ISBN"
                placeholder="Search by title, author or ISBN..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="bs-search-input h-16 w-full rounded-full border-0 bg-white pl-[4.25rem] pr-6 text-base font-medium text-vz-ink outline-none placeholder:font-normal placeholder:text-slate-500 lg:text-[17px] short:h-14"
              />
            </div>

            <p aria-live="polite" className={`mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold text-vz-ink ${loaded ? "" : "invisible"}`}>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-sf-violet" />
                {filteredBooks.length} Book
                {filteredBooks.length !== 1 && "s"} Found
              </span>
              {totalPages > 1 && (
                <span className="font-medium text-slate-600">
                  {" "}· Showing {pageStart + 1}–{pageStart + pageBooks.length}
                </span>
              )}
            </p>
          </div>

          {/* Our books as a library shelves them, spine out. */}
          <Bookcase books={shelfBooks} />
        </div>
      </header>

      {/* ── Catalogue ── */}
      <section className="bs-paper relative isolate overflow-hidden pb-20 pt-6 lg:pb-24 lg:pt-8">
        <div className={WRAP}>
          <div ref={gridRef} className="grid scroll-mt-28 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-7">
            {loaded
              ? pageBooks.map((book, i) => <BookCard key={book.id} book={book} index={i} />)
              : Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
          </div>

          {/* Nothing matched the search: an empty shelf (the count above
              already says so). */}
          {loaded && filteredBooks.length === 0 && (
            <div aria-hidden="true" className="mx-auto flex flex-col items-center py-6">
              <span className="svc-badge">
                <SearchX className="relative z-10 h-6 w-6" strokeWidth={1.8} />
              </span>
              <span className="bs-empty-shelf mt-8" />
            </div>
          )}

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          )}
        </div>
      </section>
    </main>
  );
}

/* ── The hero's bookcase ──────────────────────────────────────────────────
   Two shelves of our books shown as a library shelves them, spine out, each
   lettered with its real title. One stands face-out on a stand, one leans at
   the end of a row, a few lie flat in a stack, and a bookend holds a row
   up. Pull a book (hover) and it rises from the shelf; click it to open its
   page. The spines are drawn in CSS: the real wrap images (back, spine and
   front in one) average over 800 KB each, too heavy for a banner. */

// Book cloth, and the lettering that reads on it.
const CLOTHS = [
  ["#1e2a5a", "#f1d68c"],
  ["#7a1f2b", "#f3dc9a"],
  ["#1f4d3a", "#efd690"],
  ["#e9dfc7", "#2a2346"],
  ["#3730a3", "#f4dd9c"],
  ["#0f5e63", "#f1d68c"],
  ["#5b2a6e", "#f3dc9a"],
  ["#2b2f3a", "#e9c97a"],
  ["#9a3b25", "#fbe6b0"],
  ["#34557a", "#f4dd9c"],
  ["#4d6127", "#f6e3a8"],
  ["#8f3557", "#f7e1a6"],
];
// Each spine's thickness (share of the case's width, in cqw) and height
// (share of the shelf), repeating.
const SPINES = [
  [6.2, 0.9], [7.6, 0.97], [5.2, 0.84], [6.8, 1], [8.2, 0.88], [5.6, 0.94],
  [7.2, 0.86], [6, 0.96], [7.8, 0.91], [5.4, 0.83], [7, 0.99], [6.4, 0.89],
];
// Which of the loaded books go where.
const UPPER = [0, 1, 2, 3, 4, 5, 6];
const FACE_OUT = 7;
const UPPER_END = [8, 9];
const LOWER = [11, 12, 13, 14, 15, 16, 17, 18, 19];
const LEANING = 20;
const FLAT = [21, 22, 23];

/** A title as it would be lettered down a spine: on a thick spine a long
 *  title runs in two lines, split at the word nearest the middle. */
function spineLines(title, thick) {
  if (!thick || title.length <= 16) return [title];
  const words = title.split(" ").filter(Boolean);
  let best = 1;
  let bestGap = Infinity;
  for (let i = 1; i < words.length; i++) {
    const gap = Math.abs(words.slice(0, i).join(" ").length - title.length / 2);
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  }
  return words.length > 1 ? [words.slice(0, best).join(" "), words.slice(best).join(" ")] : [title];
}

function Spine({ book, slot, className = "", style }) {
  const [w, h] = SPINES[slot % SPINES.length];
  const [cloth, ink] = CLOTHS[(slot * 5) % CLOTHS.length];
  const vars = { "--w": w, "--h": h, "--cloth": cloth, "--ink": ink, ...style };
  if (!book) return <span className={`bs-spine ${className}`} style={vars} />;
  return (
    <Link to={bookPath(book)} tabIndex={-1} className={`bs-spine ${className}`} style={vars} title={book.title}>
      <span className="bs-spine-title">
        {spineLines(book.title, w >= 6.6).map((line) => (
          <span key={line} className="bs-spine-line">
            {line}
          </span>
        ))}
      </span>
      <span className="bs-spine-mark" />
    </Link>
  );
}

function FlatBook({ book, slot }) {
  const [cloth, ink] = CLOTHS[(slot * 7 + 3) % CLOTHS.length];
  const style = { "--cloth": cloth, "--ink": ink, "--len": [100, 88, 94][slot % 3] };
  if (!book) return <span className="bs-flat-book" style={style} />;
  return (
    <Link to={bookPath(book)} tabIndex={-1} className="bs-flat-book" style={style} title={book.title}>
      <span className="bs-flat-title">{book.title}</span>
    </Link>
  );
}

/** Decorative (the catalogue below lists every book): hidden from screen
 *  readers and out of the tab order; the spines are mouse shortcuts. */
function Bookcase({ books }) {
  const at = (i) => books[i];
  const faceOut = at(FACE_OUT);
  return (
    <div aria-hidden="true" className="bs-library">
      <div className="bs-case">
        <div className="bs-row">
          {UPPER.map((i) => (
            <Spine key={i} book={at(i)} slot={i} />
          ))}
          <span className="bs-faceout">
            {faceOut ? (
              <Link to={bookPath(faceOut)} tabIndex={-1} title={faceOut.title}>
                <img {...mediaImg(faceOut.cover1, "cover")} alt="" onError={retryOriginal(faceOut.cover1, coverFallback)} />
              </Link>
            ) : (
              <span className="bs-faceout-blank" />
            )}
          </span>
          {UPPER_END.map((i) => (
            <Spine key={i} book={at(i)} slot={i} />
          ))}
          <span className="bs-bookend" />
        </div>
        <span className="bs-plank" />

        <div className="bs-row bs-row--lower">
          {LOWER.map((i) => (
            <Spine key={i} book={at(i)} slot={i} />
          ))}
          <Spine book={at(LEANING)} slot={LEANING} className="bs-spine--lean" />
          <span className="bs-flat">
            {FLAT.map((i, k) => (
              <FlatBook key={i} book={at(i)} slot={k} />
            ))}
          </span>
        </div>
        <span className="bs-plank bs-plank--lower" />
      </div>
    </div>
  );
}

/** One book in the catalogue: the cover as a real hardcover standing on
 *  clean white (spine crease, page edges down its side, a soft shadow
 *  where it stands), then the title, authors, ISBN and the two actions.
 *  The first row is on screen as the page opens, so its covers load at once
 *  (the first one first); the rest wait until they are scrolled near. */
function BookCard({ book, index = Infinity }) {
  return (
    <article className="bs-card svc-card reveal group relative isolate flex flex-col overflow-hidden rounded-[1.75rem] bg-white">
      <Link
        to={bookPath(book)}
        className="bs-card-link relative z-0 block rounded-t-[1.75rem] outline-none"
      >
        <span className="bs-stage">
          <span className="bs-book">
            {/* FIX 3: Changed book.cover to book.cover1 to match API structure */}
            <img
              {...mediaImg(book.cover1, "cover")}
              alt={book.title}
              loading={index < 4 ? undefined : "lazy"}
              fetchPriority={index === 0 ? "high" : undefined}
              onError={retryOriginal(book.cover1, coverFallback)}
            />
          </span>
        </span>

        {/* Title always takes two lines (4.5rem: the 1.25rem top padding plus two
            lines) and authors one, so the ISBN sits at
            the same height on every card. */}
        <h3
          className="min-h-[4.5rem] px-5 pt-5 text-[17px] font-bold leading-[1.55rem] text-vz-ink transition-colors line-clamp-2 group-hover:text-sf-indigo"
          title={book.title}
        >
          {book.title}
        </h3>
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* FIX 4: Changed book.author to book.authors */}
        <p className="mt-1.5 truncate text-[13px] font-medium text-slate-500" title={book.authors}>
          {book.authors}
        </p>

        <p className="mt-4 flex items-center gap-2 border-t border-vz-line pt-4 text-[13px] font-semibold text-slate-600 tabular-nums">
          <Barcode size={16} className="flex-none text-sf-violet" aria-hidden="true" />
          ISBN : {book.isbn}
        </p>

        {/* mt-auto keeps the buttons level across a row of cards,
            however long each title and author list runs. */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            to={bookPath(book)}
            aria-label={`View details of ${book.title}`}
            className="bs-view pill-primary inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-white transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-indigo"
          >
            <Eye size={18} aria-hidden="true" />
            View Details
          </Link>
          <a
            href={whatsappOrderHref(book)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Order ${book.title} on WhatsApp`}
            className="bs-wa group/wa relative flex h-11 w-11 flex-none items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]"
          >
            <FaWhatsapp className="text-xl" aria-hidden="true" />
            <Tooltip side="end">Order on WhatsApp</Tooltip>
          </a>
        </div>
      </div>
    </article>
  );
}

/** A grey stand-in card while the catalogue loads. */
function CardSkeleton() {
  return (
    <div aria-hidden="true" className="bs-card-skeleton overflow-hidden rounded-[1.75rem] bg-white">
      <span className="bs-stage">
        <span className="bs-book bs-book--ghost" />
      </span>
      <span className="block px-5 pb-6 pt-5">
        <span className="block h-4 w-4/5 rounded-full bg-sf-mist" />
        <span className="mt-3 block h-4 w-3/5 rounded-full bg-sf-mist" />
        <span className="mt-5 block h-3 w-2/5 rounded-full bg-slate-100" />
        <span className="mt-6 flex justify-between">
          <span className="block h-11 w-32 rounded-full bg-sf-mist" />
          <span className="block h-11 w-11 rounded-full bg-sf-mist" />
        </span>
      </span>
    </div>
  );
}

/** Small label shown above an icon button on hover or keyboard focus. It is
 *  aligned to the button's outer edge (start = left, end = right) so it never
 *  spills past the card. The button's own aria-label is what screen readers
 *  read, so the tooltip itself is hidden from them. */
function Tooltip({ side, children }) {
  const edge = side === "end" ? "right-0" : "left-0";
  const arrow = side === "end" ? "right-4" : "left-4";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-full ${edge} z-20 mb-2.5 translate-y-1 whitespace-nowrap rounded-lg bg-vz-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition duration-150 group-hover/wa:translate-y-0 group-hover/wa:opacity-100 group-focus-visible/wa:translate-y-0 group-focus-visible/wa:opacity-100`}
    >
      {children}
      <span className={`absolute -bottom-1 ${arrow} h-2 w-2 rotate-45 bg-vz-ink`} />
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const arrow =
    "bs-page-arrow inline-flex h-11 w-11 items-center justify-center gap-1.5 rounded-full text-sm font-bold text-vz-ink transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-indigo sm:h-12 sm:w-auto sm:px-5";

  return (
    <nav aria-label="Book pages" className="bs-pager mx-auto mt-14 flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-full p-1.5 sm:gap-2 sm:p-2">
      <button type="button" className={arrow} onClick={() => onChange(page - 1)} disabled={page === 1}>
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sr-only sm:hidden">Previous page</span>
      </button>

      <ul className="flex items-center gap-0.5 sm:gap-1">
        {pageList(page, totalPages).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-slate-400">…</li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={`h-10 min-w-10 rounded-full px-2.5 text-sm font-bold tabular-nums sm:h-11 sm:min-w-11 sm:px-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-indigo ${
                  p === page ? "pill-primary text-white" : "text-vz-ink hover:bg-sf-mist"
                }`}
              >
                {p}
              </button>
            </li>
          )
        )}
      </ul>

      <button type="button" className={arrow} onClick={() => onChange(page + 1)} disabled={page === totalPages}>
        <span className="hidden sm:inline">Next</span>
        <span className="sr-only sm:hidden">Next page</span>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}
