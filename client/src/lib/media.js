// Pictures stored in Supabase Storage (book covers, event and conference
// posters, portraits) are uploaded at full size, often as PNGs of 0.3-1 MB.
// Supabase's image endpoint serves the same file resized, and as WebP to
// browsers that accept it, so a cover shown 150px wide costs about 25 KB
// instead of 850 KB.
//
// Plain functions with no React, because the build (vite-plugin-seo.js via
// seo/site.js) uses them too: a page's main picture is preloaded with exactly
// the srcset and sizes its <img> asks for.

const OBJECT = "/storage/v1/object/public/";
const RENDER = "/storage/v1/render/image/public/";
const RESIZABLE = /\.(png|jpe?g|webp)$/i;

/** Widths and `sizes` for each place a stored picture is shown. Pages share
 *  presets where they can, so a cover fetched on one page is reused from the
 *  cache on the next. A preset with one width gives a plain src with no
 *  srcset: for pictures sized by their own proportions (w-auto), where a
 *  srcset would change the size they are drawn at. */
export const MEDIA = {
  // Covers on the home page (3D press, book fan, shelf) and Book Store cards:
  // never more than 190px wide.
  cover: { widths: [240, 360, 480], sizes: "190px" },
  // The book page's 3D book (210-280px wide).
  coverLarge: { widths: [360, 480, 640], sizes: "(min-width: 640px) 280px, 210px" },
  // A book's full wrap (back, spine, front): the 3D book's back and spine.
  coverWrap: { widths: [1280] },
  // Small thumbnails (up to 4rem).
  thumb: { widths: [120, 240], sizes: "64px" },
  // Event posters in cards (three across on wide screens).
  posterCard: { widths: [480, 720, 960], sizes: "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" },
  // An event's poster beside the page's text.
  posterLarge: { widths: [480, 720, 960, 1280], sizes: "(min-width: 1024px) 45vw, 100vw" },
  // A conference's poster in its hero, drawn at its own proportions (at most
  // about 650 x 576), so one size that is never smaller than that box.
  posterHero: { widths: [1200] },
  // Round portraits on the home page (up to 56px).
  avatar: { widths: [120, 180], sizes: "56px" },
  // Speakers' photos (up to 12rem).
  portrait: { widths: [240, 400], sizes: "192px" },
};

/** True for a Supabase Storage picture the image endpoint can resize. */
export const isResizable = (url) => typeof url === "string" && url.includes(OBJECT) && RESIZABLE.test(url.split("?")[0]);

/** The URL of `url` resized to `width` (keeping its proportions). Anything
 *  that is not a resizable Supabase picture is returned unchanged. */
export function mediaUrl(url, width, quality = 75) {
  if (!isResizable(url)) return url;
  let u;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  u.pathname = u.pathname.replace(OBJECT, RENDER);
  u.searchParams.set("width", String(width));
  // Without this the endpoint crops to the width instead of scaling.
  u.searchParams.set("resize", "contain");
  u.searchParams.set("quality", String(quality));
  return u.href;
}

/** <img> attributes for a stored picture shown as `preset` (a MEDIA key):
 *  src, srcSet and sizes. Spread onto the <img>, after which an `onError`
 *  should go through `retryOriginal`. */
export function mediaImg(url, preset) {
  const { widths, sizes } = MEDIA[preset];
  if (!isResizable(url)) return { src: url };
  if (widths.length === 1) return { src: mediaUrl(url, widths[0]) };
  return {
    src: mediaUrl(url, widths[Math.min(1, widths.length - 1)]),
    srcSet: widths.map((w) => `${mediaUrl(url, w)} ${w}w`).join(", "),
    sizes,
  };
}

/** An onError handler for a resized picture: if the resized copy fails (the
 *  image service is down, say), load the original file once; if that fails
 *  too, hand over to `fallback` (the page's placeholder), if any. */
export function retryOriginal(original, fallback) {
  return (event) => {
    const img = event.currentTarget;
    if (isResizable(original) && !img.dataset.original) {
      img.dataset.original = "1";
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.src = original;
      return;
    }
    if (fallback) fallback(event);
  };
}
