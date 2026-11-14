import { Fragment } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CircleCheck, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Eyebrow, Pill, Rule } from "../components/PressUI";
import { BADGE_TONES, SCREEN, SCREEN_PAD, WRAP } from "../components/pressLayout";
import { CloseCard, Heading, InfoCard, ServiceCard, WHATSAPP_HREF } from "../components/ServiceUI";
import { SERVICES, findService } from "../data/services";
import { useSeo } from "../seo/useSeo";
import { PAGES } from "../seo/site";
import LOGO from "../components/logo";
import NotFound from "./NotFound";

/* One service's page, built from its entry in data/services.js, in the Our
   Company page's press look: a hero with the photo under a navy shade, then
   only the sections the service has data for. The light sections alternate
   white and lavender in whatever order they appear; the coverage section is
   always the navy band. */

const LEAD = "text-base leading-relaxed text-slate-600 lg:text-[17px] short:text-[15px]";
const LIGHT_BANDS = ["vz-draft", "vz-services"];

function Hero({ service }) {
  const { hero, h1, lead, cta, highlights } = service;
  const [before, accent, after] = h1;
  return (
    <header className="oc-hero relative isolate flex flex-col overflow-hidden text-white lg:min-h-[calc(100svh-7.6rem)]">
      <img
        {...hero}
        alt=""
        fetchPriority="high"
        decoding="async"
        style={{
          objectPosition: service.heroPosition || "72% 55%",
          imageRendering: "-webkit-optimize-contrast",
        }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <span className="sv-hero-shade" aria-hidden="true" />

      <div className={`${WRAP} flex flex-1 items-center py-14 lg:py-12 short:py-8`}>
        <div className="max-w-3xl">
          <h1 className="text-[2.25rem] leading-[1.1] text-white sm:text-5xl lg:text-[clamp(2.4rem,min(4vw,7.4svh),3.6rem)]">
            {before && `${before} `}
            <span className="hero-accent hero-accent--light">{accent}</span>
            {after && ` ${after}`}
          </h1>
          <span className="oc-hero-rule mt-6 block h-1 w-20 rounded-full short:mt-4" aria-hidden="true" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 lg:text-[17px] short:mt-4 short:text-[15px]">{lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap short:mt-6">
            <Pill to="/contact" variant="light" arrow>
              {cta}
            </Pill>
            <Pill href={WHATSAPP_HREF} target="_blank" rel="noreferrer" variant="outline-light" icon={FaWhatsapp}>
              Chat on WhatsApp
            </Pill>
          </div>
        </div>
      </div>

      <div className="oc-hero-stats">
        <ul className={`${WRAP} grid grid-cols-2 lg:grid-cols-4`}>
          {highlights.map(({ label, Icon: HIcon }, i) => (
            <li
              key={label}
              className={`flex items-center gap-3 py-4 lg:py-5 short:py-3.5 ${i % 2 ? "pl-4 sm:pl-6" : "pr-2"} ${
                i > 1 ? "border-t border-white/15 lg:border-t-0" : ""
              } ${i ? "lg:border-l lg:border-white/15 lg:pl-8" : ""}`}
            >
              <span className="oc-hero-icon" aria-hidden="true">
                <HIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </span>
              <span className="text-sm font-semibold leading-snug text-white sm:text-[15px]">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/** The opening: the photo on a violet backing with the logo as a seal, beside
 *  the text, its pull-quote and any short list of reasons. */
function Overview({ data, band }) {
  const { eyebrow, title, image, imageAlt, body, callout, points } = data;
  return (
    <section className={`${band} relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={`${WRAP} grid items-center gap-16 lg:grid-cols-2 lg:gap-20`}>
        <div className="oc-frame relative mx-3 mb-4 sm:mx-8 lg:m-0 lg:mr-6">
          <span className="oc-frame-back" aria-hidden="true" />
          <img
            {...image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            style={{ imageRendering: "-webkit-optimize-contrast" }}
            className="oc-frame-img reveal relative aspect-[4/3] w-full rounded-[2rem] object-cover lg:aspect-auto lg:h-[min(28rem,calc(100svh-13rem))]"
          />
          <span className="oc-seal" aria-hidden="true">
            <img {...LOGO} alt="" loading="lazy" />
          </span>
        </div>

        <div className="min-w-0">
          <Eyebrow icon={Sparkles}>{eyebrow}</Eyebrow>
          <Heading parts={title} className="reveal mt-5 short:mt-3" />
          {body.map((text) => (
            <p key={text} className={`mt-6 ${LEAD} short:mt-4`}>
              {text}
            </p>
          ))}
          {callout && (
            <p className="oc-callout mt-5 rounded-r-2xl py-4 pl-5 pr-4 text-base leading-relaxed text-slate-700 short:py-3">{callout}</p>
          )}
          {points && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 short:mt-4 short:gap-3">
              {points.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <CircleCheck className="mt-0.5 h-5 w-5 flex-none text-sf-violet" aria-hidden="true" />
                  <span>
                    <span className="block font-bold leading-snug text-vz-ink">{p.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/** Heading on the left and its lead on the right, as the Our Company page
 *  sets its card sections. */
function SectionHead({ eyebrow, title, text, tone = "dark" }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
      <div className="min-w-0">
        <Rule tone={tone} />
        <p className={`mt-5 text-xs font-bold uppercase tracking-[0.18em] ${tone === "light" ? "text-amber-300" : "text-sf-violet"}`}>{eyebrow}</p>
        <Heading parts={title} tone={tone} className="reveal mt-3" />
      </div>
      {text && (
        <p className={`reveal text-[15px] leading-relaxed max-sm:text-left lg:text-base ${tone === "light" ? "text-white/80" : "text-slate-600"}`}>{text}</p>
      )}
    </div>
  );
}

/** Odd-numbered card grids of four or more end on a navy card that asks the
 *  visitor to get in touch, so the last row is never left short. */
function Offerings({ data, band, cta }) {
  const { items } = data;
  const withCta = items.length > 3 && items.length % 2 === 1;
  const cols = items.length === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4";
  return (
    <section className={`${band} relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={WRAP}>
        <SectionHead {...data} />
        <ul className={`mt-10 grid gap-4 lg:mt-12 short:mt-6 short:gap-3 ${cols}`}>
          {items.map((item, i) => (
            <InfoCard key={item.title} index={i} {...item} />
          ))}
          {withCta && (
            <li className="reveal">
              <Link
                to="/contact"
                className="svc-feature group relative isolate flex h-full flex-col justify-between overflow-hidden rounded-3xl p-6 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-indigo"
              >
                <span>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Need guidance?</span>
                  <span className="mt-3 block font-display text-2xl font-bold leading-tight">Talk to our team about your project</span>
                </span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
                  {cta}
                  <ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

/** The process: heading on the left; the steps down a rail on the right,
 *  numbered in glossy badges (the rail draws itself as it scrolls in). */
function Steps({ data, band }) {
  const { eyebrow, title, text, items } = data;
  return (
    <section className={`${band} relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={`${WRAP} grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-20`}>
        <div className="min-w-0">
          <Rule />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sf-violet">{eyebrow}</p>
          <Heading parts={title} className="reveal mt-3" />
          <p className={`reveal mt-5 max-w-md max-sm:text-left ${LEAD}`}>{text}</p>
        </div>

        <div className="relative min-w-0">
          <span className="oc-rail" aria-hidden="true">
            <span className="oc-rail-fill" />
          </span>
          <ol className="relative grid gap-3 short:gap-2">
            {items.map(({ title: step, text: what }, i) => (
              <li key={step} className="reveal relative flex items-center gap-4 sm:gap-5">
                <span aria-hidden="true" className={`svc-badge svc-badge--sm z-10 ${BADGE_TONES[i % BADGE_TONES.length]}`}>
                  <span className="relative z-10 text-sm font-bold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <div className="svc-card relative isolate min-w-0 flex-1 overflow-hidden rounded-2xl bg-white px-5 py-4 short:py-2.5">
                  <span aria-hidden="true" className="svc-card-glow" />
                  <h3 className="text-base font-bold leading-snug text-vz-ink lg:text-[17px] short:text-[15px]">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step}
                  </h3>
                  <p className="mt-1 text-left text-sm leading-relaxed text-slate-600 short:text-[13px] short:leading-snug">{what}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** What the service covers, as labels on glass cards on the navy band. A
 *  `flow` group is a sequence, so it is numbered and joined by arrows. */
function Coverage({ data }) {
  const { groups } = data;
  return (
    <section className={`vz-shelf-band relative isolate overflow-hidden text-white ${SCREEN_PAD} ${SCREEN}`}>
      <div className={WRAP}>
        <SectionHead {...data} tone="light" />
        <div className={`mt-10 grid gap-4 lg:mt-12 short:mt-6 ${groups.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {groups.map(({ label, Icon, items, flow }, g) => (
            <div key={label} className="oc-glass reveal rounded-3xl p-6 sm:p-8 short:p-5">
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                <span aria-hidden="true" className={`svc-badge svc-badge--xs ${g ? "svc-badge--pink" : ""}`}>
                  <Icon className="relative z-10 h-4 w-4" strokeWidth={1.8} />
                </span>
                {label}
              </p>
              {flow ? (
                <ol className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {items.map((item, i) => (
                    <Fragment key={item}>
                      <li className="sv-chip">
                        <span className="sv-chip-num">{i + 1}</span>
                        {item}
                      </li>
                      {i < items.length - 1 && <ArrowRight className="hidden h-4 w-4 text-amber-300 sm:block" aria-hidden="true" />}
                    </Fragment>
                  ))}
                </ol>
              ) : (
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {items.map((item) => (
                    <li key={item} className="sv-chip">
                      <span className="sv-chip-dot" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Who the service is for. The heading takes the first cell of the grid, so
 *  the cards and heading fill whole rows together. */
function Audience({ data, band }) {
  const { eyebrow, title, items } = data;
  const cells = items.length + 1;
  const cols = cells % 3 === 0 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2";
  return (
    <section className={`${band} relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={WRAP}>
        <ul className={`grid gap-4 short:gap-3 ${cols}`}>
          <li className="flex flex-col justify-center pb-4 md:col-span-2 lg:col-span-1 lg:pb-0 lg:pr-8">
            <Rule />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sf-violet">{eyebrow}</p>
            <Heading parts={title} className="reveal mt-3" />
          </li>
          {items.map((item, i) => (
            <InfoCard key={item.title} index={i} tone={i + 1} {...item} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The other services, as a row of compact links. */
function MoreServices({ current, band }) {
  const others = SERVICES.map((s, i) => ({ s, i })).filter(({ s }) => s.slug !== current);
  return (
    <section className={`${band} relative isolate overflow-hidden py-16 lg:py-20 short:py-12`}>
      <div className={WRAP}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Rule />
            <Heading parts={["Explore More", "Services"]} className="reveal mt-5" />
          </div>
          <Pill to="/services" variant="outline" arrow className="self-start sm:self-auto">
            All Services
          </Pill>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 short:mt-6 short:gap-3">
          {others.map(({ s, i }) => (
            <ServiceCard key={s.slug} service={s} index={i} compact />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = findService(slug);
  useSeo(service ? PAGES[`/services/${service.slug}`] : null);

  if (!service) return <NotFound />;

  // The light sections take turns at white and lavender, in render order.
  let n = 0;
  const band = () => LIGHT_BANDS[n++ % LIGHT_BANDS.length];
  const { overview, offerings, steps, coverage, audience, close } = service;

  return (
    <main className="overflow-x-clip bg-white text-slate-800">
      <Hero service={service} />
      {overview && <Overview data={overview} band={band()} />}
      {offerings && <Offerings data={offerings} band={band()} cta={service.cta} />}
      {steps && <Steps data={steps} band={band()} />}
      {coverage && <Coverage data={coverage} />}
      {audience && <Audience data={audience} band={band()} />}
      <MoreServices current={service.slug} band={band()} />
      <CloseCard {...close} cta={service.cta} Icon={service.Icon} />
    </main>
  );
}
