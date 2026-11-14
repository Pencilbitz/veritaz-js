// Helpers for reading the page's layout without making the browser lay it out
// early. Reading a size or position (offsetWidth, scrollLeft,
// getBoundingClientRect) straight after React has changed the page forces a
// synchronous layout in the middle of the work; these wait until the browser
// has done that layout anyway, or avoid reading it at all.
import { useEffect, useState } from "react";

/** Runs `fn` once the browser has laid out and painted the next frame, when
 *  reading positions costs no extra layout. Returns a cancel function, so it
 *  can be returned from an effect. */
export function afterPaint(fn) {
  let timer;
  const frame = requestAnimationFrame(() => {
    timer = setTimeout(fn, 0);
  });
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
  };
}

/** For a horizontally scrolling row: whether it is at its start and at its
 *  end, to turn its arrow buttons off. Watches whether the first and last
 *  items are fully in view (an IntersectionObserver), so it needs no layout
 *  reads and follows scrolling, swiping and resizing on its own. `deps` are
 *  whatever changes the row's items. */
export function useRowEdges(rowRef, deps) {
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const row = rowRef.current;
    const first = row?.firstElementChild;
    const last = row?.lastElementChild;
    if (!first || !last) return undefined;
    const inView = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inView.set(entry.target, entry.intersectionRatio >= 0.98);
        setEdge((prev) => {
          const start = inView.get(first) ?? prev.start;
          const end = inView.get(last) ?? prev.end;
          return prev.start === start && prev.end === end ? prev : { start, end };
        });
      },
      { root: row, threshold: [0, 0.98] }
    );
    observer.observe(first);
    observer.observe(last);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller lists what changes the items
  }, deps);

  return edge;
}
