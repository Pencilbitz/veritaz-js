import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Download,
  ArrowLeft,
  Book,
  Award, // Changed from Certificate to Award
  CalendarCheck,
  Scroll,
  Users,
  GraduationCap,
  Building2,
  CalendarClock,
  CalendarX2,
  Presentation,
  Sparkles,
  Ticket,
} from "lucide-react";
import { supabase, EVENT_SELECT } from "../lib/supabase";
import { Accent, Eyebrow, Pill } from "../components/PressUI";
import { BADGE_TONES, H2_FIT, SCREEN, SCREEN_PAD, WRAP } from "../components/pressLayout";
import { useSeo } from "../seo/useSeo";
import { NOT_FOUND, eventMeta } from "../seo/site";

/* One event, in the home page's "press" look: a lavender hero with the
   college and topic beside the poster (set in a white mat on a violet
   backing), the date, time, place and contacts on a ticket along its foot,
   then our services as glass cards on a navy band. The ev-* styles live in
   styles/events.css. */

const SERVICES = [
  { title: "Textbook Publications", Icon: Book },
  { title: "Patent Grant Support", Icon: Award },
  { title: "Organizing Educational Events", Icon: CalendarCheck },
  { title: "SCI & Scopus Journal Publication", Icon: Scroll },
  { title: "IEEE Conference Publications", Icon: Users },
  { title: "Ph.D. Assistance", Icon: GraduationCap },
];
const SERVICE_TONES = [BADGE_TONES[0], BADGE_TONES[1], BADGE_TONES[2], BADGE_TONES[4], BADGE_TONES[3], BADGE_TONES[0]];

/** Violet waves along the hero's foot, running into the navy band below. */
function HeroWaves({ fill = "var(--color-sf-navy)" }) {
  return (
    <svg aria-hidden="true" className="ev-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ev-detail-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#ddd6fe" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" fill="url(#ev-detail-wave)" opacity="0.55" />
      <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill={fill} />
    </svg>
  );
}

/** While loading, and when no event matches: a calm lavender screen with a
 *  glossy badge over the message. */
function StatusScreen({ icon: Icon, tone = "", children }) {
  return (
    <main className="overflow-x-clip bg-white text-slate-800">
      <section className="vz-hero-v2 relative isolate flex min-h-[calc(100svh-7.6rem)] items-center justify-center overflow-hidden px-4 pb-24 pt-16">
        <HeroWaves fill="#fff" />
        <span aria-hidden="true" className="ev-halftone left-[8%] top-10 h-48 w-48" />
        <div className="flex flex-col items-center gap-6 text-center">
          <span aria-hidden="true" className={`svc-badge ${tone}`}>
            <Icon className="relative z-10 h-6 w-6" strokeWidth={1.8} />
          </span>
          {children}
        </div>
      </section>
    </main>
  );
}

const FACT_LABEL = "text-xs font-bold uppercase tracking-[0.14em] text-slate-500";
const FACT_VALUE = "mt-1 text-[15px] font-bold leading-snug text-vz-ink";

export default function UpcomingEvents() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data: events, error } = await supabase
          .from("veritaz_events")
          .select(EVENT_SELECT);

        if (error) throw error;


        const selectedEvent = (events || []).find(
          (event) => String(event.id) === String(eventId)
        );


        setEvent(selectedEvent || null);
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useSeo(event ? eventMeta(event) : loading ? null : NOT_FOUND);

  if (loading) {
    return (
      <StatusScreen icon={CalendarClock}>
        <p role="status" className="text-xl font-bold text-slate-600">Loading Event...</p>
      </StatusScreen>
    );
  }

  if (!event || event.message) {
    return (
      <StatusScreen icon={CalendarX2} tone="svc-badge--pink">
        <h1 className="text-3xl leading-tight text-vz-ink sm:text-4xl">
          Event Not Found
        </h1>
      </StatusScreen>
    );
  }

  const facts = [
    { label: "Date", Icon: CalendarDays, tone: "", value: event.date || "Flexible Dates" },
    { label: "Time", Icon: Clock3, tone: "svc-badge--sky", value: event.time || "TBD" },
    { label: "Location", Icon: MapPin, tone: "svc-badge--emerald", value: event.location || "Campus Venue" },
    {
      label: "Contact",
      Icon: Phone,
      tone: "svc-badge--pink",
      value: (
        <>
          {event.contact1 && (
            <a href={`tel:${event.contact1}`} className="block truncate rounded-sm hover:text-sf-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-violet">
              {event.contact1}
            </a>
          )}
          {event.contact2 && (
            <a href={`tel:${event.contact2}`} className="block truncate rounded-sm hover:text-sf-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-violet">
              {event.contact2}
            </a>
          )}
        </>
      ),
    },
  ];

  return (
    <main className="overflow-x-clip bg-white text-slate-800">
      {/* ================= HERO / EVENT DETAILS =================
          One grid, so phones can read poster, details, ticket, then the
          buttons, while wide screens set the details and buttons beside the
          poster and run the ticket along the foot. */}
      <header className="vz-hero-v2 relative isolate overflow-hidden text-vz-ink lg:flex lg:min-h-[calc(100svh-7.6rem)] lg:flex-col">
        <HeroWaves />
        <span aria-hidden="true" className="ev-halftone right-[3%] top-4 hidden h-56 w-56 lg:block" />

        <div className={`${WRAP} pb-24 pt-10 sm:pb-28 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pb-[4.5rem] lg:pt-6 short:pb-14 short:pt-4`}>
          <div className="grid gap-x-16 gap-y-10 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto_auto] lg:gap-y-6 xl:gap-x-20 short:gap-y-4">
            {/* Back link: first on phones too, above the poster */}
            <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
              <Link
                to="/events"
                className="group inline-flex items-center gap-2.5 rounded-full text-sm font-semibold text-sf-indigo transition-colors hover:text-sf-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-violet"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-vz-line">
                  <ArrowLeft size={16} aria-hidden="true" className="motion-safe:transition-transform group-hover:-translate-x-0.5" />
                </span>
                Back to Events
              </Link>
            </div>

            {/* College and topic */}
            <div className="order-2 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
              <div>
                <Eyebrow icon={Building2}>College</Eyebrow>
                <h1 className="mt-3 text-balance text-[2rem] leading-[1.12] text-vz-ink sm:text-[2.5rem] lg:text-[clamp(2rem,min(3.2vw,6svh),2.75rem)]">
                  {event.collegeName}
                </h1>
              </div>

              <div className="mt-6 short:mt-4">
                <Eyebrow icon={Presentation}>Topic</Eyebrow>
                <h2 className="ev-topic mt-3 text-xl leading-snug sm:text-2xl lg:text-[clamp(1.25rem,min(1.9vw,3.5svh),1.625rem)]">
                  {event.topic}
                </h2>
              </div>
            </div>

            {/* Dynamic Action Buttons */}
            <div className="order-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:order-none lg:col-start-1 lg:row-start-3 lg:self-start">
              <Pill
                href={event.registrationLink || "#"}
                target={event.registrationLink ? "_blank" : "_self"}
                rel="noreferrer"
                arrow
              >
                {event.registerButtonText || "Register Now"}
              </Pill>

              {/* Conditional Download Option matching PHP implementation if it's a PDF target */}
              {event.poster && event.poster.toLowerCase().endsWith('.pdf') && (
                <Pill href={`${event.poster}`} download variant="outline" icon={Download}>
                  Download Certificate
                </Pill>
              )}
            </div>

            {/* Poster, in a white mat on a violet backing */}
            <div className="order-1 min-w-0 lg:order-none lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center">
              <div className="ev-frame relative mx-3 sm:mx-8 lg:mx-0 lg:ml-auto lg:mr-4 lg:max-w-[calc((100svh-19.5rem)*1.38)]">
                <span aria-hidden="true" className="ev-frame-back" />
                <div className="ev-mat rounded-[2rem] p-2.5">
                  <img
                    src={`${event.poster}`}
                    alt={event.topic}
                    className="ev-proof block aspect-[1024/724] w-full rounded-[1.5rem] object-contain"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=No+Event+Media" }}
                  />
                </div>
                <span aria-hidden="true" className="absolute -bottom-5 -left-4 sm:-left-5">
                  <span className="svc-badge svc-badge--amber">
                    <Ticket className="relative z-10 h-6 w-6" strokeWidth={1.8} />
                  </span>
                </span>
              </div>
            </div>

            {/* Date, time, place and contacts on a ticket */}
            <div className="ev-ticket-wrap order-3 min-w-0 lg:order-none lg:col-span-2 lg:row-start-4 lg:mt-3 short:mt-1">
              <dl className="ev-ticket relative grid overflow-hidden rounded-3xl sm:grid-cols-2 lg:grid-cols-4">
                {facts.map(({ label, Icon, tone, value }, i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-4 border-dashed border-violet-200 px-6 py-5 lg:px-7 short:py-4 ${i ? "border-t" : ""} ${i === 1 ? "sm:border-l sm:border-t-0" : ""} ${i === 2 ? "sm:border-l-0" : ""} ${i === 3 ? "sm:border-l" : ""} ${i > 0 ? "lg:border-l lg:border-t-0" : ""}`}
                  >
                    <span aria-hidden="true" className={`svc-badge svc-badge--sm ${tone}`}>
                      <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <dt className={FACT_LABEL}>{label}</dt>
                      <dd className={FACT_VALUE}>{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </header>

      {/* ================= PREMIUM SERVICES SECTION ================= */}
      <section className={`ev-navy relative isolate overflow-hidden text-white ${SCREEN_PAD} ${SCREEN}`}>
        <span aria-hidden="true" className="ev-halftone ev-halftone--light -right-10 bottom-0 h-72 w-72" />
        <div className={WRAP}>
          <div className="max-w-3xl">
            <Eyebrow tone="light" icon={Sparkles}>Veritaz International</Eyebrow>
            <h2 className={`reveal mt-5 ${H2_FIT} leading-[1.1] text-white short:mt-3`}>
              Our Premium <Accent tone="light">Services</Accent>
            </h2>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5 short:mt-6 short:gap-3">
            {SERVICES.map(({ title, Icon }, i) => (
              <li key={title} className="ev-glass reveal relative isolate flex items-center gap-5 overflow-hidden rounded-3xl p-5 sm:min-h-[9.5rem] sm:flex-col sm:items-start sm:justify-between sm:gap-6 sm:p-6 lg:min-h-[min(11rem,22svh)] lg:p-7 short:p-5">
                <Icon className="ev-glass-mark" strokeWidth={1.2} aria-hidden="true" />
                <span aria-hidden="true" className={`svc-badge ${SERVICE_TONES[i]}`}>
                  <Icon className="relative z-10 h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="text-lg font-bold leading-snug text-white lg:text-xl short:text-lg">{title}</h3>
                <span aria-hidden="true" className="ev-glass-line" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
