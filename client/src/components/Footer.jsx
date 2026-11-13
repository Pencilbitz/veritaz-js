import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, ArrowUp, ArrowUpRight, Scissors } from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { CtaButton } from "./CtaBanner";

/* Footer: a printed sheet on the press bed. The lavender bed carries the four
   process inks along its head, soft drifting glows and faint halftone. On it
   lies a frosted white sheet framed by printer's crop marks: the brand and
   link columns, a dashed "cut here" perforation, and the contacts as coupon
   cards. The imprint line, colour bar and back-to-top sit below the sheet.

   When the footer first scrolls into view it gets [data-inview]: the inks are
   laid down, the sheet slides into place and the crop marks close in on it,
   then the columns rise in. Hover effects on every link, icon and card. All
   motion lives in index.css (ft-* classes) under
   prefers-reduced-motion: no-preference. */

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-indigo";

/* Each column carries one of the process inks from the band above. */
const columns = [
  {
    heading: "Quick Links",
    ink: "#38bdf8",
    links: [
      { to: "/", label: "Home" },
      { to: "/our-company", label: "About Us" },
      { to: "/services", label: "Our Services" },
      { to: "/events", label: "Events" },
      { to: "/book-store", label: "Book Store" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Services",
    ink: "#a78bfa",
    links: [
      { to: "/book-publishing", label: "Book Publishing" },
      { to: "/book-publishing", label: "Editing & Proofreading" },
      { to: "/book-publishing", label: "ISBN Acquisition" },
      { to: "/services/patent-grant-support", label: "Patent Services" },
      { to: "/services/trademarks-copyright", label: "Copyright Services" },
      { to: "/hr-department", label: "Employment Verification" },
    ],
  },
];

const socials = [
  {
    href: "https://www.linkedin.com/in/veritaz-international-press/",
    icon: FaLinkedinIn,
    label: "LinkedIn",
    color: "text-[#0a66c2] hover:bg-[#0a66c2]",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61583778217764",
    icon: FaFacebookF,
    label: "Facebook",
    color: "text-[#1877f2] hover:bg-[#1877f2]",
  },
  {
    href: "https://www.instagram.com/veritazinternationalpress/",
    icon: FaInstagram,
    label: "Instagram",
    color: "text-[#e4405f] hover:bg-[linear-gradient(45deg,#f58529,#dd2a7b,#8134af,#515bd4)]",
  },
];

/* `anim` names the icon's hover move: the phone rings, the envelope bobs,
   WhatsApp pops. */
const contacts = [
  {
    href: "tel:+916380658876",
    icon: Phone,
    kind: "Call us",
    label: "+91 6380658876",
    well: "bg-indigo-50 text-sf-indigo group-hover:bg-sf-indigo group-hover:text-white",
    anim: "ft-anim-ring",
  },
  {
    href: "mailto:info@veritazinternational.com",
    icon: Mail,
    kind: "Email us",
    // <wbr> lets a narrow card break the address after the @, not mid-word.
    label: (
      <>
        info@<wbr />
        veritazinternational.com
      </>
    ),
    well: "bg-violet-50 text-sf-violet group-hover:bg-sf-violet group-hover:text-white",
    anim: "ft-anim-bob",
  },
  {
    href: "https://wa.me/916380658876",
    icon: FaWhatsapp,
    kind: "WhatsApp",
    label: "Join WhatsApp",
    well: "bg-emerald-50 text-[#1da851] group-hover:bg-[#1da851] group-hover:text-white",
    anim: "ft-anim-pop",
    external: true,
  },
];

function backToTop() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

export default function Footer() {
  const ref = useRef(null);

  // Mark the footer once it first scrolls into view; CSS plays the entrance.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-inview", "");
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer ref={ref} className="vz-footer relative isolate overflow-hidden text-slate-700">
      <div className="ft-inks" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="ft-glow ft-glow--a" aria-hidden="true" />
      <div className="ft-glow ft-glow--b" aria-hidden="true" />
      <div className="ft-halftone" aria-hidden="true" />

      <div className={`${WRAP} pt-14 sm:pt-16 lg:pt-20`}>
        <div className="relative">
          <span className="ft-crops hidden sm:block" aria-hidden="true" />

          {/* The sheet */}
          <div className="ft-sheet relative rounded-[1.75rem] px-6 py-8 sm:px-10 sm:py-10 lg:rounded-[2rem] lg:px-12 lg:py-12">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-x-12">
              <div className="ft-in col-span-2 lg:col-span-1" style={{ "--i": 1 }}>
                <Link
                  to="/"
                  aria-label="Veritaz International Press, home"
                  className={`ft-brand inline-flex items-center gap-3.5 rounded-xl ${FOCUS}`}
                >
                  <span className="ft-logo flex h-14 w-14 flex-none items-center justify-center rounded-full bg-white">
                    <img src="/assets/image/veritaz-logo.webp" alt="" className="ft-logo-img h-11 w-11 object-contain" />
                  </span>
                  <span className="leading-none">
                    <span className="block font-display text-[1.75rem] font-bold tracking-[-0.01em] text-vz-ink">Veritaz</span>
                    <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-sf-indigo">
                      International Press
                    </span>
                  </span>
                </Link>
                <p className="mt-5 max-w-sm text-left text-[15px] leading-relaxed sm:text-base">
                  Empowering authors to share their <span className="ft-mark">stories</span> and knowledge with the world.
                </p>
                <div className="mt-6 flex gap-2.5">
                  {socials.map(({ href, icon: Icon, label, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className={`ft-social flex h-11 w-11 items-center justify-center rounded-full bg-white transition-colors hover:text-white ${color} ${FOCUS}`}
                    >
                      <Icon className="h-[17px] w-[17px]" />
                    </a>
                  ))}
                </div>
              </div>

              {columns.map((col, n) => (
                <nav
                  key={col.heading}
                  aria-label={col.heading}
                  className="ft-in ft-col"
                  style={{ "--i": n + 2, "--ink": col.ink }}
                >
                  <h2 className="flex items-center gap-3 text-lg text-vz-ink">
                    <span className="ft-ink" aria-hidden="true" />
                    {col.heading}
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className={`ft-link rounded text-[15px] transition-colors hover:text-sf-indigo sm:text-base ${FOCUS}`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            {/* Perforation: cut here */}
            <div className="ft-perf my-9 flex items-center gap-3 lg:my-10" aria-hidden="true">
              <Scissors className="ft-scissors h-4 w-4 flex-none text-sf-navy/40" />
              <span className="ft-perf-line h-0 flex-1 border-t-2 border-dashed border-sf-navy/20" />
            </div>

            {/* Contact coupons */}
            <div className="ft-in flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5" style={{ "--i": 4 }}>
              <h2 className="sr-only">Contact Us</h2>
              <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-1">
                {contacts.map(({ href, icon: Icon, kind, label, well, anim, external }) => (
                  <li key={href} className="min-w-0 sm:flex-auto">
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className={`ft-card group relative flex h-full items-center gap-3 rounded-2xl bg-white py-2.5 pl-2.5 pr-5 ${FOCUS}`}
                    >
                      <span className={`ft-well flex h-11 w-11 flex-none items-center justify-center rounded-xl transition-colors ${well}`}>
                        <Icon className={`h-[18px] w-[18px] ${anim}`} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{kind}</span>
                        <span className="block text-[15px] font-semibold leading-snug text-vz-ink transition-colors group-hover:text-sf-indigo">
                          {label}
                        </span>
                      </span>
                      <ArrowUpRight className="ft-card-arrow absolute right-2 top-2 h-3.5 w-3.5 text-sf-indigo" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
              <CtaButton to="/contact" className="ft-shine relative flex-none self-start overflow-hidden lg:self-auto">
                Get in Touch
              </CtaButton>
            </div>
          </div>
        </div>

        {/* Imprint line, with a printer's colour bar and back to top */}
        <div
          className="ft-in flex flex-col-reverse gap-5 py-7 sm:flex-row sm:items-center sm:justify-between lg:py-8"
          style={{ "--i": 5 }}
        >
          <p className="text-left text-sm text-slate-700">
            &copy; {new Date().getFullYear()} Veritaz International Press. All rights reserved.
          </p>
          <div className="flex items-center justify-between gap-7 sm:justify-end">
            <span className="ft-colourbar" aria-hidden="true">
              <span className="ft-reg" />
              <i style={{ "--j": 0 }} />
              <i style={{ "--j": 1 }} />
              <i style={{ "--j": 2 }} />
              <i style={{ "--j": 3 }} />
              <span className="ft-reg" />
            </span>
            <button
              type="button"
              onClick={backToTop}
              className={`group/top inline-flex items-center gap-2.5 rounded-full text-sm font-semibold text-vz-ink transition-colors hover:text-sf-indigo ${FOCUS}`}
            >
              Back to top
              <span className="ft-top flex h-10 w-10 items-center justify-center rounded-full bg-white group-hover/top:bg-sf-indigo group-hover/top:text-white">
                <ArrowUp className="ft-top-arrow h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
