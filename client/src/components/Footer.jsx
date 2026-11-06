import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle, ArrowUpRight } from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaInstagram } from "react-icons/fa";

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-10";

const columns = [
  {
    heading: "Quick Links",
    links: [
      { to: "/", label: "Home" },
      { to: "/our-company", label: "About Us" },
      { to: "/book-store", label: "Book Store" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Services",
    links: [
      { to: "/book-publishing", label: "Book Publishing" },
      { to: "/book-publishing", label: "Editing & Proofreading" },
      { to: "/book-publishing", label: "ISBN Acquisition" },
      { to: "/book-publishing", label: "Copyright Services" },
      { to: "/hr-department", label: "Employment Verification" },
    ],
  },
];

const socials = [
  { href: "https://www.linkedin.com/in/veritaz-international-press/", icon: FaLinkedinIn, label: "LinkedIn" },
  { href: "https://www.facebook.com/profile.php?id=61583778217764", icon: FaFacebookF, label: "Facebook" },
  { href: "https://www.instagram.com/veritazinternationalpress/", icon: FaInstagram, label: "Instagram" },
];

const contacts = [
  { href: "tel:+916380658876", icon: Phone, label: "+91 6380658876" },
  { href: "mailto:info@veritazinternational.com", icon: Mail, label: "info@veritazinternational.com" },
  { href: "https://wa.me/916380658876", icon: MessageCircle, label: "Join WhatsApp", external: true },
];

export default function Footer() {
  return (
    <footer className="bg-brand-ink text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="logo-rule" />
      <div className={`${WRAP} py-14 lg:py-20`}>
        {/* Statement */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/15">
          <p
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            className="max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight tracking-tight"
          >
            Empowering authors to share their stories and knowledge with the{" "}
            <em className="text-brand-gold">world.</em>
          </p>
          <Link
            to="/contact"
            className="self-start lg:self-auto inline-flex items-center gap-2 h-14 px-8 rounded-full bg-brand-gold text-brand-deep font-bold hover:bg-brand-goldlight transition-colors whitespace-nowrap"
          >
            Get in Touch
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Columns */}
        <div className="pt-12 grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-x-6 gap-y-10">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-11 h-11 rounded-lg bg-white flex items-center justify-center">
                <img src="/assets/image/veritaz-bg-Remove.png" alt="" className="w-9 h-9 object-contain" />
              </span>
              <span>
                <span className="block text-xl font-extrabold tracking-wide uppercase leading-none">Veritaz</span>
                <span className="block text-[9px] tracking-[0.2em] text-brand-gold uppercase font-semibold mt-1">
                  International Press
                </span>
              </span>
            </Link>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-blue-100 hover:bg-brand-gold hover:border-brand-gold hover:text-brand-deep transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">{col.heading}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-blue-100/85 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">Contact Us</h3>
            <ul className="mt-4 space-y-3">
              {contacts.map(({ href, icon: Icon, label, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="inline-flex items-center gap-3 text-blue-100/85 hover:text-white transition-colors break-all"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-brand-gold" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className={`${WRAP} py-5 text-sm text-blue-100/60`}>
          &copy; {new Date().getFullYear()} Veritaz International Press. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
