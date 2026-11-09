import React, { useState, useEffect } from 'react';
import {
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
import { supabase } from "../lib/supabase";

const WRAP = 'mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20';
const SERIF = { fontFamily: 'var(--font-serif)' };
const FOCUS_LIGHT = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';
const INPUT =
  'w-full rounded-xl border border-brand-deep/10 bg-brand-snow py-3.5 pl-11 pr-4 font-medium text-brand-ink outline-none transition placeholder:text-slate-400 focus:border-brand-bright focus:bg-white focus:ring-4 focus:ring-brand-bright/15';

// Social links, as before. The hrefs are still placeholders ("#").
const SOCIALS = [
  { icon: 'fab fa-facebook-f', label: 'Facebook' },
  { icon: 'fab fa-twitter', label: 'Twitter' },
  { icon: 'fab fa-instagram', label: 'Instagram' },
  { icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
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
    } catch (error) {
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
    <main className="min-h-screen bg-white text-slate-800">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-white via-brand-snow to-brand-paper">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-cyan/20 blur-[100px]" />
        <div className={`${WRAP} relative grid items-center lg:min-h-[460px] lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-10`}>
          <div className="py-16 text-center sm:py-20 lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-deep/15 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-deep shadow-sm backdrop-blur sm:text-sm">
              <Headphones size={15} aria-hidden="true" />
              Contact Support
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-brand-ink sm:text-5xl xl:text-[3.25rem]">
              Get In Touch.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 lg:mx-0">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* A telephone handset hanging from the top edge of the banner, with speech
              bubbles beside it. Decorative, desktop only. */}
          <div aria-hidden="true" className="relative hidden self-stretch lg:block">
            <SpeechBubble style={{ top: "3%", left: "-8%", "--tilt": "-6deg", "--d": 0 }}>Hello!</SpeechBubble>
            <SpeechBubble style={{ top: "22%", left: "-44%", "--tilt": "-4deg", "--d": 1 }} accent>How can<br />we help?</SpeechBubble>
            <SpeechBubble style={{ top: "47%", left: "-12%", "--tilt": "5deg", "--d": 2 }}>Let's talk</SpeechBubble>
            <SpeechBubble style={{ top: "66%", left: "-46%", "--tilt": "3deg", "--d": 3 }}>Reply within<br />24 hours</SpeechBubble>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 pb-6">
              <img
                src="/assets/image/contact-phone.png"
                alt=""
                width="910"
                height="1728"
                className="contact-phone h-full w-auto max-w-none select-none"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Contact details + form */}
      <section className="relative overflow-hidden bg-brand-snow py-16 lg:py-24">
        <div className={`${WRAP} grid items-stretch gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10`}>

          {/* Contact information */}
          <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-ink via-brand-deep to-brand-violet p-8 text-white shadow-[0_24px_50px_rgb(5_47_115/0.3)] sm:p-12">
            <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-cyan/30 blur-3xl" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-orchid/30 blur-3xl" />

            <div className="relative">
              <h2 style={SERIF} className="text-4xl font-medium tracking-tight">Contact</h2>
              <h3 style={SERIF} className="text-4xl font-medium tracking-tight">Information</h3>

              <p className="mt-6 leading-relaxed text-white/85">
                Thank you for your interest in our services. Please fill out the form or contact us directly using the information below.
              </p>

              <ul className="mt-10 space-y-6">
                <li>
                  <a href="tel:+916380658876" className={`group flex items-center gap-5 rounded-2xl ${FOCUS_LIGHT}`}>
                    <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-goldlight transition-colors group-hover:bg-brand-gold group-hover:text-brand-ink">
                      <PhoneCall size={22} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-widest text-brand-cyanlight">Call us directly</span>
                      <span className="mt-1 block text-lg font-semibold transition-colors group-hover:text-brand-goldlight">+91 63806 58876</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="mailto:info@veritazinternational.com" className={`group flex items-center gap-5 rounded-2xl ${FOCUS_LIGHT}`}>
                    <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-goldlight transition-colors group-hover:bg-brand-gold group-hover:text-brand-ink">
                      <MailOpen size={22} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-widest text-brand-cyanlight">Email Support</span>
                      <span className="mt-1 block break-all text-lg font-semibold transition-colors group-hover:text-brand-goldlight">info@veritazinternational.com</span>
                    </span>
                  </a>
                </li>
              </ul>

              <div className="mt-12 border-t border-white/15 pt-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-cyanlight">Follow Our Progress</h4>
                <div className="mt-5 flex gap-3">
                  {SOCIALS.map(({ icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-ink ${FOCUS_LIGHT}`}
                    >
                      <i className={`${icon} text-base`} aria-hidden="true"></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div className="relative rounded-3xl bg-white p-8 shadow-[0_0_0_1px_rgb(8_72_168/0.06),0_24px_50px_rgb(8_72_168/0.1)] sm:p-12">
            <h3 style={SERIF} className="text-3xl font-medium tracking-tight text-brand-ink">Send us a message</h3>
            <p className="mt-2 text-slate-600">Fill out the form below and our team will get back to you within 24 hours.</p>

            <form id="web3form" onSubmit={handleFormSubmit} className="mt-10 space-y-6" noValidate>
              <input type="hidden" name="access_key" value="351a2b0f-5bed-4078-a9ce-dc3cdb628eb5" />
              <input type="hidden" name="subject" value="New Message from Contact Form" />
              <input type="checkbox" name="botcheck" style={{ display: 'none' }} />

              <div className="grid gap-6 md:grid-cols-2">
                <Field id="first-name" label="First Name *" icon={User}>
                  <input type="text" name="first_name" id="first-name" required className={INPUT} />
                </Field>
                <Field id="last-name" label="Last Name *" icon={User}>
                  <input type="text" name="last_name" id="last-name" required className={INPUT} />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field id="email" label="Email Address *" icon={Mail}>
                  <input type="email" name="email" id="email" required className={INPUT} />
                </Field>
                <Field id="phone" label="Phone Number" icon={Phone}>
                  <input type="tel" name="phone" id="phone" className={INPUT} />
                </Field>
              </div>

              <Field id="message" label="Your Message" icon={MessageSquare} multiline>
                <textarea name="message" id="message" rows="5" required className={`${INPUT} resize-none`}></textarea>
              </Field>

              <button
                type="submit"
                disabled={formStatus.type === 'loading'}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_rgb(8_72_168/0.3)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep disabled:pointer-events-none disabled:opacity-70"
              >
                Send Message
                <Send size={16} aria-hidden="true" />
              </button>

              {/* Dynamically styled response message */}
              {formStatus.message && (
                <p
                  role="status"
                  className={`rounded-xl p-3 text-center text-sm font-bold ${
                    formStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : formStatus.type === 'loading'
                        ? 'bg-brand-mist text-brand-deep'
                        : 'bg-red-50 text-red-600'
                  }`}
                >
                  {formStatus.message}
                </p>
              )}

              <p className="flex items-center justify-center gap-2 text-center text-[11px] uppercase tracking-widest text-slate-400">
                <ShieldCheck size={14} aria-hidden="true" className="flex-none text-brand-bright" />
                Your privacy is our priority. We never share your personal information.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

// Burst: ten uneven spikes joined by curves that dip in towards the centre,
// like a hand-cut comic exclamation. One spike, pointing down and right towards
// the phone, is longer and acts as the tail. Drawn in a 200 x 135 box.
const BURST_SPIKES = [
  { angle: -90, r: 1 },
  { angle: -52, r: 0.9 },
  { angle: -16, r: 1.02 },
  { angle: 20, r: 0.88 },
  { angle: 52, r: 1.3 }, // the tail
  { angle: 92, r: 0.86 },
  { angle: 128, r: 1 },
  { angle: 162, r: 0.9 },
  { angle: 196, r: 1.02 },
  { angle: 232, r: 0.88 },
];
const burstPoint = (angle, r) => {
  const rad = (angle * Math.PI) / 180;
  return `${(100 + Math.cos(rad) * 84 * r).toFixed(1)} ${(66 + Math.sin(rad) * 54 * r).toFixed(1)}`;
};
const BURST_PATH =
  BURST_SPIKES.map(({ angle, r }, i) => {
    const next = BURST_SPIKES[(i + 1) % BURST_SPIKES.length];
    const nextAngle = next.angle < angle ? next.angle + 360 : next.angle;
    const dip = burstPoint((angle + nextAngle) / 2, 0.58);
    return `${i === 0 ? "M" : ""}${burstPoint(angle, r)} Q${dip} `;
  }).join("") + `${burstPoint(BURST_SPIKES[0].angle, BURST_SPIKES[0].r)} Z`;

/** A comic speech bubble: a spiky burst outlined in navy, with the text set
 *  over it. The outline stretches to fit the text; its stroke stays 2px. */
function SpeechBubble({ style, accent = false, children }) {
  return (
    <span className="speech-bubble" style={style}>
      <svg viewBox="0 0 200 135" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <path
          d={BURST_PATH}
          fill={accent ? "var(--color-brand-goldlight)" : "#ffffff"}
          stroke="var(--color-brand-ink)"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

/** A labelled form field with an icon inside the input. */
function Field({ id, label, icon: Icon, multiline = false, children }) {
  return (
    <div className="group">
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-brand-bright">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={17}
          aria-hidden="true"
          className={`pointer-events-none absolute left-4 text-slate-400 transition-colors group-focus-within:text-brand-bright ${multiline ? 'top-4' : 'top-1/2 -translate-y-1/2'}`}
        />
        {children}
      </div>
    </div>
  );
}
