import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Accent, Pill } from "./PressUI";
import { BADGE_TONES, H2_FIT, WRAP } from "./pressLayout";
import { servicePath } from "../data/services";
// This page's own styles (index.css has the shared ones).
import "../styles/services.css";

/* Pieces shared by the Services overview and each service's own page. Their
   styles (sv-*) live in styles/services.css; the rest is the Our Company
   page's press look (svc-card, svc-badge, oc-watermark, oc-cta). */

export const WHATSAPP_HREF = "https://wa.me/916380658876";

/** A heading whose last words take the italic accent: [plain, accent]. */
export function Heading({ as: Tag = "h2", parts, tone = "dark", className = "" }) {
  const [plain, accent] = parts;
  return (
    <Tag className={`${H2_FIT} leading-[1.1] ${tone === "light" ? "text-white" : "text-vz-ink"} ${className}`}>
      {plain} {accent && <Accent tone={tone}>{accent}</Accent>}
    </Tag>
  );
}

const pad = (i) => String(i + 1).padStart(2, "0");

/** A card with a glossy badge, a faint running number, a title and a line of
 *  text; its icon is also drawn large and faint in the corner. Card text is
 *  set ragged-right: justified, a narrow column opens wide gaps. */
export function InfoCard({ index, tone = index, title, text, Icon }) {
  return (
    <li className="svc-card reveal group relative isolate flex flex-col overflow-hidden rounded-3xl bg-white p-6 short:p-5">
      <span aria-hidden="true" className="svc-card-glow" />
      <Icon className="oc-watermark" strokeWidth={1.2} aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <span aria-hidden="true" className={`svc-badge svc-badge--sm ${BADGE_TONES[tone % BADGE_TONES.length]}`}>
          <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
        </span>
        <span aria-hidden="true" className="sv-num">
          {pad(index)}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-bold leading-snug text-vz-ink short:mt-4 short:text-base">{title}</h3>
      <p className="mt-2 text-left text-[15px] leading-relaxed text-slate-600 short:text-sm">{text}</p>
    </li>
  );
}

/** A whole service as one link: badge, name, summary and an arrow that
 *  turns on hover. `compact` drops the summary, for the "more services" row. */
export function ServiceCard({ service, index, compact = false }) {
  const { Icon, name, short, summary } = service;
  return (
    <li className="reveal">
      <Link
        to={servicePath(service)}
        className="svc-card group relative isolate flex h-full flex-col overflow-hidden rounded-3xl bg-white p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-indigo short:p-5"
      >
        <span aria-hidden="true" className="svc-card-glow" />
        {!compact && <Icon className="oc-watermark" strokeWidth={1.2} aria-hidden="true" />}
        <div className={`flex gap-4 ${compact ? "items-center" : "items-start justify-between"}`}>
          <span aria-hidden="true" className={`svc-badge ${compact ? "svc-badge--xs" : ""} ${BADGE_TONES[index % BADGE_TONES.length]}`}>
            <Icon className={`relative z-10 ${compact ? "h-[18px] w-[18px]" : "h-6 w-6"}`} strokeWidth={1.8} />
          </span>
          {compact ? (
            <span className="min-w-0 flex-1">
              <span className="block font-bold leading-snug text-vz-ink">{name}</span>
              <span className="block text-sm text-slate-500">{short}</span>
            </span>
          ) : (
            <span aria-hidden="true" className="sv-num">
              {pad(index)}
            </span>
          )}
          {compact && <ArrowUpRight className="sv-arrow h-5 w-5 flex-none" aria-hidden="true" />}
        </div>
        {!compact && (
          <>
            <h3 className="mt-5 text-xl font-bold leading-snug text-vz-ink short:mt-4 short:text-lg">{name}</h3>
            <p className="mt-2 text-left text-[15px] leading-relaxed text-slate-600 short:text-sm">{summary}</p>
            <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-sf-indigo short:pt-4">
              Explore service
              <ArrowUpRight className="sv-arrow h-4 w-4" aria-hidden="true" />
            </span>
          </>
        )}
      </Link>
    </li>
  );
}

/** The close: a night-indigo card with the call to action, and the service's
 *  icon on a stack of glass tiles beside it. */
export function CloseCard({ title, text, cta, also, Icon }) {
  return (
    <section className="relative isolate overflow-hidden bg-white py-16 lg:py-20 short:py-12">
      <div className={WRAP}>
        <div className="oc-cta relative isolate overflow-hidden rounded-[2.5rem] text-white lg:grid lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-center">
          <span className="oc-cta-dots" aria-hidden="true" />
          <div className="relative z-10 px-6 py-12 sm:px-12 lg:py-16 lg:pl-16 xl:pl-20">
            <Heading parts={title} tone="light" />
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 lg:text-[17px]">{text}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Pill to="/contact" variant="light" arrow>
                {cta}
              </Pill>
              {also ? (
                <Pill to={also.to} variant="outline-light">
                  {also.label}
                </Pill>
              ) : (
                <Pill href={WHATSAPP_HREF} target="_blank" rel="noreferrer" variant="outline-light" icon={FaWhatsapp}>
                  Chat on WhatsApp
                </Pill>
              )}
            </div>
          </div>

          <div className="sv-cta-mark hidden lg:flex" aria-hidden="true">
            <span className="sv-cta-tile sv-cta-tile--back" />
            <span className="sv-cta-tile sv-cta-tile--mid" />
            <span className="sv-cta-tile sv-cta-tile--front">
              <Icon className="h-14 w-14" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
