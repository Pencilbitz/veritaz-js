import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  ShieldCheck,
  Building2,
  ShoppingBag,
  BookOpen,
  Mail,
  Users,
  ChevronDown,
  ChevronRight,
  BadgeCheck,
  Briefcase,
} from "lucide-react";
import {
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";

const EMAIL = "veritazinternationalpress@gmail.com";
const MAIL_HREF = `mailto:${EMAIL}?subject=Enquiry%20from%20Website`;
const WHATSAPP_HREF = "https://wa.me/916380658876";

const socials = [
  { href: "https://www.linkedin.com/in/veritaz-international-press/", icon: FaLinkedinIn, label: "LinkedIn" },
  { href: "https://www.facebook.com/profile.php?id=61583778217764", icon: FaFacebookF, label: "Facebook" },
  { href: "https://www.instagram.com/veritazinternationalpress/", icon: FaInstagram, label: "Instagram" },
];

// Events is hidden from navigation - add
//   { to: "/events", label: "Events", icon: Calendar }
// back after "Our Company" (and import Calendar) to restore it. The /events
// route and event detail pages still resolve, so links already shared keep
// working, and the admin still manages events.
const primaryLinks = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/our-company", label: "Our Company", icon: Building2 },
  { to: "/book-store", label: "Book Store", icon: ShoppingBag },
  { to: "/book-publishing", label: "Publishing", icon: BookOpen },
];

// HR Department is a dropdown because its two destinations are read by two
// different visitors - an employer running a background check and a job
// applicant - so each gets a one-line hint. The HRMS staff portal is
// deliberately not here; it is reachable from the HR Department page.
const hrLinks = [
  { to: "/hr-department", label: "Employment Verification", hint: "For employers & agencies", icon: BadgeCheck },
  { to: "/careers", label: "Careers", hint: "Open roles & applications", icon: Briefcase },
];

const confNameOf = (conf) => conf.conferencename || conf.conferenceName || "";
const confSlugOf = (conf) => confNameOf(conf).replace(/\s+/g, "-").toLowerCase();

const desktopLinkClass = (active) =>
  `relative px-3.5 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors ${
    active ? "text-slate-900 bg-amber-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
  }`;

function DesktopDropdown({ label, icon: Icon, active, width = "w-72", children }) {
  // Opens on hover and on keyboard focus (focus-within), so the menu is
  // reachable without a mouse.
  return (
    <div className="relative group">
      <button type="button" className={desktopLinkClass(active)} aria-haspopup="true">
        <Icon className={`hidden xl:block w-4 h-4 ${active ? "text-amber-500" : "text-slate-400 group-hover:text-amber-500"}`} />
        {label}
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>
      <div
        className={`absolute left-1/2 -translate-x-1/2 pt-3 ${width} z-50 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200`}
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 ring-1 ring-slate-100 p-2">
          {children}
        </div>
      </div>
    </div>
  );
}

function MobileAccordion({ label, icon: Icon, open, onToggle, active, children }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
          active ? "bg-amber-50 text-slate-900" : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span className={`p-2 rounded-lg ${active ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
          <Icon className="w-5 h-5" />
        </span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="ml-7 pl-6 border-l-2 border-amber-100 py-1 space-y-0.5">{children}</div>
        </div>
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Links are client-side now, so the mobile panel has to close itself on
  // navigation instead of relying on a full page load to tear it down.
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && closeMenu();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  const confActive = location.pathname.startsWith("/conferences/");
  const hrActive = hrLinks.some((l) => location.pathname.startsWith(l.to)) || location.pathname === "/hr";

  return (
    <header className="w-full sticky top-0 z-50">
      {/* ================= TOP UTILITY BAR ================= */}
      <div
        className={`hidden md:block bg-slate-900 text-slate-300 text-xs overflow-hidden transition-all duration-300 ${
          scrolled ? "max-h-0" : "max-h-10"
        }`}
      >
        <div className="container mx-auto px-6 h-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={MAIL_HREF} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              {EMAIL}
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-green-400 transition-colors"
            >
              <FaWhatsapp className="w-3.5 h-3.5 text-green-400" />
              +91 63806 58876
            </a>
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-2 text-slate-500 uppercase tracking-widest text-[10px] font-semibold">Follow us</span>
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 hover:text-white transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MAIN BAR ================= */}
      <div
        className={`bg-white/95 backdrop-blur-md border-b transition-shadow duration-300 ${
          scrolled ? "border-slate-200 shadow-lg shadow-slate-900/5" : "border-slate-100"
        }`}
      >
        <div
          className={`container mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between gap-3 transition-all duration-300 ${
            scrolled ? "h-16" : "h-[76px]"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 min-w-0 group">
            <img
              src="/assets/image/veritaz-bg-Remove.png"
              alt="Veritaz"
              className={`object-contain flex-shrink-0 transition-all duration-300 ${
                scrolled ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14"
              }`}
            />
            <span className="min-w-0">
              <span className="block text-lg md:text-xl font-extrabold tracking-[0.15em] text-slate-900 uppercase leading-none">
                Veritaz
              </span>
              <span className="block text-[9px] md:text-[10px] tracking-[0.25em] text-amber-600 uppercase font-bold mt-1">
                International Press
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main">
            {primaryLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => desktopLinkClass(isActive)}>
                {({ isActive }) => (
                  <>
                    <Icon className={`hidden xl:block w-4 h-4 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}

            <DesktopDropdown label="Conference" icon={Users} active={confActive}>
              {conferences.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {conferences.map((conf) => (
                    <Link
                      key={conf.id}
                      to={`/conferences/${confSlugOf(conf)}`}
                      className="block px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 transition-colors"
                    >
                      {confNameOf(conf) || "Unnamed Conference"}
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="block px-3 py-2.5 text-xs text-slate-400">No Released Conferences</span>
              )}
            </DesktopDropdown>

            <DesktopDropdown label="HR Department" icon={ShieldCheck} active={hrActive} width="w-80">
              {hrLinks.map(({ to, label, hint, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-amber-50 transition-colors"
                >
                  <span className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">{label}</span>
                    <span className="block text-xs text-slate-400">{hint}</span>
                  </span>
                </Link>
              ))}
            </DesktopDropdown>

            <NavLink to="/contact" className={({ isActive }) => desktopLinkClass(isActive)}>
              {({ isActive }) => (
                <>
                  <Mail className={`hidden xl:block w-4 h-4 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
                  Contact
                </>
              )}
            </NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={MAIL_HREF}
              aria-label="Send mail"
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-amber-500 hover:bg-amber-50 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full bg-green-500 text-white text-sm font-semibold shadow-md shadow-green-500/25 hover:bg-green-600 hover:shadow-lg transition-all"
            >
              <FaWhatsapp className="text-lg" />
              <span className="hidden sm:inline lg:hidden xl:inline">Join WhatsApp</span>
            </a>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div className={`lg:hidden fixed inset-0 z-[100] ${isMenuOpen ? "visible" : "invisible"}`}>
        <div
          onClick={closeMenu}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          {/* Panel header */}
          <div className="px-5 h-[72px] flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <img src="/assets/image/veritaz-bg-Remove.png" alt="" className="w-10 h-10 object-contain" />
              <span>
                <span className="block text-base font-extrabold tracking-[0.15em] text-slate-900 uppercase leading-none">
                  Veritaz
                </span>
                <span className="block text-[9px] tracking-[0.25em] text-amber-600 uppercase font-bold mt-1">
                  International Press
                </span>
              </span>
            </div>
            <button
              onClick={closeMenu}
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Mobile">
            {primaryLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                    isActive ? "bg-amber-50 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`p-2 rounded-lg ${isActive ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </>
                )}
              </NavLink>
            ))}

            <MobileAccordion
              label="Conference"
              icon={Users}
              open={isConfOpen}
              onToggle={() => setIsConfOpen((v) => !v)}
              active={confActive}
            >
              {conferences.length > 0 ? (
                conferences.map((conf) => (
                  <Link
                    key={conf.id}
                    to={`/conferences/${confSlugOf(conf)}`}
                    className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-lg truncate"
                  >
                    {confNameOf(conf) || "Unnamed Conference"}
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-400">No conferences available</div>
              )}
            </MobileAccordion>

            <MobileAccordion
              label="HR Department"
              icon={ShieldCheck}
              open={isHrOpen}
              onToggle={() => setIsHrOpen((v) => !v)}
              active={hrActive}
            >
              {hrLinks.map(({ to, label, hint }) => (
                <Link
                  key={to}
                  to={to}
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-amber-50 transition-colors"
                >
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-slate-400">{hint}</span>
                </Link>
              ))}
            </MobileAccordion>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                  isActive ? "bg-amber-50 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`p-2 rounded-lg ${isActive ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                    <Mail className="w-5 h-5" />
                  </span>
                  <span className="flex-1">Contact Us</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </>
              )}
            </NavLink>
          </nav>

          {/* Panel footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={MAIL_HREF}
                className="flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-amber-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-500" />
                Send Mail
              </a>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-green-500 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                <FaWhatsapp className="text-base" />
                WhatsApp
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Follow us</span>
              <div className="flex gap-2">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
