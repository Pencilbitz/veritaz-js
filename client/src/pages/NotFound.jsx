import { Link } from "react-router-dom";
import { useSeo } from "../seo/useSeo";
import { NOT_FOUND } from "../seo/site";

/** Any address the site doesn't have. Marked noindex, so a mistyped or old
 *  link isn't indexed as an empty page, and it offers the way back. */
export default function NotFound() {
  useSeo(NOT_FOUND);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4 py-20">
      <div className="max-w-md text-center">
        <p className="text-7xl font-bold text-[#3e7d89]/25" aria-hidden="true">404</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Page Not Found</h1>
        <p className="mt-4 text-gray-600">
          The page you were looking for could not be found. It may have moved, or the link may be mistyped.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-[#3e7d89] px-6 py-3 font-semibold text-white transition hover:bg-[#2f6370]">
            Back to Home
          </Link>
          <Link to="/contact" className="rounded-full border border-[#3e7d89] px-6 py-3 font-semibold text-[#3e7d89] transition hover:bg-[#3e7d89]/10">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
