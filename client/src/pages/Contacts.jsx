import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  CheckCheck,
  Clock,
  Headphones,
  PhoneCall,
  MailOpen,
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { Accent, Eyebrow, Rule, Swash } from "../components/PressUI";
import { H2_FIT, SCREEN, SCREEN_PAD, WRAP } from "../components/pressLayout";

/* Contact, in the home page's "press" look: a lavender hero with the
   telephone receiver hanging in over a violet disc and the conversation in
   chat bubbles beside it; then the contact details and the form as one
   letter, a navy pane beside a white sheet with an airmail edge, a stamp and
   a postmark. The ct-* styles live in styles/contact.css. */

const LOGO = '/assets/image/veritaz-logo.webp';
const FOCUS_LIGHT = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';
const INPUT = 'ct-input w-full rounded-xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-vz-ink short:py-3';

// Social links, as before. The hrefs are still placeholders ("#").
const SOCIALS = [
  { Icon: FaFacebookF, label: 'Facebook' },
  { Icon: FaTwitter, label: 'Twitter' },
  { Icon: FaInstagram, label: 'Instagram' },
  { Icon: FaLinkedinIn, label: 'LinkedIn' },
];

export default function Contacts() {
  // Form submission state
  const [formStatus, setFormStatus] = useState({ message: '', type: '' });


  // Handle Third-Party Scripts (GTM & Google Analytics) on Mount
  useEffect(() => {
    // 1. Google Tag Manager
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-WZ969VN8';
    document.head.appendChild(gtmScript);

    // 2. Google Analytics
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-T1PQ97DJ6F';
    document.head.appendChild(gaScript);

    const gaConfigScript = document.createElement('script');
    gaConfigScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-T1PQ97DJ6F');
    `;
    document.head.appendChild(gaConfigScript);

    return () => {
      // Clean up scripts on unmount if necessary
      gtmScript.remove();
      gaScript.remove();
      gaConfigScript.remove();
    };
  }, []);

  // Form Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    setFormStatus({ message: 'Processing...', type: 'loading' });

    const formData = new FormData(form);
    const payload = {
      name: `${formData.get('first_name') || ''} ${formData.get('last_name') || ''}`.trim(),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      form_type: 'Contact Us'
    };

    try {
      const { error } = await supabase.from("veritaz_inquiries").insert(payload);

      if (!error) {
        setFormStatus({
          message: "✅ Success! We'll be in touch within 24 hours.",
          type: 'success'
        });
        form.reset();
      } else {
        setFormStatus({
          message: "❌ " + (error.message || "Submission failed."),
          type: 'error'
        });
      }
    } catch {
      setFormStatus({
        message: "❌ Connection error. Please try again.",
        type: 'error'
      });
    }
  };

  useEffect(() => {
    document.title = "Contact Veritaz International | Book Publishing Experts";

    // 1. Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Contact Veritaz International for book publishing, ISBN registration, patent support, copyright services, research publication, and academic assistance.";

    // 2. Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = "contact Veritaz International, publisher support, publishing inquiry, author help, academic publishing contact India, reach Veritaz team";

    // 3. Robots Tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "index, follow";

    // 4. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = "https://www.veritazinternational.com/contact";
  }, []);

  return (
    <main className="overflow-x-clip bg-white text-slate-800">
      <Hero />

      {/* Contact details + form: one letter, the navy details pane beside
          the white writing sheet. */}
      <section className={`ct-band relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
        <div className={WRAP}>
          <div className="relative isolate">
            <span className="ct-band-dots" aria-hidden="true" />
            <span className="ct-sheet" aria-hidden="true" />

            <div className="ct-letter relative overflow-hidden rounded-[2rem] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:rounded-[2.5rem]">
              {/* Contact information */}
              <div className="ct-info relative isolate overflow-hidden px-6 py-12 text-white sm:px-12 lg:px-8 lg:py-12 xl:px-12 short:py-8">
                <span className="ct-info-dots" aria-hidden="true" />
                <span className="ct-info-diamond" aria-hidden="true" />

                <Rule tone="dark" />
                <h2 className={`reveal mt-4 ${H2_FIT} leading-[1.1] text-white short:mt-3`}>
                  Contact
                  <br />
                  <Accent tone="light">Information</Accent>
                </h2>

                <p className="mt-5 text-base leading-relaxed text-white/80 lg:text-[17px] short:mt-4 short:text-[15px]">
                  Thank you for your interest in our services. Please fill out the form or contact us directly using the information below.
                </p>

                <ul className="mt-7 grid gap-3 short:mt-4 short:gap-2">
                  <li>
                    <a href="tel:+916380658876" className={`ct-glass group flex items-center gap-3 rounded-2xl px-4 py-3.5 sm:gap-4 short:py-2.5 ${FOCUS_LIGHT}`}>
                      <span aria-hidden="true" className="svc-badge svc-badge--sm svc-badge--amber">
                        <PhoneCall className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-sf-lavender">Call us directly</span>
                        <span className="mt-1 block text-[15px] font-semibold leading-snug text-white sm:text-base xl:text-[17px]">+91 63806 58876</span>
                      </span>
                      <ArrowUpRight className="ct-go hidden h-5 w-5 flex-none sm:block lg:hidden xl:block" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a href="mailto:info@veritazinternational.com" className={`ct-glass group flex items-center gap-3 rounded-2xl px-4 py-3.5 sm:gap-4 short:py-2.5 ${FOCUS_LIGHT}`}>
                      <span aria-hidden="true" className="svc-badge svc-badge--sm svc-badge--sky">
                        <MailOpen className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-sf-lavender">Email Support</span>
                        <span className="mt-1 block text-[15px] font-semibold leading-snug text-white [overflow-wrap:anywhere] sm:text-base xl:text-[17px]">info@<wbr />veritazinternational.com</span>
                      </span>
                      <ArrowUpRight className="ct-go hidden h-5 w-5 flex-none sm:block lg:hidden xl:block" aria-hidden="true" />
                    </a>
                  </li>
                </ul>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-4 border-t border-white/15 pt-6 short:mt-4 short:pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-sf-lavender">Follow Our Progress</h3>
                  <div className="flex gap-2">
                    {SOCIALS.map(({ Icon, label }) => (
                      <a
                        key={label}
                        href="#"
                        aria-label={label}
                        className={`ct-social flex h-11 w-11 items-center justify-center rounded-full ${FOCUS_LIGHT}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="ct-paper relative px-6 pb-10 pt-14 sm:px-12 sm:pb-12 lg:px-12 lg:pb-10 lg:pt-12 xl:px-16 short:pb-7 short:pt-10">
                <span className="ct-airmail" aria-hidden="true" />
                <Stamp />

                <h2 className={`reveal pr-20 ${H2_FIT} leading-[1.1] text-vz-ink sm:pr-36`}>
                  Send us a <Accent>message</Accent>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600 short:mt-2 short:text-[15px]">Fill out the form below and our team will get back to you within 24 hours.</p>

                <form id="web3form" onSubmit={handleFormSubmit} className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-7 lg:gap-y-4 short:mt-5 short:gap-y-3" noValidate>
                  <input type="hidden" name="access_key" value="351a2b0f-5bed-4078-a9ce-dc3cdb628eb5" />
                  <input type="hidden" name="subject" value="New Message from Contact Form" />
                  <input type="checkbox" name="botcheck" style={{ display: 'none' }} />

                  <Field id="first-name" label="First Name *" icon={User}>
                    <input type="text" name="first_name" id="first-name" required className={INPUT} />
                  </Field>
                  <Field id="last-name" label="Last Name *" icon={User}>
                    <input type="text" name="last_name" id="last-name" required className={INPUT} />
                  </Field>

                  <Field id="email" label="Email Address *" icon={Mail}>
                    <input type="email" name="email" id="email" required className={INPUT} />
                  </Field>
                  <Field id="phone" label="Phone Number" icon={Phone}>
                    <input type="tel" name="phone" id="phone" className={INPUT} />
                  </Field>

                  <Field id="message" label="Your Message" icon={MessageSquare} multiline className="sm:col-span-2">
                    <textarea name="message" id="message" rows="5" required className={`${INPUT} block resize-none lg:h-32 short:h-24`}></textarea>
                  </Field>

                  <div className="mt-1 flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:gap-6 lg:mt-0 lg:flex-col lg:items-start xl:flex-row xl:items-center">
                    <button
                      type="submit"
                      disabled={formStatus.type === 'loading'}
                      className="pill-primary group inline-flex h-14 flex-none items-center justify-center gap-3 rounded-full px-9 text-[15px] font-bold text-white transition-[box-shadow] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-violet disabled:cursor-wait disabled:opacity-60 short:h-12"
                    >
                      Send Message
                      <Send className="h-[18px] w-[18px] motion-safe:transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-1" aria-hidden="true" />
                    </button>

                    <p className="flex items-center justify-center gap-2 text-center text-[13px] leading-snug text-slate-600 sm:justify-start sm:text-left">
                      <ShieldCheck size={16} aria-hidden="true" className="flex-none text-sf-emerald" />
                      Your privacy is our priority. We never share your personal information.
                    </p>
                  </div>

                  {/* Dynamically styled response message */}
                  <div role="status" className="empty:hidden sm:col-span-2">
                    {formStatus.message && (
                      <p
                        className={`rounded-xl px-4 py-3 text-center text-sm font-bold ring-1 ${
                          formStatus.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : formStatus.type === 'loading'
                              ? 'bg-sf-mist text-sf-indigo-deep ring-vz-line'
                              : 'bg-red-50 text-red-700 ring-red-200'
                        }`}
                      >
                        {formStatus.message}
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/** Hero: the title on the left; on the right the lavender receiver hangs in
 *  on its cord over a violet disc, with the conversation in chat bubbles
 *  beside it. */
function Hero() {
  return (
    <header className="vz-hero-v2 relative isolate overflow-hidden text-vz-ink lg:flex lg:min-h-[calc(100svh-7.6rem)] lg:flex-col">
      <svg aria-hidden="true" className="vz-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ct-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#ddd6fe" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" fill="url(#ct-wave)" opacity="0.55" />
        <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill="#ffffff" />
      </svg>

      <div className={`${WRAP} grid gap-8 pb-20 pt-12 sm:pb-28 sm:pt-16 lg:flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6 lg:py-0`}>
        <div className="relative z-10 self-center lg:pb-24 lg:pt-12 short:pb-16 short:pt-8">
          <Eyebrow icon={Headphones}>Contact Support</Eyebrow>
          <h1 className="vz-misreg mt-6 text-[2.75rem] leading-[1.05] text-vz-ink sm:text-6xl lg:text-[clamp(3rem,min(5.2vw,9.6svh),4.5rem)] short:mt-4">
            Get In{" "}
            <span className="relative inline-block">
              <span className="hero-accent">Touch.</span>
              <Swash className="hero-swash--word" />
            </span>
          </h1>
          <span className="ct-hero-rule mt-8 block h-1 w-20 rounded-full short:mt-5" aria-hidden="true" />
          <p className="hero-fade mt-6 max-w-md text-base leading-relaxed text-slate-600 lg:text-[17px] short:mt-4 short:text-[15px]">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <HeroScene />
      </div>
    </header>
  );
}

/** The receiver on its disc, with sound rings at the earpiece, two glossy
 *  badges floating by, and the chat bubbles. Decorative. */
function HeroScene() {
  return (
    <div aria-hidden="true" className="ct-stage relative">
      <div className="ct-rig">
        <span className="ct-disc" />
        <svg className="ct-signal" viewBox="0 0 60 100">
          <defs>
            <linearGradient id="ct-signal-ink" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4f46e5" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path style={{ "--i": 0 }} d="M46.2 38.4 A18 18 0 0 0 46.2 61.6" />
          <path style={{ "--i": 1 }} d="M34 28.1 A34 34 0 0 0 34 71.9" />
          <path style={{ "--i": 2 }} d="M21.7 17.9 A50 50 0 0 0 21.7 82.1" />
        </svg>
        <img src="/assets/image/contact-phone.webp" alt="" width="400" height="760" className="ct-receiver" />
        <span className="ct-float ct-float--mail">
          <span className="svc-badge svc-badge--sm svc-badge--amber">
            <Mail className="relative z-10 h-5 w-5" strokeWidth={1.8} />
          </span>
        </span>
        <span className="ct-float ct-float--send">
          <span className="svc-badge svc-badge--xs svc-badge--pink">
            <Send className="relative z-10 h-4 w-4" strokeWidth={1.8} />
          </span>
        </span>
      </div>

      <div className="ct-thread">
        <span className="ct-bubble ct-bubble--end" style={{ "--i": 0, "--tilt": "-3deg" }}>Hello!</span>
        <span className="ct-bubble ct-bubble--accent" style={{ "--i": 1, "--tilt": "2deg" }}>How can<br />we help?</span>
        <span className="ct-bubble ct-bubble--end" style={{ "--i": 2, "--tilt": "-2deg" }}>Let's talk</span>
        <span className="ct-bubble ct-bubble--status" style={{ "--i": 3, "--tilt": "1.5deg" }}>
          <span className="svc-badge svc-badge--xs svc-badge--emerald">
            <Clock className="relative z-10 h-4 w-4" strokeWidth={2} />
          </span>
          <span>Reply within<br />24 hours</span>
          <CheckCheck className="ct-ticks h-4 w-4 flex-none" strokeWidth={2.2} />
        </span>
      </div>
    </div>
  );
}

/** Postage stamp in the sheet's corner: the logo on a perforated stamp,
 *  with a postmark struck across it. Decorative. */
function Stamp() {
  return (
    <span aria-hidden="true" className="ct-stamp-wrap">
      <span className="ct-stamp">
        <span className="ct-stamp-face">
          <img src={LOGO} alt="" />
        </span>
      </span>
      <svg className="ct-postmark" viewBox="0 0 140 70" fill="none">
        <circle cx="104" cy="35" r="27" />
        <circle cx="104" cy="35" r="21" />
        <path d="M0 17 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" />
        <path d="M0 29 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" />
        <path d="M0 41 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" />
        <path d="M0 53 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" />
      </svg>
    </span>
  );
}

/** A labelled form field with an icon inside the input. A trailing " *" in
 *  the label is set in violet. */
function Field({ id, label, icon: Icon, multiline = false, className = '', children }) {
  const required = label.endsWith(' *');
  const text = required ? label.slice(0, -2) : label;
  return (
    <div className={`group ${className}`}>
      <label htmlFor={id} className="mb-2 block text-sm short:mb-1.5 font-semibold text-vz-ink transition-colors group-focus-within:text-sf-indigo">
        {text}
        {required && (
          <>
            {' '}
            <span className="text-sf-violet">*</span>
          </>
        )}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className={`pointer-events-none absolute left-4 z-10 h-[18px] w-[18px] text-slate-500 transition-colors group-focus-within:text-sf-indigo ${multiline ? 'top-[1.05rem]' : 'top-1/2 -translate-y-1/2'}`}
        />
        {children}
      </div>
    </div>
  );
}
