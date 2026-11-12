import { useEffect } from "react";
import { headTags, ldJson } from "./site";

const PAGE_LD_ID = "vz-page-ld";

/** Points a page's head at `meta` (see site.js): title, description, canonical
 *  address, link-preview tags and the page's structured data. Updates the tags
 *  the HTML already has rather than adding more, and removes the ones this
 *  page has none of, so nothing carries over from the previous page.
 *
 *  Pass null while the page's data is still loading: the tags stay as they
 *  are, which on a first visit are already this page's, written in by the
 *  build. */
export function useSeo(meta) {
  // Compared as text so a meta object rebuilt on every render does not
  // rewrite the head each time.
  const key = meta ? JSON.stringify(meta) : "";

  useEffect(() => {
    if (!key) return;
    const page = JSON.parse(key);
    const { head } = document;

    document.title = page.title;

    for (const [tag, keyAttr, keyValue, value] of headTags(page)) {
      const valueAttr = tag === "link" ? "href" : "content";
      let el = head.querySelector(`${tag}[${keyAttr}="${keyValue}"]`);
      if (value === undefined || value === "") {
        el?.remove();
        continue;
      }
      if (!el) {
        el = document.createElement(tag);
        el.setAttribute(keyAttr, keyValue);
        head.appendChild(el);
      }
      el.setAttribute(valueAttr, value);
    }

    let ld = document.getElementById(PAGE_LD_ID);
    if (!page.jsonLd) {
      ld?.remove();
    } else {
      if (!ld) {
        ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.id = PAGE_LD_ID;
        head.appendChild(ld);
      }
      ld.textContent = ldJson(page.jsonLd);
    }
  }, [key]);
}
