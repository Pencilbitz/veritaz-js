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

const START = "<!-- seo:start -->";
const END = "<!-- seo:end -->";

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
  let isBuild = false;

  return {
    name: "veritaz-seo",

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      isBuild = config.command === "build";
    },

    transformIndexHtml(html) {
      const site = `    <script type="application/ld+json" id="vz-org-ld">${ldJson(ORGANIZATION_LD)}</script>`;
      return html.replace("<!--seo-->", `${renderHead(PAGES["/"]).trimStart()}\n${site}`);
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

      // /hr is the same page as /hr-department and canonicalises to it, so it
      // gets a file but no sitemap entry.
      const fixed = Object.entries(PAGES).map(([route, meta]) => ({ ...meta, route }));
      const dynamic = (await dynamicPages(env, warn)).map((meta) => ({ ...meta, route: meta.path }));

      let written = 0;
      for (const page of [...fixed, ...dynamic]) {
        if (page.route === "/" || !SAFE_PATH.test(page.route)) continue;
        const html = template.slice(0, start) + renderHead(page).trimStart() + template.slice(end);
        const file = join(outDir, ...page.route.split("/").filter(Boolean), "index.html");
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, html);
        written += 1;
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
