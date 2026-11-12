import { Pill, Rule } from "../components/PressUI";
import { WRAP } from "../components/pressLayout";
import { useSeo } from "../seo/useSeo";
import { NOT_FOUND } from "../seo/site";

/** Any address the site doesn't have. Marked noindex, so a mistyped or old
 *  link isn't indexed as an empty page, and it offers the way back. */
export default function NotFound() {
  useSeo(NOT_FOUND);

  return (
    <main className="vz-hero-v2 flex min-h-[calc(100svh-7.6rem)] items-center">
      <div className={`${WRAP} py-20 text-center`}>
        <Rule className="justify-center" />
        <p className="mt-6 font-display text-7xl font-bold text-sf-indigo/20 sm:text-8xl" aria-hidden="true">404</p>
        <h1 className="mt-2 text-[2rem] leading-tight text-vz-ink sm:text-[2.5rem]">Page Not Found</h1>
        <p className="mx-auto mt-4 max-w-md text-center text-base leading-relaxed text-slate-600">
          The page you were looking for could not be found. It may have moved, or the link may be mistyped.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Pill to="/" arrow>Back to Home</Pill>
          <Pill to="/contact" variant="outline">Contact Us</Pill>
        </div>
      </div>
    </main>
  );
}
