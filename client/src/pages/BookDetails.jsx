import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MdArrowBack, MdShare, MdStar, MdOutlineVisibility,
  MdOutlineBookmarkBorder, MdCheckCircle, MdLocalShipping,
  MdSupportAgent, MdVerifiedUser, MdCardGiftcard, MdOutlineMenuBook,
  MdPeopleOutline, MdClose, MdBusiness
} from 'react-icons/md';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { supabase } from "../lib/supabase";

const WRAP = 'mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20';
const SERIF = { fontFamily: 'var(--font-serif)' };
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep';
const CARD = 'rounded-2xl bg-white border border-brand-deep/10';
const INPUT = 'w-full rounded-xl border border-brand-deep/10 bg-brand-snow px-4 py-3 text-sm font-medium text-brand-ink outline-none transition placeholder:text-slate-400 focus:border-brand-bright focus:bg-white focus:ring-4 focus:ring-brand-bright/15';

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

        console.log("All Books:", books);
        console.log("URL Param:", slug);

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

        console.log("Selected Book:", bookData);

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
    canonicalLink.href = "https://www.veritazinternational.com/books";
  }, []);

  // Form states for checkout flow[cite: 3]
  const [custName, setCustName] = useState("");
  const [custLocation, setCustLocation] = useState("");
  const [custQty, setCustQty] = useState("1");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-snow">
        <div className="flex flex-col items-center gap-4">
          <span aria-hidden="true" className="h-11 w-11 animate-spin rounded-full border-4 border-brand-deep/15 border-t-brand-violet" />
          <p className="font-semibold text-brand-ink">Loading...</p>
        </div>
      </div>
    );
  }
  if (error || !book) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-snow px-4">
        <p style={SERIF} className="text-3xl font-medium text-brand-ink">{error || 'Book not found'}</p>
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
    { Icon: MdLocalShipping, label: 'Free Shipping*', tile: 'bg-brand-mist text-brand-deep' },
    { Icon: MdSupportAgent, label: '24/7 Support', tile: 'bg-brand-paper text-brand-violet' },
    { Icon: MdVerifiedUser, label: 'Authentic', tile: 'bg-brand-gold/20 text-[#8a6413]' },
    { Icon: MdCardGiftcard, label: 'Safe Wrap', tile: 'bg-brand-orchid/15 text-[#9a3fbf]' },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* ── Book overview ─────────────────────────────────── */}
      <section className="bg-white">

        <div className={`${WRAP} relative grid gap-10 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:py-16`}>

          {/* Cover showcase */}
          <div className="lg:self-start">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-mist via-white to-brand-paper p-8 border border-brand-deep/10 sm:p-10">
              <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-bright/15 blur-3xl" />
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="Open full preview"
                className={`relative mx-auto block w-full max-w-[300px] ${FOCUS}`}
              >
                <img
                  src={currentImage || book.cover1}
                  alt={book.title}
                  className="w-full rounded-md object-cover transition-transform duration-300 hover:-translate-y-1"
                  onError={(e) => { e.target.src = 'https://placehold.co/300x400/EEE/31343C?text=No+Cover'; }}
                />
              </button>

              <p className="relative mt-8 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Book Preview</p>

              {/* Front / back thumbnails */}
              <div className="relative mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentImage(book.cover1)}
                  aria-label="Show front cover"
                  className={`h-20 w-16 overflow-hidden rounded-md border-2 bg-white transition ${currentImage === book.cover1 ? 'border-brand-bright ring-2 ring-brand-bright/20' : 'border-transparent hover:border-brand-bright/40'}`}
                >
                  <img src={book.cover1} alt="Front Cover" className="h-full w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentImage(book.cover2 || book.cover1)}
                  aria-label="Show back cover"
                  className={`h-20 w-16 overflow-hidden rounded-md border-2 bg-white transition ${book.cover2 && currentImage === book.cover2 ? 'border-brand-bright ring-2 ring-brand-bright/20' : 'border-transparent hover:border-brand-bright/40'}`}
                >
                  {book.cover2 ? (
                    <img src={book.cover2} alt="Back Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full flex-col">
                      <span className="flex h-1/2 items-center justify-center bg-brand-ink p-1 text-center text-[8px] text-white">Full Preview</span>
                      <span className="flex h-1/2 items-center justify-center bg-white">
                        <span className="flex h-6 w-6 items-center justify-center border border-gray-300 text-[6px] text-gray-400">Barcode</span>
                      </span>
                    </span>
                  )}
                </button>
              </div>

              <div className="relative mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className={`flex items-center justify-center gap-2 rounded-full border-2 border-brand-deep/15 bg-white py-2.5 text-sm font-bold text-brand-deep transition-colors hover:border-brand-deep hover:bg-brand-deep hover:text-white ${FOCUS}`}
                >
                  <MdOutlineVisibility className="text-lg" /> Full Preview
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className={`flex items-center justify-center gap-2 rounded-full border-2 border-brand-deep/15 bg-white py-2.5 text-sm font-bold text-brand-deep transition-colors hover:border-brand-deep hover:bg-brand-deep hover:text-white ${FOCUS}`}
                >
                  <MdShare className="text-lg" /> Share
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-ink sm:text-4xl">
              {book.title}
            </h1>

            {/* Ratings */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <MdStar key={i} className={i < (book.ratings || 5) ? 'text-brand-gold' : 'text-brand-gold/40'} />
                  ))}
                </div>
                <span className="font-bold text-brand-ink">{book.ratings || '5'}.0/5</span>
                <span className="text-slate-500">(110 reviews)</span>
              </div>
              <span aria-hidden="true" className="hidden h-4 w-px bg-slate-300 sm:block" />
              <div className="flex items-center gap-1.5">
                <MdOutlineVisibility className="text-lg text-brand-bright" />
                <span className="font-bold text-brand-ink">1,243</span>
                <span className="text-slate-500">views</span>
              </div>
            </div>

            {/* Authors, ISBN, edition */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`p-5 sm:row-span-2 ${CARD}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-mist text-brand-deep">
                    <MdPeopleOutline className="text-xl" />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Authors</p>
                </div>
                <ul className="mt-4 space-y-2">
                  {authors.length > 0 ? authors.map((name, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm font-semibold text-brand-ink">
                      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-none rotate-45 rounded-[1px] bg-brand-violet" />
                      {name}
                    </li>
                  )) : (
                    <li className="text-sm font-semibold text-brand-ink">Unknown Author</li>
                  )}
                </ul>
              </div>

              <div className={`flex items-center gap-3 p-5 ${CARD}`}>
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-paper text-brand-violet">
                  <span className="text-xs font-bold tabular-nums">|||</span>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">ISBN-13</p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-ink">{book.isbn}</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-5 ${CARD}`}>
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-gold/20 text-[#8a6413]">
                  <MdOutlineBookmarkBorder className="text-xl" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Edition</p>
                  <p className="mt-0.5 text-sm font-bold text-brand-ink">{book.edition || `1st Edition, ${book.copyright || '2026'}`}</p>
                </div>
              </div>
            </div>

            {/* Price & stock */}
            <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-brand-ink via-brand-deep to-brand-violet p-6 text-white md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-extrabold">₹{book.price}</span>
                  <span className="text-sm font-medium text-white/60 line-through">₹{book.price ? Number(book.price) + 100 : '0'}</span>
                  <span className="rounded-full bg-brand-gold px-2.5 py-0.5 text-xs font-bold text-brand-ink">SAVE ₹100</span>
                </div>
                <p className="mt-1.5 text-xs text-white/75">Inclusive of all taxes • Free shipping on orders</p>
              </div>
              <div className="md:text-right">
                <p className="flex items-center gap-1.5 text-sm font-bold text-brand-goldlight md:justify-end">
                  <MdCheckCircle className="text-lg" /> {book.status || 'In Stock'} • Ready to Ship
                </p>
                <p className="mt-1 text-xs text-white/75">Delivery in 4-5 business days</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="flex w-full items-center justify-between rounded-full bg-[#25D366] px-6 py-4 font-bold text-white transition-colors hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#128C7E]"
              >
                <span className="flex items-center gap-2.5">
                  <FaWhatsapp className="text-xl" />
                  Order via WhatsApp
                </span>
                <MdArrowBack className="rotate-180 text-xl" />
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className={`flex items-center justify-center gap-2 rounded-full border-2 border-brand-deep/15 bg-white py-3 text-sm font-bold text-brand-deep transition-colors hover:border-brand-deep hover:bg-brand-deep hover:text-white ${FOCUS}`}
                >
                  <MdOutlineMenuBook /> Bulk/Institutional
                </button>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className={`flex items-center justify-center gap-2 rounded-full border-2 border-brand-violet/20 bg-white py-3 text-sm font-bold text-brand-violet transition-colors hover:border-brand-violet hover:bg-brand-violet hover:text-white ${FOCUS}`}
                >
                  <MdOutlineVisibility /> Preview Sample
                </button>
              </div>

              {book.flipkart && (
                <a
                  href={book.flipkart}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 rounded-full bg-[#2874F0] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#1f63d6]"
                >
                  <img
                    src="https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png"
                    alt="Flipkart"
                    className="h-7 w-auto"
                  />
                  Buy on Flipkart
                </a>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><MdCheckCircle className="text-[#25D366]" /> Secure WhatsApp Checkout</span>
              <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span className="flex items-center gap-1.5"><MdVerifiedUser className="text-brand-bright" /> 100% Genuine Books</span>
              <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span className="flex items-center gap-1.5"><MdArrowBack className="rotate-90 text-brand-violet" /> Easy Returns</span>
            </div>

            {/* Features */}
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {features.map(({ Icon, label, tile }) => (
                <li key={label} className={`flex flex-col items-center gap-2 p-4 text-center ${CARD}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tile}`}>
                    <Icon className="text-xl" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-brand-ink">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── About & product details ───────────────────────── */}
      <section className="bg-white py-14 lg:py-20">
        <div className={`${WRAP} grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12`}>
          <div>
            <h2 style={SERIF} className="text-3xl font-medium tracking-tight text-brand-ink sm:text-4xl">About This Book</h2>
            <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-slate-600">
              {book.about || book.features || book.description || 'No description provided for this book.'}
            </p>
          </div>

          <div className={`p-6 sm:p-8 ${CARD}`}>
            <h2 style={SERIF} className="text-2xl font-medium tracking-tight text-brand-ink">Product Details</h2>
            <dl className="mt-5 divide-y divide-brand-deep/5">
              {productDetails.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt>
                  <dd className="text-sm font-medium text-brand-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 1. Fullscreen Preview Lightbox Component */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/90 p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close preview"
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <MdClose size={24} />
          </button>
          <img
            src={currentImage || book.cover1}
            alt="Fullscreen preview"
            className="max-h-[90vh] max-w-full rounded object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 2. Order via WhatsApp Modal Component */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm" onClick={() => setIsOrderModalOpen(false)}></div>
          <div role="dialog" aria-modal="true" aria-labelledby="order-title" className="relative z-50 mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-white">
            <div className="flex items-center justify-between bg-gradient-to-r from-brand-ink via-brand-deep to-brand-violet px-6 py-4 text-white">
              <h3 id="order-title" className="text-lg font-bold">Confirm Order Details</h3>
              <button type="button" onClick={() => setIsOrderModalOpen(false)} aria-label="Close" className="text-white/70 transition hover:text-white">
                <MdClose size={22} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-deep/10 bg-brand-snow p-3">
                <img src={book.cover1} alt={book.title} className="h-16 w-12 rounded bg-white object-cover" onError={(e) => { e.target.src = "https://placehold.co/50x70?text=No+Cover" }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-brand-ink">{book.title}</p>
                  <p className="mt-0.5 text-sm font-extrabold text-brand-bright">₹{book.price}</p>
                </div>
              </div>

              <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
                <div>
                  <label htmlFor="order-name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Your Name</label>
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
                  <label htmlFor="order-location" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Delivery City / Pincode</label>
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
                  <label htmlFor="order-qty" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Quantity</label>
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

                <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-bold text-white transition hover:bg-[#1ebe5b]">
                  <span>Place Order on WhatsApp</span>
                  <FaWhatsapp size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bulk Institutional Sales Inquiry Modal Component */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm" onClick={() => setIsContactModalOpen(false)}></div>
          <div role="dialog" aria-modal="true" aria-labelledby="bulk-title" className="relative z-50 mx-auto w-full max-w-sm rounded-3xl bg-white p-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-bright to-brand-violet text-white">
              <MdBusiness size={28} />
            </div>
            <h3 id="bulk-title" style={SERIF} className="mb-1 text-2xl font-medium text-brand-ink">Institutional Inquiry</h3>
            <p className="mb-6 text-sm text-slate-500">For universities, corporate distributions, libraries, or global bulk batches, contact our management desk.</p>

            <div className="space-y-3">
              <a href="tel:+916380658876" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet py-3 font-bold text-white transition hover:-translate-y-0.5">
                <FaPhoneAlt size={16} /> Call Sales Desk
              </a>
              <a href="mailto:info@veritazinternational.com" className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-deep/15 py-2.5 font-bold text-brand-deep transition hover:border-brand-deep">
                <FaEnvelope size={16} /> Send Email Route
              </a>
            </div>
            <button type="button" onClick={() => setIsContactModalOpen(false)} className="mt-4 text-sm text-slate-400 underline transition hover:text-slate-600">
              Close Context Window
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
