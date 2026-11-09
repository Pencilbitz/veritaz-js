import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaInstagram } from "react-icons/fa";
import { supabase } from "../lib/supabase";

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
  { to: "/hr-department", label: "Employment Verification", hint: "For employers & agencies" },
  { to: "/careers", label: "Careers", hint: "Open roles & applications" },
];

const confNameOf = (conf) => conf.conferencename || conf.conferenceName || "";
const confSlugOf = (conf) => confNameOf(conf).replace(/\s+/g, "-").toLowerCase();

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-10";
const CTA_BUTTON = "bg-gradient-to-r from-brand-deep to-brand-violet text-white font-bold hover:opacity-90 transition-opacity";
const ICON_BUTTON = "w-10 h-10 hidden xl:flex items-center justify-center rounded-full bg-brand-mist text-brand-deep hover:bg-brand-deep hover:text-white transition-colors";

// Sits in the rounded tray; the current page is a solid pill.
const navLabelClass = (active) =>
  `inline-flex items-center gap-1 px-2.5 xl:px-4 py-2 rounded-full text-sm xl:text-[15px] font-semibold whitespace-nowrap transition-colors ${
    active ? "bg-brand-deep text-white" : "text-brand-deep hover:bg-white"
  }`;

function DesktopDropdown({ label, active, width = "w-72", align = "left-1/2 -translate-x-1/2", children }) {
  // Opens on hover and on keyboard focus (focus-within), so it works without a mouse.
  return (
    <div className="relative group h-full flex items-center">
      <button type="button" className={navLabelClass(active)} aria-haspopup="true">
        {label}
        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>
      <div
        className={`absolute top-full ${align} ${width} z-50 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200`}
      >
        <div className="bg-white rounded-xl shadow-xl shadow-blue-900/15 ring-1 ring-blue-100 p-2">{children}</div>
      </div>
    </div>
  );
}

const dropdownItemClass =
  "block px-3 py-2.5 rounded-lg text-[15px] text-slate-700 hover:bg-brand-mist hover:text-brand-violet transition-colors";

const mobileRowClass = (active) =>
  `w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
    active ? "bg-brand-mist text-brand-violet" : "text-slate-700 hover:bg-slate-50"
  }`;

function Logo({ small = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
      <img src="/assets/image/veritaz-bg-Remove.png" alt="Veritaz" className="w-12 h-12 object-contain flex-shrink-0" />
      <span className="min-w-0">
        <span className={`block font-extrabold tracking-wide text-brand-deep uppercase leading-none ${small ? "text-lg" : "text-xl"}`}>
          Veritaz
        </span>
        <span className="block text-[9px] tracking-[0.2em] text-brand-violet uppercase font-semibold mt-1 whitespace-nowrap">
          International Press
        </span>
      </span>
    </Link>
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
  useEffect(() => {
    closeMenu();
    window.scrollTo(0, 0);
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
    <header className="w-full sticky top-0 z-50 shadow-md shadow-brand-deep/10">
      <div className="logo-rule" />

      {/* ================= MAIN BAR ================= */}
      <div className="bg-white">
        <div className={`${WRAP} h-[72px] lg:h-20 flex items-center justify-between gap-4`}>
          <Logo />

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 p-1 rounded-full bg-brand-paper" aria-label="Main">
          {primaryLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => navLabelClass(isActive)}>
              {label}
            </NavLink>
          ))}

          <DesktopDropdown label="Conferences" active={confActive}>
            {conferences.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {conferences.map((conf) => (
                  <Link key={conf.id} to={`/conferences/${confSlugOf(conf)}`} className={dropdownItemClass}>
                    {confNameOf(conf) || "Unnamed Conference"}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="block px-3 py-2.5 text-sm text-slate-400">No Released Conferences</span>
            )}
          </DesktopDropdown>

          <DesktopDropdown label="HR Department" active={hrActive} width="w-80">
            {hrLinks.map(({ to, label, hint }) => (
              <Link key={to} to={to} className={dropdownItemClass}>
                <span className="block font-semibold">{label}</span>
                <span className="block text-xs text-slate-400">{hint}</span>
              </Link>
            ))}
          </DesktopDropdown>
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" aria-label="Join WhatsApp" className={ICON_BUTTON}>
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href={PHONE_HREF} aria-label={`Call ${PHONE_DISPLAY}`} className={ICON_BUTTON}>
              <Phone className="w-5 h-5" />
            </a>
            <Link
              to="/contact"
              className={`hidden lg:flex items-center h-11 px-4 xl:px-6 rounded-full text-sm whitespace-nowrap ${CTA_BUTTON}`}
            >
              Get in Touch
            </Link>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden -mr-2 w-11 h-11 flex items-center justify-center rounded-full text-brand-deep hover:bg-brand-mist transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-7 h-7" />
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
          <div className="px-5 h-[72px] flex items-center justify-between border-b border-slate-100">
            <Logo small />
            <button
              onClick={closeMenu}
              className="w-10 h-10 flex items-center justify-center text-brand-deep hover:bg-brand-mist rounded-full"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Mobile">
            {primaryLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => mobileRowClass(isActive)}>
                {label}
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </NavLink>
            ))}

            <div>
              <button
                type="button"
                onClick={() => setIsConfOpen((v) => !v)}
                aria-expanded={isConfOpen}
                className={mobileRowClass(confActive)}
              >
                Conferences
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isConfOpen ? "rotate-180" : ""}`} />
              </button>
              {isConfOpen && (
                <div className="ml-4 pl-3 border-l-2 border-brand-mist py-1">
                  {conferences.length > 0 ? (
                    conferences.map((conf) => (
                      <Link key={conf.id} to={`/conferences/${confSlugOf(conf)}`} className={`${dropdownItemClass} truncate`}>
                        {confNameOf(conf) || "Unnamed Conference"}
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-400">No conferences available</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setIsHrOpen((v) => !v)}
                aria-expanded={isHrOpen}
                className={mobileRowClass(hrActive)}
              >
                HR Department
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isHrOpen ? "rotate-180" : ""}`} />
              </button>
              {isHrOpen && (
                <div className="ml-4 pl-3 border-l-2 border-brand-mist py-1">
                  {hrLinks.map(({ to, label, hint }) => (
                    <Link key={to} to={to} className={dropdownItemClass}>
                      <span className="block font-semibold">{label}</span>
                      <span className="block text-xs text-slate-400">{hint}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="p-5 border-t border-slate-100 space-y-3 text-brand-deep">
            <a href={PHONE_HREF} className="flex items-center gap-3 text-[15px] font-medium">
              <Phone className="w-5 h-5" strokeWidth={1.75} />
              {PHONE_DISPLAY}
            </a>
            <a href={MAIL_HREF} className="flex items-center gap-3 text-[15px] font-medium break-all">
              <Mail className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
              {EMAIL}
            </a>
            <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[15px] font-medium">
              <MessageCircle className="w-5 h-5" strokeWidth={1.75} />
              Join WhatsApp
            </a>
            <Link
              to="/contact"
              className={`mt-2 h-12 rounded-full flex items-center justify-center ${CTA_BUTTON}`}
            >
              Get in Touch
            </Link>
            <div className="flex gap-2 pt-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-mist text-brand-deep hover:bg-brand-violet hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
