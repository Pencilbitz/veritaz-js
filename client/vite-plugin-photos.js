// Responsive WebP versions of the site's own photos, made at build time.
//
// The photos in public/assets/image are masters: some are 2-3k pixels wide
// and close to a megabyte as JPEG. A page imports one with a preset:
//
//   import hero from "photo:/assets/image/services/ieee-hero-fhd.jpg?hero";
//   <img {...hero} alt="" />
//
// and gets { src, srcSet, sizes, width, height }. In a build, each preset width
// becomes a WebP file named after its content (static/img/<name>-<width>-<hash>.webp),
// so the browser downloads only the size the screen needs and can keep it for
// a year: a changed photo gets a new name. Replace a master in place as
// before; the next build makes its new versions. In dev the master is served
// as it is.
//
// vite-plugin-seo.js reads `photoManifest` to preload a page's main photo
// with the same srcset and sizes as the page's <img>, so the two match.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const PREFIX = "photo:";
const OUT_DIR = "static/img";
const CACHE_DIR = "node_modules/.cache/veritaz-photos";

/** Widths made for each preset, the WebP quality, and the `sizes` the <img>
 *  gets unless it passes its own. */
export const PRESETS = {
  // Full-bleed page heroes. Only large high-density screens take the 2560.
  hero: { widths: [640, 960, 1280, 1600, 1920, 2560], quality: 78, sizes: "100vw" },
  // Photos in one column of a two-column section; full width on phones.
  frame: { widths: [480, 720, 960, 1280], quality: 78, sizes: "(min-width: 1024px) 45vw, 100vw" },
  // Small framed photos and cut-outs (at most about 26rem wide).
  card: { widths: [320, 480, 720], quality: 78, sizes: "(min-width: 640px) 24rem, 90vw" },
  // Book covers shown at thumbnail and card sizes.
  cover: { widths: [160, 320, 480], quality: 78, sizes: "160px" },
  // The logo mark, shown from 18px to 64px.
  logo: { widths: [96, 160, 256], quality: 86, sizes: "64px" },
  // The home hero's blurred, faded library: detail is not visible, so one
  // small file covers every screen.
  backdrop: { widths: [960], quality: 55, sizes: "100vw" },
};

/** Every photo imported in this build, keyed by its import id without the
 *  prefix ("/assets/image/x.jpg?hero"). */
export const photoManifest = new Map();

const hashOf = (...parts) => {
  const h = createHash("sha256");
  for (const part of parts) h.update(part);
  return h.digest("base64url").slice(0, 8);
};

export default function photos() {
  let publicDir;
  let base = "/";
  let isBuild = false;
  let root;
  const emitted = new Set();

  async function variant(input, width, quality) {
    // Cache by master content and settings, so repeat builds skip the work.
    const cacheFile = join(root, CACHE_DIR, `${hashOf(input, `${width}:${quality}`)}.webp`);
    try {
      return await readFile(cacheFile);
    } catch {
      const out = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 5 })
        .toBuffer();
      await mkdir(join(root, CACHE_DIR), { recursive: true });
      await writeFile(cacheFile, out);
      return out;
    }
  }

  return {
    name: "veritaz-photos",
    enforce: "pre",

    configResolved(config) {
      root = config.root;
      publicDir = config.publicDir;
      base = config.base;
      isBuild = config.command === "build";
    },

    resolveId(id) {
      if (id.startsWith(PREFIX)) return `\0${id}`;
      return undefined;
    },

    async load(id) {
      if (!id.startsWith(`\0${PREFIX}`)) return undefined;
      const key = id.slice(PREFIX.length + 1);
      const [path, presetName = ""] = key.split("?");
      const preset = PRESETS[presetName];
      if (!preset) this.error(`${key}: add a preset after "?" (${Object.keys(PRESETS).join(", ")})`);

      const file = join(publicDir, decodeURIComponent(path));
      this.addWatchFile(file);
      const input = await readFile(file);
      const meta = await sharp(input).rotate().metadata();
      // .rotate() above does not change metadata(); EXIF orientations 5-8 swap the sides.
      const turned = (meta.orientation || 1) >= 5;
      const width = turned ? meta.height : meta.width;
      const height = turned ? meta.width : meta.height;

      let result;
      if (!isBuild) {
        result = { src: path, width, height };
      } else {
        const widths = [...new Set(preset.widths.map((w) => Math.min(w, width)))].sort((a, b) => a - b);
        const name = basename(path, extname(path)).replace(/[^\w-]+/g, "-");
        const files = await Promise.all(
          widths.map(async (w) => {
            const source = await variant(input, w, preset.quality);
            const fileName = `${OUT_DIR}/${name}-${w}-${hashOf(source)}.webp`;
            if (!emitted.has(fileName)) {
              emitted.add(fileName);
              this.emitFile({ type: "asset", fileName, source });
            }
            return { w, url: `${base}${fileName}` };
          })
        );
        // `src` is for anything that ignores srcset: the variant nearest 1200px.
        // A single size needs no srcset (and can be used in CSS).
        const fallback = files.reduce((a, b) => (Math.abs(b.w - 1200) < Math.abs(a.w - 1200) ? b : a));
        result =
          files.length === 1
            ? { src: fallback.url, width, height }
            : { src: fallback.url, srcSet: files.map((f) => `${f.url} ${f.w}w`).join(", "), sizes: preset.sizes, width, height };
      }
      photoManifest.set(key, result);
      return `export default ${JSON.stringify(result)};`;
    },
  };
}
