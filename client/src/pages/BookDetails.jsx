import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Barcode, BookOpen, Bookmark, Building2, CircleCheck, Copyright, Eye, FileText, Gift,
  Headphones, Languages, Printer, RotateCcw, Ruler, Share2, ShieldCheck, Star, Truck,
  Users, Weight, X,
} from 'lucide-react';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { supabase } from "../lib/supabase";
import { Accent, Pill, Rule } from '../components/PressUI';
import { H2_FIT, SCREEN, SCREEN_PAD, WRAP } from '../components/pressLayout';
import { useSeo } from "../seo/useSeo";
import { NOT_FOUND, bookMeta } from "../seo/site";

/* Book Details, in the home page's "press" look: a lavender hero with the book
   standing in 3D on a violet disc (it turns round to show its back cover),
   the title, the key facts on white cards and the price in a night-indigo
   buy box; then the description and a spec sheet on white. The bs-* styles
   live in styles/book-store.css. */

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-indigo';
const INPUT = 'w-full rounded-xl border border-vz-line bg-vz-paper/60 px-4 py-3 text-sm font-medium text-vz-ink outline-none transition placeholder:text-slate-500 focus:border-sf-indigo focus:bg-white focus:ring-4 focus:ring-sf-indigo/15';
const FIELD_LABEL = 'mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600';
const SMALL_BTN = `bs-soft-btn inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-vz-ink transition-colors ${FOCUS}`;
const CARD = 'svc-card relative isolate overflow-hidden bg-white';

const FRONT_FALLBACK = 'https://placehold.co/300x400/EEE/31343C?text=No+Cover';

/** Swap an image that fails to load for a placeholder, once. */
const fallbackOnce = (src) => (e) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = '1';
  img.src = src;
};

// Decorative icons for the spec sheet rows, in the order of productDetails.
const SPEC_ICONS = [Building2, Barcode, Bookmark, Weight, BookOpen, Ruler, Languages, Printer, FileText, Copyright];

export default function BookDetails() {
  const { slug } = useParams(); // Maps to the unique book title-id slug[cite: 3]

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for dynamic functionality[cite: 3]
  const [currentImage, setCurrentImage] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error: sbError } = await supabase
          .from("veritaz_books")
          .select("*");

        if (sbError) throw sbError;

        const books = data || [];


        // Find book by title-id slug (with fallback to ID direct match)[cite: 3]
        const targetId = slug ? slug.split('-').pop() : null;

        const bookData = books.find((b) => {
          if (!b) return false;

          // Check combined formatted title + id
          if (b.title && b.id !== undefined) {
            const generatedSlug = `${b.title.replace(/\s+/g, '-').toLowerCase()}-${b.id}`;
            if (generatedSlug === slug?.toLowerCase()) {
              return true;
            }
          }

          // Fallback check by direct ID matching
          if (b.id !== undefined && String(b.id) === targetId) {
            return true;
          }

          return false;
        });


        if (!bookData) {
          setError("Book not found");
        } else {
          setBook(bookData);
          setCurrentImage(bookData.cover1 || "");
        }
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("Book not found or server error");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [slug]);

  useSeo(book ? bookMeta(book) : error ? NOT_FOUND : null);

  // Form states for checkout flow[cite: 3]
  const [custName, setCustName] = useState("");
  const [custLocation, setCustLocation] = useState("");
  const [custQty, setCustQty] = useState("1");

  if (loading) {
    return (
      <div className="vz-hero-v2 flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span aria-hidden="true" className="h-11 w-11 rounded-full border-4 border-sf-indigo/15 border-t-sf-violet motion-safe:animate-spin" />
          <p className="font-semibold text-vz-ink">Loading...</p>
        </div>
      </div>
    );
  }
  if (error || !book) {
    return (
      <div className="vz-hero-v2 flex min-h-[60vh] items-center justify-center px-4">
        <p className="font-display text-3xl font-bold text-vz-ink">{error || 'Book not found'}</p>
      </div>
    );
  }

  // Modern Native Share handler[cite: 3]
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${book.title} - Veritaz International`,
          text: `Check out this book: ${book.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // WhatsApp checkout message generator[cite: 3]
  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const adminPhoneNumber = "919042007413";

    let message = `New Order Request \n`;
    message += `-----------------------\n`;
    message += `Book: ${book.title}\n`;
    message += `Price: ₹${book.price || "1126"}\n`;
    message += `Quantity: ${custQty}\n`;
    message += `-----------------------\n`;
    message += `Name: ${custName}\n`;
    message += `Location: ${custLocation}\n`;
    message += `-----------------------\n`;
    message += `Please confirm availability and payment details.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminPhoneNumber}?text=${encodedMessage}`, '_blank');
    setIsOrderModalOpen(false);
  };

  const authors = book.authors
    ? book.authors.split(',').map((name) => name.trim()).filter(Boolean)
    : [];

  const productDetails = [
    ['Publisher', book.publisher || 'Veritaz International Press'],
    ['ISBN-13', book.isbn],
    ['Edition', book.edition || '1st Edition'],
    ['Item Weight', book.weight || '282 grams'],
    ['Binding', book.binding || 'Paperback'],
    ['Dimensions', book.dimensions || '7.0 x 9.4 inches'],
    ['Language', book.language || 'English'],
    ['Print Format', book.format || 'Single Color'],
    ['Pages', book.pages || '151'],
    ['Copyright', book.copyright || '2026'],
  ];

  const features = [
    { Icon: Truck, label: 'Free Shipping*', tone: '' },
    { Icon: Headphones, label: '24/7 Support', tone: 'svc-badge--sky' },
    { Icon: ShieldCheck, label: 'Authentic', tone: 'svc-badge--amber' },
    { Icon: Gift, label: 'Safe Wrap', tone: 'svc-badge--pink' },
  ];

  return (
    <main className="overflow-x-clip bg-white text-slate-800">
      {/* ── Book overview ─────────────────────────────────── */}
      <section className="vz-hero-v2 relative isolate overflow-hidden lg:flex lg:min-h-[calc(100svh-7.6rem)] lg:flex-col">
        <svg aria-hidden="true" className="bs-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" className="bs-wave-back" />
          <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill="#fff" />
        </svg>
        <span aria-hidden="true" className="bs-hero-dots" />

        <div className={`${WRAP} grid gap-10 pb-20 pt-8 lg:flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:pb-12 lg:pt-6 xl:gap-20 short:pb-10 short:pt-4`}>

          {/* Cover showcase */}
          <BookShowcase
            book={book}
            currentImage={currentImage}
            onSelect={setCurrentImage}
            onPreview={() => setIsLightboxOpen(true)}
            onShare={handleShare}
          />

          {/* Details */}
          <div className="min-w-0">
            <Rule />
            <h1 className="mt-4 text-[1.875rem] leading-[1.15] text-vz-ink sm:text-[2.4rem] lg:text-[clamp(1.75rem,min(2.45vw,4.9svh),2.4rem)] short:mt-3">
              {book.title}
            </h1>

            {/* Ratings */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm short:mt-3">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      fill="currentColor"
                      strokeWidth={0}
                      className={`h-[18px] w-[18px] ${i < (book.ratings || 5) ? 'text-sf-amber' : 'text-sf-amber/35'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-vz-ink">{book.ratings || '5'}.0/5</span>
                <span className="text-slate-600">(110 reviews)</span>
              </div>
              <span aria-hidden="true" className="hidden h-4 w-px bg-sf-indigo/20 sm:block" />
              <div className="flex items-center gap-1.5">
                <Eye className="h-[18px] w-[18px] text-sf-indigo" aria-hidden="true" />
                <span className="font-bold text-vz-ink">1,243</span>
                <span className="text-slate-600">views</span>
              </div>
            </div>

            {/* Authors, ISBN, edition */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] short:mt-4">
              <div className={`${CARD} flex gap-4 rounded-3xl p-5 sm:col-span-2 lg:p-4 xl:col-span-1 xl:row-span-2`}>
                <span aria-hidden="true" className="svc-card-glow" />
                <span aria-hidden="true" className="svc-badge svc-badge--sm">
                  <Users className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Authors</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {authors.length > 0 ? authors.map((name, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[15px] font-semibold leading-snug text-vz-ink">
                        <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 flex-none rotate-45 bg-sf-violet" />
                        {name}
                      </li>
                    )) : (
                      <li className="text-[15px] font-semibold text-vz-ink">Unknown Author</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className={`${CARD} flex items-center gap-4 rounded-3xl p-4 lg:py-3`}>
                <span aria-hidden="true" className="svc-card-glow" />
                <span aria-hidden="true" className="svc-badge svc-badge--sm svc-badge--amber">
                  <Barcode className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">ISBN-13</p>
                  <p className="mt-0.5 whitespace-nowrap text-[15px] font-bold tabular-nums text-vz-ink lg:text-sm xl:text-[15px]">{book.isbn}</p>
                </div>
              </div>

              <div className={`${CARD} flex items-center gap-4 rounded-3xl p-4 lg:py-3`}>
                <span aria-hidden="true" className="svc-card-glow" />
                <span aria-hidden="true" className="svc-badge svc-badge--sm svc-badge--pink">
                  <Bookmark className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Edition</p>
                  <p className="mt-0.5 text-[15px] font-bold text-vz-ink">{book.edition || `1st Edition, ${book.copyright || '2026'}`}</p>
                </div>
              </div>
            </div>

            {/* Price & stock, with the ways to buy */}
            <div className="bs-buy relative isolate mt-4 overflow-hidden rounded-[1.75rem] p-5 text-white sm:p-6 lg:p-5 short:mt-3 short:p-4">
              <span aria-hidden="true" className="bs-buy-dots" />
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between lg:flex-col lg:items-start xl:flex-row xl:items-center">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-[2.25rem] font-bold leading-none tabular-nums short:text-[2rem]">₹{book.price}</span>
                    <span className="text-sm font-medium text-white/70 line-through">₹{book.price ? Number(book.price) + 100 : '0'}</span>
                    <span className="rounded-full bg-sf-amber px-2.5 py-0.5 text-xs font-bold text-vz-ink">SAVE ₹100</span>
                  </div>
                  <p className="mt-2 text-left text-xs text-white/80">Inclusive of all taxes • Free shipping on orders</p>
                </div>
                <div className="md:text-right lg:text-left xl:text-right">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-amber-300 md:justify-end lg:justify-start xl:justify-end">
                    <CircleCheck className="h-[18px] w-[18px]" aria-hidden="true" /> {book.status || 'In Stock'} • Ready to Ship
                  </p>
                  <p className="mt-1 text-left text-xs text-white/80 md:text-right lg:text-left xl:text-right">Delivery in 4-5 business days</p>
                </div>
              </div>

              <div className={`mt-5 grid gap-3 lg:mt-4 short:mt-3 ${book.flipkart ? 'sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : ''}`}>
                <Pill onClick={() => setIsOrderModalOpen(true)} icon={FaWhatsapp} arrow className="bs-whatsapp w-full whitespace-nowrap px-5!">
                  Order via WhatsApp
                </Pill>
                {book.flipkart && (
                  <Pill
                    href={book.flipkart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bs-flipkart w-full whitespace-nowrap px-5!"
                  >
                    <span className="flex h-8 items-center rounded-lg bg-white px-1.5">
                      <img
                        src="https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png"
                        alt="Flipkart"
                        className="h-7 w-auto"
                      />
                    </span>
                    Buy on Flipkart
                  </Pill>
                )}
              </div>
            </div>

            {/* More actions */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 short:mt-3">
              <Pill variant="outline" icon={BookOpen} onClick={() => setIsContactModalOpen(true)} className="h-12! px-5! short:h-11!">
                Bulk/Institutional
              </Pill>
              <Pill variant="outline" icon={Eye} onClick={() => setIsLightboxOpen(true)} className="h-12! px-5! short:h-11!">
                Preview Sample
              </Pill>
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[13px] font-semibold text-slate-600 short:mt-3">
              <span className="flex items-center gap-1.5"><CircleCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" /> Secure WhatsApp Checkout</span>
              <span aria-hidden="true" className="hidden h-1.5 w-1.5 rotate-45 bg-sf-violet/40 sm:block" />
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-sf-indigo" aria-hidden="true" /> 100% Genuine Books</span>
              <span aria-hidden="true" className="hidden h-1.5 w-1.5 rotate-45 bg-sf-violet/40 sm:block" />
              <span className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4 text-sf-violet" aria-hidden="true" /> Easy Returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── About & product details ───────────────────────── */}
      <section className={`bs-paper relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
        <div className={`${WRAP} grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16 xl:gap-20`}>
          <div className="min-w-0">
            <Rule />
            <h2 className={`reveal mt-5 ${H2_FIT} leading-[1.1] text-vz-ink short:mt-3`}>
              About This <Accent>Book</Accent>
            </h2>
            <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-slate-600 lg:text-[17px] short:mt-4 short:text-[15px]">
              {book.about || book.features || book.description || 'No description provided for this book.'}
            </p>

            {/* Features */}
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 short:mt-5">
              {features.map(({ Icon, label, tone }) => (
                <li key={label} className={`${CARD} group reveal flex flex-col items-center gap-3 rounded-2xl px-3 py-5 text-center short:py-4`}>
                  <span aria-hidden="true" className="svc-card-glow" />
                  <span aria-hidden="true" className={`svc-badge svc-badge--sm ${tone}`}>
                    <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-vz-ink">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${CARD} rounded-[2rem]`}>
            <span aria-hidden="true" className="svc-card-glow" />
            <div className="bs-spec-head relative isolate overflow-hidden px-6 py-5 sm:px-8 short:py-4">
              <span aria-hidden="true" className="bs-buy-dots" />
              <h2 className="flex items-center gap-3 text-2xl text-white">
                <span aria-hidden="true" className="svc-badge svc-badge--xs svc-badge--glass">
                  <BookOpen className="relative z-10 h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                Product Details
              </h2>
            </div>
            <dl className="divide-y divide-vz-line px-6 py-2 sm:px-8 short:py-1">
              {productDetails.map(([label, value], i) => {
                const Icon = SPEC_ICONS[i];
                return (
                  <div key={label} className="grid grid-cols-[auto_minmax(0,2fr)_minmax(0,3fr)] items-center gap-x-3 py-3 lg:py-2.5 short:py-1.5">
                    <span aria-hidden="true" className="bs-spec-icon">
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-600">{label}</dt>
                    <dd className="text-sm font-semibold text-vz-ink">{value}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* 1. Fullscreen Preview Lightbox Component */}
      <Modal
        open={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        lightDismiss={false}
        aria-labelledby="bs-lightbox-image"
        onClick={() => setIsLightboxOpen(false)}
        className="bs-dialog--lightbox m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 open:flex"
      >
        <button
          type="button"
          onClick={() => setIsLightboxOpen(false)}
          aria-label="Close preview"
          className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X size={24} aria-hidden="true" />
        </button>
        <img
          id="bs-lightbox-image"
          src={currentImage || book.cover1}
          alt="Fullscreen preview"
          className="max-h-[90vh] max-w-full rounded object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </Modal>

      {/* 2. Order via WhatsApp Modal Component */}
      <Modal
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        initialFocus="#order-name"
        aria-labelledby="order-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl bg-white p-0"
      >
        <div className="bs-spec-head relative isolate flex items-center justify-between overflow-hidden px-6 py-4 text-white">
          <span aria-hidden="true" className="bs-buy-dots" />
          <h3 id="order-title" className="text-lg font-bold">Confirm Order Details</h3>
          <button type="button" onClick={() => setIsOrderModalOpen(false)} aria-label="Close" className="rounded-full p-1 text-white/75 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-vz-paper p-3 ring-1 ring-vz-line">
            <img src={book.cover1} alt={book.title} className="h-16 w-12 rounded bg-white object-cover shadow-md" onError={fallbackOnce("https://placehold.co/50x70?text=No+Cover")} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-vz-ink">{book.title}</p>
              <p className="mt-0.5 text-sm font-extrabold text-sf-indigo">₹{book.price}</p>
            </div>
          </div>

          <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
            <div>
              <label htmlFor="order-name" className={FIELD_LABEL}>Your Name</label>
              <input
                id="order-name"
                type="text"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className={INPUT}
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label htmlFor="order-location" className={FIELD_LABEL}>Delivery City / Pincode</label>
              <input
                id="order-location"
                type="text"
                value={custLocation}
                onChange={(e) => setCustLocation(e.target.value)}
                className={INPUT}
                placeholder="City, State, Pincode"
                required
              />
            </div>
            <div>
              <label htmlFor="order-qty" className={FIELD_LABEL}>Quantity</label>
              <select
                id="order-qty"
                value={custQty}
                onChange={(e) => setCustQty(e.target.value)}
                className={INPUT}
              >
                <option value="1">1 Copy</option>
                <option value="2">2 Copies</option>
                <option value="5">5 Copies</option>
                <option value="10">10+ (Bulk/Institutional)</option>
              </select>
            </div>

            <Pill type="submit" className="bs-whatsapp mt-2 w-full">
              <span>Place Order on WhatsApp</span>
              <FaWhatsapp size={16} aria-hidden="true" />
            </Pill>
          </form>
        </div>
      </Modal>

      {/* 3. Bulk Institutional Sales Inquiry Modal Component */}
      <Modal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        aria-labelledby="bulk-title"
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl bg-white p-7 text-center"
      >
        <span aria-hidden="true" className="svc-badge mx-auto mb-4">
          <Building2 className="relative z-10 h-7 w-7" strokeWidth={1.8} />
        </span>
        <h3 id="bulk-title" className="mb-1 text-2xl font-bold text-vz-ink">Institutional Inquiry</h3>
        <p className="mb-6 text-sm text-slate-600">For universities, corporate distributions, libraries, or global bulk batches, contact our management desk.</p>

        <div className="space-y-3">
          <Pill href="tel:+916380658876" icon={FaPhoneAlt} className="h-12! w-full">
            Call Sales Desk
          </Pill>
          <Pill href="mailto:info@veritazinternational.com" variant="outline" icon={FaEnvelope} className="h-12! w-full">
            Send Email Route
          </Pill>
        </div>
        <button type="button" onClick={() => setIsContactModalOpen(false)} className="mt-4 rounded text-sm text-slate-600 underline transition hover:text-vz-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-indigo">
          Close Context Window
        </button>
      </Modal>
    </main>
  );
}

/** The book standing in 3D on a violet disc: the front cover (cover1), the
 *  spine and back cover cut from the full wrap (cover2), and the page edges.
 *  Picking the back thumbnail turns the book round. Below it, the front and
 *  back thumbnails and the preview and share buttons. */
function BookShowcase({ book, currentImage, onSelect, onPreview, onShare }) {
  const showingBack = Boolean(book.cover2) && currentImage === book.cover2;

  return (
    <div className="min-w-0">
      <div className="bs-b3-scene">
        <span aria-hidden="true" className="bs-b3-disc" />
        <button
          type="button"
          onClick={onPreview}
          aria-label="Open full preview"
          className={`bs-b3-btn rounded-md ${FOCUS}`}
        >
          <span className="bs-b3" data-side={showingBack ? 'back' : 'front'}>
            <span className="bs-b3-face bs-b3-front">
              <img src={book.cover1} alt={book.title} onError={fallbackOnce(FRONT_FALLBACK)} />
            </span>
            {book.cover2 ? (
              <>
                <span aria-hidden="true" className="bs-b3-face bs-b3-back">
                  <img src={book.cover2} alt="" />
                </span>
                <span aria-hidden="true" className="bs-b3-spine" style={{ backgroundImage: `url("${book.cover2}")` }} />
              </>
            ) : (
              <span aria-hidden="true" className="bs-b3-spine" />
            )}
            <span aria-hidden="true" className="bs-b3-pages" />
            <span aria-hidden="true" className="bs-b3-head" />
          </span>
          <span aria-hidden="true" className="bs-b3-shadow" />
        </button>
      </div>

      <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-600">Book Preview</p>

      {/* Front / back thumbnails */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onSelect(book.cover1)}
          aria-label="Show front cover"
          aria-pressed={currentImage === book.cover1}
          className={`bs-thumb h-[72px] w-14 overflow-hidden rounded-lg bg-white ${currentImage === book.cover1 ? 'bs-thumb--on' : ''} ${FOCUS}`}
        >
          <img src={book.cover1} alt="Front Cover" className="h-full w-full object-cover" />
        </button>
        <button
          type="button"
          onClick={() => onSelect(book.cover2 || book.cover1)}
          aria-label="Show back cover"
          aria-pressed={Boolean(book.cover2) && currentImage === book.cover2}
          className={`bs-thumb h-[72px] w-14 overflow-hidden rounded-lg bg-white ${book.cover2 && currentImage === book.cover2 ? 'bs-thumb--on' : ''} ${FOCUS}`}
        >
          {book.cover2 ? (
            <img src={book.cover2} alt="Back Preview" className="h-full w-full object-cover object-left" />
          ) : (
            <span className="flex h-full w-full flex-col">
              <span className="flex h-1/2 items-center justify-center bg-vz-ink p-1 text-center text-[8px] text-white">Full Preview</span>
              <span className="flex h-1/2 items-center justify-center bg-white">
                <span className="flex h-6 w-6 items-center justify-center border border-gray-300 text-[6px] text-gray-500">Barcode</span>
              </span>
            </span>
          )}
        </button>
      </div>

      <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-3">
        <button type="button" onClick={onPreview} className={SMALL_BTN}>
          <Eye className="h-[18px] w-[18px]" aria-hidden="true" /> Full Preview
        </button>
        <button type="button" onClick={onShare} className={SMALL_BTN}>
          <Share2 className="h-[18px] w-[18px]" aria-hidden="true" /> Share
        </button>
      </div>
    </div>
  );
}

// Browsers without <dialog closedby> get light dismiss from script instead.
const NEEDS_LIGHT_DISMISS = typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype);

/** A native modal <dialog>, opened and closed by `open`. The browser handles
 *  focus, Esc and the inert page; `onClose` keeps the state in step however it
 *  closes. With `lightDismiss`, a click on the backdrop closes it too. */
function Modal({ open, onClose, initialFocus, lightDismiss = true, className = '', children, ...rest }) {
  const ref = useRef(null);
  const pressedOutside = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      if (initialFocus) dialog.querySelector(initialFocus)?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  const outside = (e) => {
    const r = ref.current.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  const fallback = lightDismiss && NEEDS_LIGHT_DISMISS
    ? {
        onPointerDown: (e) => { pressedOutside.current = outside(e); },
        onPointerUp: (e) => { if (pressedOutside.current && outside(e)) ref.current.close(); },
      }
    : {};

  return (
    <dialog
      ref={ref}
      closedby={lightDismiss ? 'any' : undefined}
      onClose={onClose}
      className={`bs-dialog ${className}`}
      {...fallback}
      {...rest}
    >
      {children}
    </dialog>
  );
}
