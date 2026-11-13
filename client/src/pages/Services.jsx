import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarCheck, Cpu, LayoutGrid, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Eyebrow, Pill, Rule } from "../components/PressUI";
import { SCREEN, SCREEN_PAD, WRAP } from "../components/pressLayout";
import { CloseCard, Heading, ServiceCard, WHATSAPP_HREF } from "../components/ServiceUI";
import { ENGAGEMENT, SERVICES } from "../data/services";
import { useSeo } from "../seo/useSeo";
import { PAGES } from "../seo/site";

/* Services overview, in the Our Company page's press look: the hero with a
   photo under a navy shade, every service as a card, how an engagement runs
   on the navy band, and the close. Each service has its own page
   (ServiceDetail.jsx); their content is in data/services.js. */

const AREAS = [
  { label: "Textbooks & Book Chapters", Icon: BookOpen },
  { label: "Patents, Trademarks & Copyright", Icon: ShieldCheck },
  { label: "IEEE Conference Papers", Icon: Cpu },
  { label: "Academic Events & Upskilling", Icon: CalendarCheck },
];

function Hero() {
  return (
    <header className="oc-hero relative isolate flex flex-col overflow-hidden text-white lg:min-h-[calc(100svh-7.6rem)]">
      <img
        src="/assets/image/services/overview-hero.webp"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_50%]"
      />
      <span className="oc-hero-shade" aria-hidden="true" />

      <div className={`${WRAP} flex flex-1 items-center py-16 lg:py-12 short:py-8`}>
        <div className="max-w-2xl">
          <Eyebrow tone="light" icon={LayoutGrid}>
            What We Do
          </Eyebrow>
          <h1 className="mt-6 text-[2.25rem] leading-[1.1] text-white sm:text-5xl lg:text-[clamp(2.4rem,min(4vw,7.4svh),3.6rem)] short:mt-4">
            Publishing, IP &amp; Academic <span className="hero-accent hero-accent--light">Services</span>
          </h1>
          <span className="oc-hero-rule mt-6 block h-1 w-20 rounded-full short:mt-4" aria-hidden="true" />
          <p className="mt-6 text-base leading-relaxed text-white/80 lg:text-[17px] short:mt-4 short:text-[15px]">
            One team for the work that builds an academic career: textbooks and indexed book chapters, patents, trademarks and copyright, IEEE conference papers, academic events and professional upskilling.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap short:mt-6">
            <Pill href="#all-services" variant="light" arrow>
              Explore Services
            </Pill>
            <Pill href={WHATSAPP_HREF} target="_blank" rel="noreferrer" variant="outline-light" icon={FaWhatsapp}>
              Chat on WhatsApp
            </Pill>
          </div>
        </div>
      </div>

      <div className="oc-hero-stats">
        <ul className={`${WRAP} grid grid-cols-2 lg:grid-cols-4`}>
          {AREAS.map(({ label, Icon }, i) => (
            <li
              key={label}
              className={`flex items-center gap-3 py-4 lg:py-5 short:py-3.5 ${i % 2 ? "pl-4 sm:pl-6" : "pr-2"} ${
                i > 1 ? "border-t border-white/15 lg:border-t-0" : ""
              } ${i ? "lg:border-l lg:border-white/15 lg:pl-8" : ""}`}
            >
              <span className="oc-hero-icon" aria-hidden="true">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </span>
              <span className="text-sm font-semibold leading-snug text-white sm:text-[15px]">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/** Every service as a card; the eighth cell points book authors to the
 *  Publishing page. */
function AllServices() {
  return (
    <section id="all-services" className={`vz-services relative isolate scroll-mt-24 overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
      <div className={WRAP}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <Rule />
            <Heading parts={["Seven Ways We Support Your", "Work"]} className="reveal mt-5" />
          </div>
          <p className="reveal text-[15px] leading-relaxed text-slate-600 lg:text-base">
            Each service has a dedicated team and a clear process, from the first consultation to publication, registration or event day. Choose a service to see what it covers.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4 lg:mt-12 short:mt-6 short:gap-3">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
          <li className="reveal">
            <Link
              to="/book-publishing"
              className="svc-feature group relative isolate flex h-full flex-col justify-between overflow-hidden rounded-3xl p-6 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-indigo"
            >
              <span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Writing a book?</span>
                <span className="mt-3 block font-display text-2xl font-bold leading-tight">
                  Editing, ISBN, cover design, printing and distribution
                </span>
              </span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
                Book Publishing
                <ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

/** How an engagement runs: four numbered glass cards on the navy band. */
function HowWeWork() {
  return (
    <section className="vz-shelf-band relative isolate overflow-hidden py-16 text-white lg:py-24 short:py-14">
      <div className={WRAP}>
        <div className="max-w-3xl">
          <Rule tone="dark" />
          <Heading parts={["How We", "Work"]} tone="light" className="reveal mt-5" />
          <p className="reveal mt-5 text-base leading-relaxed text-white/80 lg:text-[17px]">
            Whichever service you choose, the work follows the same four steps, with one team keeping you informed throughout.
          </p>
        </div>

        <ol className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 short:mt-6">
          {ENGAGEMENT.map(({ title, text, Icon }, i) => (
            <li key={title} className="oc-glass reveal relative rounded-3xl p-6 short:p-5">
              <div className="flex items-center justify-between">
                <span aria-hidden="true" className={`svc-badge svc-badge--sm ${["", "svc-badge--pink", "svc-badge--sky", "svc-badge--emerald"][i]}`}>
                  <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                </span>
                <span aria-hidden="true" className="font-display text-4xl font-bold leading-none text-white/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-left text-[15px] leading-relaxed text-white/75 short:text-sm">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function Services() {
  useSeo(PAGES["/services"]);
  return (
    <main className="overflow-x-clip bg-white text-slate-800">
      <Hero />
      <AllServices />
      <HowWeWork />
      <CloseCard
        eyebrow="Not sure where to start?"
        eyebrowIcon={MessageCircleQuestion}
        title={["Tell Us About Your", "Project"]}
        text="Share what you are working on, whether a manuscript, an invention, a paper or an event, and our team will point you to the right support."
        cta="Get in Touch"
        Icon={LayoutGrid}
      />
    </main>
  );
}
