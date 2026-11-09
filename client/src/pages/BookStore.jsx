import { useState, useEffect, useRef } from "react";
import { Search, Barcode, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

// Three full rows of the four-column grid.
const PAGE_SIZE = 12;

// Book orders go to the same WhatsApp number as the order form on the book
// details page, so every book order reaches the same person.
const ORDER_WHATSAPP = "919042007413";

const bookPath = (book) => `/books/${book.title.replace(/\s+/g, "-").toLowerCase()}-${book.id}`;

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
  const [search, setSearch] = useState("");
  // The page lives in the URL (?page=3) so the Back button from a book returns
  // to the same page of results, and a page can be linked to.
  const [searchParams, setSearchParams] = useSearchParams();
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from("veritaz_books")
          .select("*")
          .eq("status", "In Stock");

        if (error) throw error;

        setBooks(data || []);
      } catch (err) {
        console.error("Error fetching books:", err);
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

  useEffect(() => {
    document.title = "Academic Book Store | ISBN Books | Veritaz International";

    // 1. Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Browse academic, engineering, research, AI and technology books published with ISBN by Veritaz International. Find quality textbooks by expert authors.";

    // 2. Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = "online bookstore Veritaz, buy academic books, research publications, textbook store India, peer-reviewed books online, order scholarly publications";

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
    canonicalLink.href = "https://www.veritazinternational.com/book-store";
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-indigo-900 mb-6">
            Find Your Book
          </h1>

          <div className="max-w-2xl mx-auto relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by title, author or ISBN..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 shadow bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <p className="mt-4 text-gray-500">
            {filteredBooks.length} Book
            {filteredBooks.length !== 1 && "s"} Found
            {totalPages > 1 && (
              <span className="text-gray-400">
                {" "}· Showing {pageStart + 1}–{pageStart + pageBooks.length}
              </span>
            )}
          </p>
        </div>

        <div ref={gridRef} className="grid scroll-mt-28 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pageBooks.map((book) => (
            <article
              key={book.id}
              className="flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link to={bookPath(book)} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep">
                {/* FIX 3: Changed book.cover to book.cover1 to match API structure */}
                <img
                  src={book.cover1}
                  alt={book.title}
                  className="mx-auto h-64 object-cover rounded mb-4"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150x200?text=No+Cover" }}
                />

                {/* Title always takes two lines and authors one, so the ISBN sits at
                    the same height on every card. */}
                <h3 className="min-h-[3.5rem] font-bold text-lg text-gray-800 line-clamp-2 hover:text-brand-deep" title={book.title}>
                  {book.title}
                </h3>
              </Link>

              {/* FIX 4: Changed book.author to book.authors */}
              <p className="text-xs text-gray-500 font-semibold mt-2 truncate" title={book.authors}>
                {book.authors}
              </p>

              <p className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-orange-500 uppercase">
                <Barcode size={16} className="text-gray-600" />
                ISBN : {book.isbn}
              </p>

              {/* mt-auto keeps the buttons level across a row of cards,
                  however long each title and author list runs. */}
              <div className="mt-auto flex items-center justify-between pt-5">
                <Link
                  to={bookPath(book)}
                  aria-label={`View details of ${book.title}`}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-deep/20 text-brand-deep transition-colors hover:border-brand-deep hover:bg-brand-deep hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep"
                >
                  <Eye size={18} aria-hidden="true" />
                  <Tooltip side="start">View Details</Tooltip>
                </Link>
                <a
                  href={whatsappOrderHref(book)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Order ${book.title} on WhatsApp`}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white transition-colors hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
                >
                  <i className="fab fa-whatsapp text-xl" aria-hidden="true"></i>
                  <Tooltip side="end">Order on WhatsApp</Tooltip>
                </a>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        )}
      </div>
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
      className={`pointer-events-none absolute bottom-full ${edge} mb-2.5 translate-y-1 whitespace-nowrap rounded-lg bg-brand-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100`}
    >
      {children}
      <span className={`absolute -bottom-1 ${arrow} h-2 w-2 rotate-45 bg-brand-ink`} />
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const arrow =
    "inline-flex h-11 items-center gap-1.5 rounded-full border border-brand-deep/15 bg-white px-4 text-sm font-bold text-brand-deep shadow-sm transition-colors hover:border-brand-deep hover:bg-brand-deep hover:text-white disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep";

  return (
    <nav aria-label="Book pages" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      <button type="button" className={arrow} onClick={() => onChange(page - 1)} disabled={page === 1}>
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sr-only sm:hidden">Previous page</span>
      </button>

      <ul className="flex items-center gap-1.5">
        {pageList(page, totalPages).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-gray-400">…</li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={`h-11 min-w-11 rounded-full px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep ${
                  p === page
                    ? "bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet text-white shadow-[0_8px_20px_rgb(8_72_168/0.3)]"
                    : "bg-white text-brand-ink shadow-sm hover:bg-brand-mist"
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