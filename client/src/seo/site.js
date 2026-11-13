// Search and link-preview metadata for every page, in one place.
//
// Plain data and functions with no React or browser code, because two things
// read it: the pages, through useSeo(), which update the head as visitors move
// around the app; and the build (vite-plugin-seo.js), which writes the same
// tags into each page's HTML file and builds sitemap.xml. Crawlers and link
// previews (WhatsApp, LinkedIn, Facebook) read that HTML without running any
// JavaScript, so the two have to agree.

export const SITE_URL = "https://www.veritazinternational.com";
export const SITE_NAME = "Veritaz International Press";

const DEFAULT_IMAGE = "/og-image.jpg";
const DEFAULT_IMAGE_ALT = "Veritaz International Press: Where Great Writing Becomes a Printed Reality";
const LOGO = "/assets/image/veritaz-logo.webp";
const EMAIL = "info@veritazinternational.com";
const PHONE = "+91-6380658876";
const SOCIALS = [
  "https://www.linkedin.com/in/veritaz-international-press/",
  "https://www.facebook.com/profile.php?id=61583778217764",
  "https://www.instagram.com/veritazinternationalpress/",
];

/** An absolute URL on the site. Leaves absolute URLs (book covers) alone and
 *  percent-encodes anything a URL can't carry raw, like the en dash in a
 *  conference name. */
export const absoluteUrl = (path) => new URL(path, SITE_URL).href;

/** Stray quotes and doubled spaces appear in some titles and author lists. */
const clean = (text) =>
  String(text ?? "")
    .replace(/\s+/g, " ")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .trim();

/** Shortens text to a search-snippet length, ending on a whole word. */
const snippet = (text, max = 158) => {
  const t = clean(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.-]+$/, "")}…`;
};

const slugify = (text) =>
  clean(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Book links: readable words then the id. The book page finds a book by the
 *  id after the last hyphen, so older links with other wording still open. */
export const bookPath = (book) => `/books/${slugify(book.title) || "book"}-${book.id}`;

/** Conference links. Must match the Navbar's links and how the Conference page
 *  looks a conference up, so it keeps their exact format. */
export const confPath = (conf) =>
  `/conferences/${(conf.conferencename || conf.conferenceName || "").replace(/\s+/g, "-").toLowerCase()}`;

export const eventPath = (event) => `/upcoming-events/${event.id}`;

/** Site-wide structured data: who publishes the site, for every page. */
export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "Veritaz International",
      url: `${SITE_URL}/`,
      logo: absoluteUrl(LOGO),
      email: EMAIL,
      telephone: PHONE,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: EMAIL,
        telephone: PHONE,
        areaServed: "IN",
        availableLanguage: ["English"],
      },
      sameAs: SOCIALS,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

/** The fixed pages, keyed by route. `path` is the address search engines are
 *  told to use, so /hr points at /hr-department rather than competing with it. */
export const PAGES = {
  "/": {
    path: "/",
    title: "Book Publishing Company in India | Veritaz International",
    description:
      "Veritaz International is a trusted book publishing company in India and academic book publishers in Coimbatore for textbooks, research books and journals.",
    keywords:
      "Book Publishing Company in India, Academic Book Publishers in Coimbatore, Textbook Publishing India, Patent Filing Services, ISBN Registration, Copyright Services, Veritaz International Press, Academic Publishing",
  },
  "/our-company": {
    path: "/our-company",
    title: "Academic Publishing Company in India | Veritaz International",
    description:
      "Veritaz International is an academic publishing company in India and book publishing company in Coimbatore for textbooks, ISBN, patents and copyrights.",
    keywords:
      "Academic Publishing Company in India, Book Publishing Company in Coimbatore, about Veritaz International, textbook publisher India, research support services, ISBN registration company, patent and copyright services India",
  },
  "/book-store": {
    path: "/book-store",
    title: "Academic Books Online India | Veritaz International",
    description:
      "Buy academic books online in India from Veritaz International. Shop ISBN college textbooks in Coimbatore for engineering, research, AI and technology.",
    keywords:
      "Academic Books Online India, College Textbooks in Coimbatore, online bookstore Veritaz, buy academic books, research publications, textbook store India, peer-reviewed books online, order scholarly publications",
  },
  "/book-publishing": {
    path: "/book-publishing",
    title: "Book Publication Services in India | Veritaz International",
    description:
      "Book publication services in India and book publishing services in Coimbatore by Veritaz International: editing, ISBN, cover design, printing and distribution.",
    keywords:
      "Book Publication Services in India, Book Publishing Services in Coimbatore, book publishing services Veritaz, textbook publication India, academic book publishing, professional editing and ISBN, research paper and book publication, author publishing services",
  },
  "/events": {
    path: "/events",
    title: "Academic Events & Conferences | Veritaz International",
    description:
      "Explore Veritaz International's academic conferences, FDPs, workshops, seminars, and research events for students, researchers, faculty, and professionals.",
    keywords:
      "academic events, publishing workshops, research conferences, author seminars, webinar schedule, Veritaz International events, scholarly workshops India",
  },
  "/contact": {
    path: "/contact",
    title: "Book Publishers in Coimbatore | Contact Veritaz International",
    description:
      "Contact Veritaz International, book publishers in Coimbatore and academic publishers in Tamil Nadu, for book publishing, ISBN, patent and copyright support.",
    keywords:
      "Book Publishers in Coimbatore, Academic Publishers in Tamil Nadu, contact Veritaz International, publisher support, publishing inquiry, author help, academic publishing contact India, reach Veritaz team",
  },
  "/hr-department": {
    path: "/hr-department",
    title: "Employment Verification | HR Department | Veritaz International",
    description:
      "Employers, banks and background-screening agencies can request employment verification for current or former Veritaz International Press team members.",
    keywords:
      "Veritaz International employment verification, HR department, background verification, employee verification request, Veritaz International Press HR",
  },
  "/careers": {
    path: "/careers",
    title: "Careers at Veritaz International Press | Publishing Jobs",
    description:
      "Join Veritaz International Press. We publish academic textbooks, coordinate scholarly volumes and run international conferences, and accept applications year-round.",
    keywords:
      "Veritaz International careers, publishing jobs India, academic publishing jobs Coimbatore, editorial jobs, conference coordinator jobs, Veritaz International Press jobs",
  },
};
PAGES["/hr"] = PAGES["/hr-department"];

/** The service pages (their content is in data/services.js, which this file
 *  cannot import: it carries React icons). Slugs and names must match it. */
const SERVICE_SEO = [
  {
    slug: "textbook-publications",
    name: "Textbook Publications",
    title: "Textbook Publishing Services in India | Veritaz International",
    description:
      "Textbook publishing in India with Veritaz International: manuscript support, editing, formatting, cover design, ISBN registration and Flipkart distribution.",
    keywords:
      "Textbook Publishing Services in India, textbook publishers Coimbatore, academic textbook publication, ISBN registration, textbook editing and formatting, Flipkart book distribution, Veritaz International",
  },
  {
    slug: "patent-grant-support",
    name: "Patent Grant Support",
    title: "Patent Filing & Grant Support in India | Veritaz International",
    description:
      "Patent grant support from Veritaz International: prior art search, technical drafting, filing and office actions in India, the US, UK, Germany, Japan and more.",
    keywords:
      "Patent Filing Services in India, patent grant support, patent registration Coimbatore, prior art search, patent drafting, international patent filing, IP registration services, Veritaz International",
  },
  {
    slug: "trademarks-copyright",
    name: "Trademarks & Copyright Services",
    title: "Trademark & Copyright Registration | Veritaz International",
    description:
      "Trademark search, filing and registration, and copyright protection for books, academic papers, software and artwork, from Veritaz International.",
    keywords:
      "Trademark Registration India, Copyright Registration Services, brand clearance search, trademark filing Coimbatore, copyright for books and software, IP protection, Veritaz International",
  },
  {
    slug: "ieee-conference-publications",
    name: "IEEE Conference Publications",
    title: "IEEE Conference Paper Publication Support | Veritaz International",
    description:
      "IEEE conference publication support from Veritaz International: manuscript preparation, IEEE formatting, technical editing and research paper submission.",
    keywords:
      "IEEE Conference Publication Support, IEEE paper formatting, conference paper editing, research paper submission, top-tier conference publication, Veritaz International",
  },
  {
    slug: "edited-book-chapters",
    name: "Scopus-Indexed Book Chapters",
    title: "Scopus Indexed Book Chapter Publication | Veritaz International",
    description:
      "Publish book chapters in SCI and Scopus indexed volumes with Veritaz International: publisher selection, manuscript editing, plagiarism checks and submission.",
    keywords:
      "Scopus Indexed Book Chapter Publication, SCI indexed book chapters, edited book chapter publishing, Scopus publication support, plagiarism check, Veritaz International",
  },
  {
    slug: "academic-events",
    name: "Educational Event Management",
    title: "Academic Event Management: Conferences & FDPs | Veritaz International",
    description:
      "Veritaz International organises international conferences, faculty development programs (FDPs), workshops and seminars for colleges and institutions.",
    keywords:
      "Academic Event Management, international conference organisers India, faculty development programs, FDP organisers Coimbatore, academic workshops and seminars, Veritaz International",
  },
  {
    slug: "professional-upskilling",
    name: "Professional Upskilling Services",
    title: "Professional Upskilling Programs | Veritaz International",
    description:
      "Upskilling programs for educators and working professionals from Veritaz International, building technical knowledge, domain skills and professional efficiency.",
    keywords:
      "Professional Upskilling Programs, faculty upskilling, training for educators, professional development courses India, skill development programs, Veritaz International",
  },
];

const breadcrumbs = (...crumbs) => ({
  "@type": "BreadcrumbList",
  itemListElement: [["Home", "/"], ...crumbs].map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: absoluteUrl(path),
  })),
});

PAGES["/services"] = {
  path: "/services",
  title: "Publishing, Patent & Academic Services | Veritaz International",
  description:
    "Veritaz International offers textbook publishing, patent and trademark filing, IEEE and Scopus publication support, academic events and upskilling programs.",
  keywords:
    "Veritaz International services, textbook publishing India, patent filing services, trademark and copyright registration, IEEE conference publication, Scopus book chapters, academic event management, professional upskilling",
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Services from Veritaz International Press",
        itemListElement: SERVICE_SEO.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.name,
          url: absoluteUrl(`/services/${s.slug}`),
        })),
      },
      breadcrumbs(["Services", "/services"]),
    ],
  },
};

for (const s of SERVICE_SEO) {
  const path = `/services/${s.slug}`;
  PAGES[path] = {
    path,
    title: s.title,
    description: s.description,
    keywords: s.keywords,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "@id": `${absoluteUrl(path)}#service`,
          name: s.name,
          serviceType: s.name,
          description: s.description,
          url: absoluteUrl(path),
          provider: { "@id": `${SITE_URL}/#organization` },
          areaServed: "IN",
        },
        breadcrumbs(["Services", "/services"], [s.name, path]),
      ],
    },
  };
}

/** Missing pages: kept out of search results. */
export const NOT_FOUND = {
  title: `Page Not Found | ${SITE_NAME}`,
  description: "The page you were looking for could not be found.",
  noindex: true,
};

/** Author lists are typed by hand, separated by commas or "|", sometimes with
 *  degrees after a name ("Prof.C.Suresh,M.E"). Splits on both and drops the
 *  degree fragments. */
const authorList = (authors) =>
  clean(authors)
    .split(/\s*[|,]\s*/)
    .map(clean)
    .filter((name) => name.length > 2 && !/^(?:m\.?\s?e|m\.?\s?tech|ph\.?\s?d|m\.?\s?sc|m\.?\s?b\.?\s?a|b\.?\s?e)\.?$/i.test(name));

const BOOK_FORMATS = { paperback: "Paperback", hardcover: "Hardcover", hardback: "Hardcover", ebook: "EBook" };

export function bookMeta(book) {
  const title = clean(book.title);
  const authors = clean(book.authors).replace(/\s*\|\s*/g, ", ");
  const path = bookPath(book);
  const url = absoluteUrl(path);
  const facts = [
    authors && `by ${authors}`,
    book.isbn && `ISBN ${book.isbn}`,
    book.pages && `${book.pages} pages`,
    clean(book.binding),
  ].filter(Boolean);
  const about = clean(book.about);
  const description = snippet(
    about.length > 60 ? about : `${title}${facts.length ? `, ${facts.join(", ")}` : ""}. Published by ${SITE_NAME}.`
  );
  const price = Number(book.price);
  const format = BOOK_FORMATS[clean(book.binding).toLowerCase()];

  return {
    path,
    title: `${title} | Veritaz International`,
    description,
    image: book.cover1 || undefined,
    imageAlt: `Cover of ${title}`,
    type: "book",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Book",
          "@id": `${url}#book`,
          name: title,
          url,
          ...(authors && { author: authorList(book.authors).map((name) => ({ "@type": "Person", name })) }),
          ...(book.isbn && { isbn: clean(book.isbn) }),
          ...(book.cover1 && { image: book.cover1 }),
          ...(about && { description: snippet(about, 500) }),
          ...(book.edition && { bookEdition: clean(book.edition) }),
          ...(Number(book.pages) > 0 && { numberOfPages: Number(book.pages) }),
          ...(book.language && { inLanguage: clean(book.language) }),
          ...(format && { bookFormat: `https://schema.org/${format}` }),
          publisher: { "@id": `${SITE_URL}/#organization` },
          ...(price > 0 && {
            offers: {
              "@type": "Offer",
              price: price.toFixed(2),
              priceCurrency: "INR",
              availability: /in stock/i.test(book.status || "") ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url,
              seller: { "@id": `${SITE_URL}/#organization` },
            },
          }),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Book Store", item: absoluteUrl("/book-store") },
            { "@type": "ListItem", position: 3, name: title, item: url },
          ],
        },
      ],
    },
  };
}

export function conferenceMeta(conf) {
  const name = clean(conf.conferencename || conf.conferenceName);
  const title = clean(conf.conferencetitle || conf.conferenceTitle);
  const heading = [name, title].filter(Boolean).join(": ");
  return {
    path: confPath(conf),
    title: `${heading || "Conference"} | Veritaz International`,
    description: snippet(
      conf.about || `${heading}, an international e-conference by ${SITE_NAME}. Dates, fees, topics, keynote speakers and registration.`
    ),
    keywords: [name, title, "international e-conference", "call for papers", "conference proceedings ISBN", "Veritaz International conferences"]
      .filter(Boolean)
      .join(", "),
    image: conf.poster || undefined,
    imageAlt: heading ? `${heading} poster` : undefined,
  };
}

export function eventMeta(event) {
  const topic = clean(event.topic || event.eventTitle);
  const college = clean(event.collegeName || event.college_name);
  const place = clean(event.location);
  const date = clean(event.date || event.date_text);
  const heading = [topic, college].filter(Boolean).join(" | ");
  const facts = `${[topic, [college, place].filter(Boolean).join(", "), date].filter(Boolean).join(". ")}.`;
  const withPublisher = `${facts} An academic event with ${SITE_NAME}.`;
  return {
    path: eventPath(event),
    title: `${heading || "Event"} | Veritaz International`,
    description: snippet(withPublisher.length <= 158 ? withPublisher : facts),
    image: event.poster || undefined,
    imageAlt: topic ? `${topic} poster` : undefined,
  };
}

/** The head tags for a page, as [tag, attributes] pairs. An attribute value of
 *  undefined means "this page has none", so the tag is removed. */
export function headTags(meta) {
  const url = meta.noindex ? undefined : absoluteUrl(meta.path || "/");
  const image = absoluteUrl(meta.image || DEFAULT_IMAGE);
  const imageAlt = meta.image ? meta.imageAlt : DEFAULT_IMAGE_ALT;
  return [
    ["meta", "name", "description", meta.description],
    ["meta", "name", "keywords", meta.keywords],
    ["meta", "name", "robots", meta.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"],
    ["link", "rel", "canonical", url],
    ["meta", "property", "og:type", meta.type || "website"],
    ["meta", "property", "og:site_name", SITE_NAME],
    ["meta", "property", "og:locale", "en_IN"],
    ["meta", "property", "og:title", meta.title],
    ["meta", "property", "og:description", meta.description],
    ["meta", "property", "og:url", url],
    ["meta", "property", "og:image", image],
    ["meta", "property", "og:image:alt", imageAlt],
    ["meta", "name", "twitter:card", "summary_large_image"],
    ["meta", "name", "twitter:title", meta.title],
    ["meta", "name", "twitter:description", meta.description],
    ["meta", "name", "twitter:image", image],
    ["meta", "name", "twitter:image:alt", imageAlt],
  ];
}

/** JSON for a <script type="application/ld+json">, safe inside HTML. */
export const ldJson = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
