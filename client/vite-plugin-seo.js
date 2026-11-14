// Writes each page's search and link-preview tags into real HTML.
//
// The site is a single-page app, so without this every address is served the
// same index.html and shares one title and preview. Crawlers that don't run
// JavaScript, and every link preview (WhatsApp, LinkedIn, Facebook), would see
// the home page's tags for a book or a conference.
//
// - In dev and build, index.html gets the home page's tags and the site-wide
//   organisation data in place of the <!--seo--> marker.
// - After a build, each other page gets its own copy (dist/<path>/index.html)
//   with its own tags, and dist/sitemap.xml lists every page. Books,
//   conferences and events are read from Supabase with the public anon key;
//   if that fails the build still succeeds, those pages fall back to the app's
//   index.html (the page fixes its tags once it loads), and the sitemap lists
//   the fixed pages only.
// - Each page's file also starts loading what that page needs before the
//   app's code has run: the page's own script and stylesheet (otherwise
//   requested only once the app works out which page it is on) and its main
//   picture, the `lcp` in its metadata, with the same srcset and sizes as the
//   page's <img>.
// - Addresses with no file of their own (missing pages, and the few the rule
//   above leaves to the app) are served dist/app.html (see vercel.json): the
//   home page's tags, without the home page's preloads.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  ORGANIZATION_LD,
  PAGES,
  absoluteUrl,
  bookMeta,
  conferenceMeta,
  eventMeta,
  headTags,
  ldJson,
} from "./src/seo/site.js";
import { mediaImg } from "./src/lib/media.js";
import { photoManifest } from "./vite-plugin-photos.js";

const START = "<!-- seo:start -->";
const END = "<!-- seo:end -->";
const PRELOADS = "<!--route-preloads-->";

/** Which page each address shows (as in App.jsx's routes), so that page's
 *  script and stylesheet can load alongside the HTML. The home page is part
 *  of the main script. */
const ROUTE_PAGES = [
  [/^\/our-company$/, "OurCompany"],
  [/^\/services$/, "Services"],
  [/^\/services\//, "ServiceDetail"],
  [/^\/events$/, "Events"],
  [/^\/upcoming-events\//, "UpcomingEvents"],
  [/^\/book-store$/, "BookStore"],
  [/^\/books\//, "BookDetails"],
  [/^\/book-publishing$/, "BookPublishing"],
  [/^\/contact$/, "Contacts"],
  [/^\/(hr|hr-department)$/, "HRDepartment"],
  [/^\/careers$/, "Careers"],
  [/^\/conferences\//, "Conference"],
];

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeText = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The per-page block of head tags, between markers so a build can swap it. */
function renderHead(meta) {
  const lines = [`<title>${escapeText(meta.title)}</title>`];
  for (const [tag, keyAttr, keyValue, value] of headTags(meta)) {
    if (value === undefined || value === "") continue;
    const valueAttr = tag === "link" ? "href" : "content";
    lines.push(`<${tag} ${keyAttr}="${keyValue}" ${valueAttr}="${escapeAttr(value)}" />`);
  }
  if (meta.jsonLd) lines.push(`<script type="application/ld+json" id="vz-page-ld">${ldJson(meta.jsonLd)}</script>`);
  return [START, ...lines, END].map((line) => `    ${line}`).join("\n");
}

/** The preload for a page's main picture: `lcp` is { photo } (a `photo:`
 *  import's id, see vite-plugin-photos.js) or { media, preset } (a Supabase
 *  picture and its MEDIA preset in src/lib/media.js), plus `sizes` when the
 *  page's <img> sets its own. */
function lcpPreload(page, warn) {
  const { lcp } = page;
  if (!lcp) return null;
  let img;
  if (lcp.photo) {
    img = photoManifest.get(lcp.photo);
    if (!img) {
      warn(`${page.route}: its lcp photo "${lcp.photo}" is not imported anywhere as "photo:${lcp.photo}", so it is not preloaded.`);
      return null;
    }
  } else if (lcp.media) {
    img = mediaImg(lcp.media, lcp.preset);
  }
  if (!img?.src) return null;
  const attrs = [`rel="preload"`, `as="image"`, `href="${escapeAttr(img.src)}"`];
  if (img.srcSet) attrs.push(`imagesrcset="${escapeAttr(img.srcSet)}"`, `imagesizes="${escapeAttr(lcp.sizes || img.sizes)}"`);
  attrs.push(`fetchpriority="high"`);
  return `<link ${attrs.join(" ")} />`;
}

/** Puts a page's preloads into its HTML: the main picture and the page's
 *  scripts where index.html marks them, its stylesheets after the app's own
 *  (the order the app would add them in). */
function withPreloads(html, page, pageAssets, base, warn) {
  const head = [];
  const styles = [];
  const picture = lcpPreload(page, warn);
  if (picture) head.push(picture);
  const name = ROUTE_PAGES.find(([pattern]) => pattern.test(page.route))?.[1];
  const assets = name && pageAssets.get(name);
  if (name && !assets) warn(`${page.route}: no script found for the ${name} page, so it is not preloaded.`);
  if (assets) {
    for (const file of assets.js) head.push(`<link rel="modulepreload" crossorigin href="${base}${file}">`);
    for (const file of assets.css) styles.push(`<link rel="stylesheet" crossorigin href="${base}${file}">`);
  }
  return html
    .replace(PRELOADS, head.join("\n    "))
    .replace("</head>", `${styles.map((s) => `  ${s}\n`).join("")}</head>`);
}

/** Only plain ASCII paths become files. A path like "icgmrft-–-2026" stays
 *  with the app's fallback rather than relying on how the host decodes a
 *  non-ASCII file name; it is still listed in the sitemap. */
const SAFE_PATH = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;

async function fetchRows(env, query) {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${query}`, {
    headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`${query.split("?")[0]}: HTTP ${res.status}`);
  return res.json();
}

/** The cover on the Book Store's first card, fetched just as the store fetches
 *  its list (In Stock books, in the database's own order, which the store
 *  shows as it comes), so the store's HTML can preload it. If a book is edited
 *  after a build the database may list another one first; until the next
 *  build the preload then goes unused and the page loads as it would without
 *  it. */
async function storeFirstCover(env, warn) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return undefined;
  try {
    const [first] = await fetchRows(env, "veritaz_books?select=cover1&status=eq.In%20Stock&limit=1");
    return first?.cover1 || undefined;
  } catch (err) {
    warn(`Could not read the Book Store's first cover (${err.message}); it is not preloaded.`);
    return undefined;
  }
}

/** Books (not drafts), public conferences and events, as page metadata. */
async function dynamicPages(env, warn) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    warn("Supabase environment variables are missing; book, conference and event pages are not prerendered.");
    return [];
  }
  try {
    const [books, conferences, events] = await Promise.all([
      fetchRows(env, "veritaz_books?select=id,title,authors,isbn,edition,about,price,status,language,binding,pages,cover1&order=id"),
      fetchRows(env, "veritaz_conferences?select=id,conferencename,conferencetitle,about,poster,conferencesecurity&order=id"),
      fetchRows(env, "veritaz_events?select=id,topic,college_name,date_text,location,poster&order=id"),
    ]);
    return [
      ...books.filter((b) => b.title && !/draft/i.test(b.status || "")).map(bookMeta),
      ...conferences
        .filter((c) => (c.conferencename || "").trim() && !/private/i.test(c.conferencesecurity || ""))
        .map(conferenceMeta),
      ...events.map(eventMeta),
    ];
  } catch (err) {
    warn(`Could not read books, conferences and events from Supabase (${err.message}); they are not prerendered.`);
    return [];
  }
}

export default function seo({ env }) {
  let outDir;
  let base = "/";
  let isBuild = false;
  // Page name -> { js, css }: the files its lazy-loaded code needs beyond
  // what the main script already loads.
  let pageAssets = new Map();

  return {
    name: "veritaz-seo",

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      base = config.base;
      isBuild = config.command === "build";
    },

    transformIndexHtml(html) {
      const site = `    <script type="application/ld+json" id="vz-org-ld">${ldJson(ORGANIZATION_LD)}</script>`;
      return html.replace("<!--seo-->", `${renderHead(PAGES["/"]).trimStart()}\n${site}`);
    },

    // The bundle as written: by now Vite has dropped the empty script it makes
    // for a stylesheet shared by two pages (hr.css), which must not be preloaded.
    writeBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter((item) => item.type === "chunk");
      const byFile = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
      const withImports = (file, seen = new Set()) => {
        if (seen.has(file)) return seen;
        seen.add(file);
        for (const dep of byFile.get(file)?.imports || []) withImports(dep, seen);
        return seen;
      };
      const cssOf = (files) => new Set([...files].flatMap((f) => [...(byFile.get(f)?.viteMetadata?.importedCss || [])]));

      const entry = chunks.find((chunk) => chunk.isEntry);
      const mainJs = entry ? withImports(entry.fileName) : new Set();
      const mainCss = cssOf(mainJs);
      pageAssets = new Map();
      for (const chunk of chunks) {
        const page = chunk.isDynamicEntry && /[\\/]src[\\/]pages[\\/](\w+)\.jsx$/.exec(chunk.facadeModuleId || "");
        if (!page) continue;
        const js = withImports(chunk.fileName);
        pageAssets.set(page[1], {
          js: [...js].filter((f) => !mainJs.has(f)),
          css: [...cssOf(js)].filter((f) => !mainCss.has(f)),
        });
      }
    },

    async closeBundle() {
      if (!isBuild) return;
      const warn = (message) => (typeof this.warn === "function" ? this.warn(message) : console.warn(`[veritaz-seo] ${message}`));
      const template = await readFile(join(outDir, "index.html"), "utf8");
      const start = template.indexOf(START);
      const end = template.indexOf(END) + END.length;
      if (start < 0 || end < start) {
        warn("SEO markers not found in dist/index.html; pages were not prerendered.");
        return;
      }

      // Addresses without a file of their own get the home page's tags and no
      // page preloads.
      await writeFile(join(outDir, "app.html"), template.replace(PRELOADS, "").replace(/\n[ \t]*\n/g, "\n"));

      // /hr is the same page as /hr-department and canonicalises to it, so it
      // gets a file but no sitemap entry.
      const fixed = Object.entries(PAGES).map(([route, meta]) => ({ ...meta, route }));
      const dynamic = (await dynamicPages(env, warn)).map((meta) => ({ ...meta, route: meta.path }));
      // The Book Store's main picture is its first card's cover (the card's
      // <img> uses the same "cover" preset).
      const firstCover = await storeFirstCover(env, warn);
      const store = fixed.find((page) => page.route === "/book-store");
      if (firstCover && store) store.lcp = { media: firstCover, preset: "cover" };

      let written = 0;
      for (const page of [...fixed, ...dynamic]) {
        if (page.route !== "/" && !SAFE_PATH.test(page.route)) continue;
        const tagged = page.route === "/" ? template : template.slice(0, start) + renderHead(page).trimStart() + template.slice(end);
        const html = withPreloads(tagged, page, pageAssets, base, warn);
        const file = join(outDir, ...page.route.split("/").filter(Boolean), "index.html");
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, html);
        if (page.route !== "/") written += 1;
      }

      const urls = [...new Set([...fixed, ...dynamic].filter((p) => p.route === p.path).map((p) => absoluteUrl(p.path)))];
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((url) => `  <url><loc>${escapeText(url)}</loc></url>`),
        "</urlset>",
        "",
      ].join("\n");
      await writeFile(join(outDir, "sitemap.xml"), sitemap);

      console.log(`[veritaz-seo] prerendered ${written} pages; sitemap lists ${urls.length} addresses`);
    },
  };
}
