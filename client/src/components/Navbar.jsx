import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, ChevronDown, ArrowUpRight, ShieldCheck, Briefcase } from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { supabase } from "../lib/supabase";

/* Navbar: a dark contact strip that scrolls away, then a white bar that lifts
   into a floating pill once the page scrolls. A highlight slides between the
   links: indigo-violet on the current page, gold on the link under the
   pointer. On phones, a full-screen white menu. The vz-nav* and vz-menu*
   styles live in index.css. */

const PHONE_DISPLAY = "+91 6380658876";
const PHONE_HREF = "tel:+916380658876";
const EMAIL = "info@veritazinternational.com";
const MAIL_HREF = `mailto:${EMAIL}?subject=Enquiry%20from%20Website`;
const WHATSAPP_HREF = "https://wa.me/916380658876";

const socials = [
  { href: "https://www.linkedin.com/in/veritaz-international-press/", icon: FaLinkedinIn, label: "LinkedIn" },
  { href: "https://www.facebook.com/profile.php?id=61583778217764", icon: FaFacebookF, label: "Facebook" },
  { href: "https://www.instagram.com/veritazinternationalpress/", icon: FaInstagram, label: "Instagram" },
];

// Events is hidden from navigation - add { to: "/events", label: "Events" }
// after "Our Company" to restore it. The /events route and event detail pages
// still resolve, so links already shared keep working, and the admin still
// manages events.
const primaryLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/our-company", label: "Our Company" },
  { to: "/book-store", label: "Book Store" },
  { to: "/book-publishing", label: "Publishing" },
];

// HR Department is a dropdown because its two destinations are read by two
// different visitors - an employer running a background check and a job
// applicant - so each gets a one-line hint. The HRMS staff portal is
// deliberately not here; it is reachable from the HR Department page.
const hrLinks = [
  { to: "/hr-department", label: "Employment Verification", hint: "For employers & agencies", icon: ShieldCheck },
  { to: "/careers", label: "Careers", hint: "Open roles & applications", icon: Briefcase },
];

const confNameOf = (conf) => conf.conferencename || conf.conferenceName || "";
const confSlugOf = (conf) => confNameOf(conf).replace(/\s+/g, "-").toLowerCase();

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-10";
const ROUND_BUTTON =
  "flex h-10 w-10 items-center justify-center rounded-full bg-sf-mist ring-1 ring-vz-line transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-indigo";

function Logo() {
  return (
    <Link
      to="/"
      className="flex flex-shrink-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-indigo"
      aria-label="Veritaz International Press, home"
    >
      <span className="vz-nav-logo flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white">
        <img src="/assets/image/veritaz-logo.webp" alt="" className="h-9 w-9 object-contain" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.35rem] font-bold tracking-[-0.01em] text-vz-ink">Veritaz</span>
        <span className="mt-1 block whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.22em] text-sf-indigo">
          International Press
        </span>
      </span>
    </Link>
  );
}

/** Desktop dropdown. Opens on hover and on keyboard focus (focus-within), so
 *  it works without a mouse. The panel's top padding bridges the gap below
 *  the tray, so the pointer can travel down to it without closing it. */
function DesktopDropdown({ label, active, width, align = "left-1/2 -translate-x-1/2", onEnter, children }) {
  return (
    <div className="group/dd relative">
      <button
        type="button"
        className="vz-nav-link"
        data-active={active || undefined}
        aria-haspopup="true"
        onMouseEnter={onEnter}
        onFocus={onEnter}
      >
        {label}
        <ChevronDown className="h-4 w-4 opacity-70 transition-transform duration-200 group-hover/dd:rotate-180 group-focus-within/dd:rotate-180" />
      </button>
      <div
        className={`absolute top-full ${align} ${width} invisible z-50 translate-y-2 pt-5 opacity-0 transition-all duration-200 group-hover/dd:visible group-hover/dd:translate-y-0 group-hover/dd:opacity-100 group-focus-within/dd:visible group-focus-within/dd:translate-y-0 group-focus-within/dd:opacity-100`}
      >
        <div className="vz-nav-panel overflow-hidden rounded-2xl">{children}</div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Conference and HR each need their own flag: one shared boolean would open
  // and close both accordions together, and the mobile panel stacks them.
  const [isConfOpen, setIsConfOpen] = useState(false);
  const [isHrOpen, setIsHrOpen] = useState(false);
  const [conferences, setConferences] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const trayRef = useRef(null);
  const pillRef = useRef(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsConfOpen(false);
    setIsHrOpen(false);
  };

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const { data, error } = await supabase.from("veritaz_conferences").select("*");
        if (error) throw error;
        setConferences(data || []);
      } catch (error) {
        console.error("Failed to fetch conferences:", error);
        setConferences([]);
      }
    };
    fetchConferences();
  }, []);

  // Links are client-side, so a new page needs what a full load used to give it
  // for free: the mobile panel closed and the scroll position back at the top.
  // The panel is reset while rendering (React's pattern for resetting state
  // when a value changes); the scroll and focus are reset in the effect.
  // Dropping focus also closes a desktop dropdown that is held open by the
  // link just clicked inside it.
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    closeMenu();
  }
  useEffect(() => {
    window.scrollTo(0, 0);
    document.activeElement?.blur?.();
  }, [location.pathname]);

  // Once the 40px contact strip has scrolled away and the bar is pinned to
  // the top, it lifts into a floating pill.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The sliding highlight is positioned straight on the DOM: it follows the
  // pointer, so re-rendering the whole bar on every hover would be wasteful.
  const movePill = useCallback((el) => {
    const tray = trayRef.current;
    const pill = pillRef.current;
    if (!tray || !pill) return;
    if (!el) {
      pill.style.opacity = "0";
      tray.removeAttribute("data-hovering");
      return;
    }
    const t = tray.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    // On the current page the highlight is indigo; on any other link it turns
    // gold, and the tray is marked so the current link's text stays readable
    // without the highlight under it.
    const current = el.matches('[aria-current="page"], [data-active]');
    pill.dataset.mode = current ? "current" : "hover";
    tray.toggleAttribute("data-hovering", !current);
    pill.style.opacity = "1";
    pill.style.width = `${r.width}px`;
    pill.style.transform = `translateX(${r.left - t.left}px)`;
  }, []);

  const resetPill = useCallback(() => {
    movePill(trayRef.current?.querySelector('[aria-current="page"], [data-active]'));
  }, [movePill]);

  const onItemEnter = (e) => movePill(e.currentTarget);

  // Re-measure when the tray changes size (breakpoints, web font arriving),
  // and only turn the slide animation on after the first placement, so the
  // pill does not sweep in from the left edge on page load.
  useEffect(() => {
    const tray = trayRef.current;
    if (!tray) return undefined;
    resetPill();
    const observer = new ResizeObserver(resetPill);
    observer.observe(tray);
    document.fonts?.ready.then(resetPill);
    const frame = requestAnimationFrame(() => tray.setAttribute("data-ready", ""));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [resetPill]);

  const confActive = location.pathname.startsWith("/conferences/");
  const hrActive = hrLinks.some((l) => location.pathname.startsWith(l.to)) || location.pathname === "/hr";

  useEffect(() => {
    resetPill();
  }, [location.pathname, confActive, hrActive, resetPill]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      closeMenu();
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  // Running number for the mobile menu rows (01, 02, ...).
  const number = (i) => String(i + 1).padStart(2, "0");

  return (
    <>
      {/* ================= CONTACT STRIP (scrolls away) =================
          Deep teal, a colour used nowhere else on the site, so the header
          reads apart from the page. The teal stays in the darker range
          (#0f766e to #115e59) so white 13px text keeps at least 4.5:1;
          icons are gold, and links and buttons turn gold on hover. */}
      <div className="border-b border-white/10 bg-[linear-gradient(90deg,#0f766e,#0d7a70_50%,#115e59)] text-[13px] text-white">
        <div className={`${WRAP} flex h-10 items-center justify-between gap-4`}>
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <a href={PHONE_HREF} className="flex items-center gap-2 whitespace-nowrap transition-colors hover:text-amber-300">
              <Phone className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span className="tabular-nums">{PHONE_DISPLAY}</span>
            </a>
            <span className="hidden h-3.5 w-px bg-white/25 sm:block" aria-hidden="true" />
            <a href={MAIL_HREF} className="hidden min-w-0 items-center gap-2 transition-colors hover:text-amber-300 sm:flex">
              <Mail className="h-3.5 w-3.5 flex-shrink-0 text-amber-300" aria-hidden="true" />
              <span className="truncate">{EMAIL}</span>
            </a>
            <span className="hidden h-3.5 w-px bg-white/25 md:block" aria-hidden="true" />
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 whitespace-nowrap transition-colors hover:text-amber-300 md:flex"
            >
              <FaWhatsapp className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <span className="mr-1.5 hidden text-[11px] font-bold uppercase tracking-[0.2em] text-white/85 lg:inline">Follow us</span>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat on WhatsApp"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-amber-400 hover:text-sf-navy md:hidden"
            >
              <FaWhatsapp className="h-3.5 w-3.5" />
            </a>
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-amber-400 hover:text-sf-navy"
              >
                <Icon className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MAIN BAR (sticky) ================= */}
      <header className="vz-nav" data-scrolled={scrolled || undefined}>
        <div className="vz-nav-island">
          <div className="vz-nav-inner flex items-center justify-between gap-4">
            <Logo />

            {/* ================= DESKTOP LINKS ================= */}
            <nav
              ref={trayRef}
              className="vz-nav-tray hidden items-center lg:flex"
              aria-label="Main"
              onMouseLeave={resetPill}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) resetPill();
              }}
            >
              <span ref={pillRef} className="vz-nav-pill" aria-hidden="true" />

              {primaryLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className="vz-nav-link" onMouseEnter={onItemEnter} onFocus={onItemEnter}>
                  {label}
                </NavLink>
              ))}

              <DesktopDropdown label="Conferences" active={confActive} width="w-[34rem]" onEnter={onItemEnter}>
                <div className="grid grid-cols-[11rem_1fr]">
                  <div className="vz-nav-feature relative overflow-hidden p-5 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">Events</p>
                    <p className="mt-3 font-display text-xl font-bold leading-tight">International Conferences</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/75">Call for papers, dates and registration.</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {conferences.length > 0 ? (
                      conferences.map((conf) => (
                        <Link
                          key={conf.id}
                          to={`/conferences/${confSlugOf(conf)}`}
                          className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-vz-ink/80 transition-colors hover:bg-amber-50 hover:text-vz-ink"
                        >
                          <span className="vz-nav-bullet mt-1.5" aria-hidden="true" />
                          <span className="min-w-0 flex-1">{confNameOf(conf) || "Unnamed Conference"}</span>
                          <ArrowUpRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      ))
                    ) : (
                      <span className="block px-3 py-2.5 text-sm text-slate-500">No released conferences yet</span>
                    )}
                  </div>
                </div>
              </DesktopDropdown>

              <DesktopDropdown label="HR Department" active={hrActive} width="w-80" align="right-0" onEnter={onItemEnter}>
                <div className="p-2">
                  {hrLinks.map(({ to, label, hint, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="group flex items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-amber-50"
                    >
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f46e5] via-[#4f46e5] to-[#7c3aed] text-white">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-vz-ink">{label}</span>
                        <span className="block text-xs text-slate-500">{hint}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </DesktopDropdown>
            </nav>

            {/* ================= ACTIONS ================= */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                className={`${ROUND_BUTTON} hidden text-[#1da851] hover:bg-[#25d366] hover:text-white xl:flex`}
              >
                <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
              <a
                href={PHONE_HREF}
                aria-label={`Call ${PHONE_DISPLAY}`}
                className={`${ROUND_BUTTON} text-sf-indigo hover:bg-amber-400 hover:text-sf-navy lg:hidden xl:flex`}
              >
                <Phone className="h-[18px] w-[18px]" />
              </a>
              <Link
                to="/contact"
                className="pill-primary group/cta ml-1 hidden h-11 items-center gap-2 rounded-full pl-5 pr-5 text-sm font-bold whitespace-nowrap text-white transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-indigo lg:flex xl:pr-1.5"
              >
                Get in Touch
                <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sf-navy xl:flex">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:rotate-45" />
                </span>
              </Link>
              <button
                ref={menuButtonRef}
                onClick={() => setIsMenuOpen(true)}
                className="pill-primary flex h-11 w-11 items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-indigo lg:hidden"
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU (full screen, white) ================= */}
      <div
        className="vz-menu vz-menu-light fixed inset-0 z-[100] isolate flex flex-col overflow-hidden text-vz-ink lg:hidden"
        data-open={isMenuOpen || undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!isMenuOpen}
      >
        <div className={`${WRAP} flex h-[72px] flex-shrink-0 items-center justify-between border-b border-vz-line`}>
          <Logo />
          <button
            ref={closeButtonRef}
            onClick={() => {
              closeMenu();
              menuButtonRef.current?.focus();
            }}
            className={`${ROUND_BUTTON} text-vz-ink hover:bg-amber-400`}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className={`${WRAP} flex-1 overflow-y-auto py-4`} aria-label="Mobile">
          {primaryLinks.map(({ to, label, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ "--i": i }}
              className="vz-menu-item group flex items-baseline gap-4 border-b border-vz-line py-4"
            >
              {({ isActive }) => (
                <>
                  <span className="w-6 text-xs font-bold tabular-nums text-amber-500">{number(i)}</span>
                  <span className={`font-display text-[1.7rem] font-bold leading-none tracking-[-0.01em] ${isActive ? "vz-gradient-text-deep" : ""}`}>
                    {label}
                  </span>
                  <ArrowUpRight className="ml-auto h-5 w-5 self-center text-vz-ink/30 transition-colors group-hover:text-amber-500" />
                </>
              )}
            </NavLink>
          ))}

          {[
            {
              label: "Conferences",
              open: isConfOpen,
              toggle: () => setIsConfOpen((v) => !v),
              active: confActive,
              items:
                conferences.length > 0
                  ? conferences.map((conf) => ({
                      key: conf.id,
                      to: `/conferences/${confSlugOf(conf)}`,
                      label: confNameOf(conf) || "Unnamed Conference",
                    }))
                  : null,
              empty: "No conferences available",
            },
            {
              label: "HR Department",
              open: isHrOpen,
              toggle: () => setIsHrOpen((v) => !v),
              active: hrActive,
              items: hrLinks.map(({ to, label, hint }) => ({ key: to, to, label, hint })),
            },
          ].map((group, j) => {
            const i = primaryLinks.length + j;
            return (
              <div key={group.label} style={{ "--i": i }} className="vz-menu-item border-b border-vz-line">
                <button type="button" onClick={group.toggle} aria-expanded={group.open} className="flex w-full items-baseline gap-4 py-4 text-left">
                  <span className="w-6 text-xs font-bold tabular-nums text-amber-500">{number(i)}</span>
                  <span
                    className={`font-display text-[1.7rem] font-bold leading-none tracking-[-0.01em] ${group.active ? "vz-gradient-text-deep" : ""}`}
                  >
                    {group.label}
                  </span>
                  <ChevronDown
                    className={`ml-auto h-5 w-5 self-center text-vz-ink/50 transition-transform duration-300 ${group.open ? "rotate-180" : ""}`}
                  />
                </button>
                {group.open && (
                  <div className="mb-4 ml-10 border-l border-vz-line">
                    {group.items ? (
                      group.items.map((item) => (
                        <Link key={item.key} to={item.to} className="block py-2.5 pl-4 text-[15px] text-vz-ink/75 transition-colors hover:text-amber-600">
                          <span className="block font-semibold">{item.label}</span>
                          {item.hint && <span className="block text-xs text-slate-500">{item.hint}</span>}
                        </Link>
                      ))
                    ) : (
                      <p className="py-2.5 pl-4 text-sm text-slate-500">{group.empty}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={`${WRAP} flex-shrink-0 space-y-4 border-t border-vz-line py-5`}>
          <Link
            to="/contact"
            className="pill-primary flex h-12 items-center justify-between rounded-full pl-6 pr-1.5 text-[15px] font-bold text-white"
          >
            Get in Touch
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-sf-navy">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
          <div className="grid gap-2.5 text-sm text-vz-ink/75">
            <a href={PHONE_HREF} className="flex items-center gap-3 hover:text-amber-600">
              <Phone className="h-4 w-4 text-sf-indigo" />
              {PHONE_DISPLAY}
            </a>
            <a href={MAIL_HREF} className="flex items-center gap-3 break-all hover:text-amber-600">
              <Mail className="h-4 w-4 flex-shrink-0 text-sf-indigo" />
              {EMAIL}
            </a>
          </div>
          <div className="flex gap-2">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat on WhatsApp"
              className={`${ROUND_BUTTON} text-[#25d366] hover:bg-[#25d366] hover:text-white`}
            >
              <FaWhatsapp className="h-4 w-4" />
            </a>
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className={`${ROUND_BUTTON} text-vz-ink/70 hover:bg-amber-400 hover:text-sf-navy`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
