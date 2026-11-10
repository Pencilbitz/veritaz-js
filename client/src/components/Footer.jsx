import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, ArrowUpRight } from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";

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

const contacts = [
  { href: "tel:+916380658876", icon: Phone, label: "+91 6380658876", iconClass: "text-brand-deep" },
  { href: "mailto:info@veritazinternational.com", icon: Mail, label: "info@veritazinternational.com", iconClass: "text-brand-deep" },
  { href: "https://wa.me/916380658876", icon: FaWhatsapp, label: "Join WhatsApp", iconClass: "text-[#1da851]", external: true },
];

export default function Footer() {
  return (
    <footer className="bg-[#e8f0fc] text-slate-700">
      <div className="h-2 bg-brand-deep" />
      <div className={`${WRAP} pt-14 lg:pt-20`}>
        {/* Brand + link columns */}
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/assets/image/veritaz-bg-Remove.png" alt="" className="h-16 w-16 object-contain" />
              <span>
                <span className="block text-3xl font-extrabold uppercase leading-none tracking-wide text-brand-deep">
                  Veritaz
                </span>
                <span className="mt-1.5 block text-[11px] font-medium uppercase tracking-[0.3em] text-slate-500">
                  International Press
                </span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-slate-700">
              Empowering authors to share their stories and knowledge with the world.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ href, icon: Icon, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgb(8_72_168/0.08)] transition-colors hover:text-white ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-lg font-semibold text-slate-900">{col.heading}</h3>
              <ul className="mt-6 space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-lg text-slate-600 transition-colors hover:text-brand-deep">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact row */}
        <div className="mt-14 flex flex-col gap-6 border-y border-slate-300/70 py-8 lg:mt-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10">
            <h3 className="text-lg font-semibold text-slate-900">Contact Us</h3>
            <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-10">
              {contacts.map(({ href, icon: Icon, label, iconClass, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="inline-flex items-center gap-3 break-all text-lg text-slate-600 transition-colors hover:text-brand-deep"
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${iconClass}`} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 self-start whitespace-nowrap font-semibold text-brand-deep transition-colors hover:text-brand-ink lg:self-auto"
          >
            Get in Touch
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

        <p className="py-8 text-lg text-slate-600">
          &copy; {new Date().getFullYear()} Veritaz International Press. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
