import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, BellRing, CalendarClock, History } from "lucide-react";
import CompletedEvents from "../components/CompletedEvents";
import { supabase, EVENT_SELECT } from "../lib/supabase";
import { sortByEventDate } from "../lib/eventDate";
import StateFilterBar from "../components/StateFilterBar";
import { Accent, Eyebrow, Rule, Swash } from "../components/PressUI";
import { H2_FIT, WRAP } from "../components/pressLayout";
import { useSeo } from "../seo/useSeo";
import { PAGES } from "../seo/site";

/* Events, in the home page's "press" look: a lavender hero for the upcoming
   events (their posters in a row you page through, or, when there are none,
   a desk photo with a wall calendar pinned over it), then the completed
   events as cards on a white band. The ev-* styles live in styles/events.css. */

const DESK_PHOTO = "/assets/image/our-company/laptop-books.webp";

const ROUND_BUTTON =
  "ev-round flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white text-vz-ink shadow-sm ring-1 ring-vz-line transition-colors hover:bg-sf-indigo hover:text-white hover:ring-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-violet disabled:pointer-events-none disabled:opacity-35";

const prefersCalm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Violet waves along the hero's foot, running into the white band below. */
function HeroWaves() {
    return (
        <svg aria-hidden="true" className="vz-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <defs>
                <linearGradient id="ev-wave" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#a78bfa" />
                    <stop offset="0.5" stopColor="#ddd6fe" />
                    <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" fill="url(#ev-wave)" opacity="0.5" />
            <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill="#fff" />
        </svg>
    );
}

/** The wall calendar pinned over the desk photo: a month of day cells with
 *  one day marked and a few dotted. Decoration only. */
const CAL_CELLS = Array.from({ length: 35 }, (_, i) => {
    if (i < 3 || i > 32) return "ev-cal-cell ev-cal-cell--off";
    if (i === 17) return "ev-cal-cell ev-cal-cell--on";
    if (i === 9 || i === 24 || i === 29) return "ev-cal-cell ev-cal-cell--dot";
    return "ev-cal-cell";
});

function CalendarStage() {
    return (
        <div className="ev-stage relative mx-4 mb-6 sm:mx-10 lg:mb-0 lg:ml-6 lg:mr-4" aria-hidden="true">
            <span className="ev-stage-back" />
            <span className="ev-halftone -left-10 -top-10 h-44 w-44" />
            <div className="ev-stage-frame overflow-hidden rounded-[2rem]">
                <img
                    src={DESK_PHOTO}
                    alt=""
                    fetchPriority="high"
                    className="ev-stage-photo block aspect-[4/3] w-full object-cover object-[50%_62%] lg:aspect-auto lg:h-[min(30rem,calc(100svh-15rem))]"
                />
            </div>

            <div className="ev-cal absolute -bottom-8 -left-3 w-[9.5rem] sm:-left-8 sm:w-[13rem] lg:-bottom-6 lg:-left-12 lg:w-[clamp(12rem,15vw,15rem)]">
                <span className="ev-cal-head">
                    <span className="ev-cal-ring left-[22%]" />
                    <span className="ev-cal-ring right-[22%]" />
                    <i className="w-[62%]" />
                    <i />
                </span>
                <span className="ev-cal-grid">
                    {CAL_CELLS.map((cls, i) => (
                        <span key={i} className={cls} />
                    ))}
                </span>
            </div>

            <span className="absolute -top-6 right-6 sm:right-10">
                <span className="svc-badge svc-badge--pink">
                    <BellRing className="relative z-10 h-6 w-6" strokeWidth={1.8} />
                </span>
            </span>
        </div>
    );
}

/** The hero's title, with the accent's brush stroke drawing in on load. */
function HeroTitle() {
    return (
        <h1
            id="ev-upcoming-title"
            className="mt-5 text-[2.25rem] leading-[1.1] text-vz-ink sm:text-5xl lg:text-[clamp(2.4rem,min(3.9vw,7.2svh),3.5rem)] short:mt-3"
        >
            Upcoming{" "}
            <span className="relative inline-block">
                <span className="hero-accent">Events</span>
                <Swash className="hero-swash--word" />
            </span>
        </h1>
    );
}

/** No upcoming events: the title and a card saying so, beside the calendar. */
function EmptyHero({ filter }) {
    return (
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            <div className="min-w-0">
                <Rule />
                <HeroTitle />
                {filter}
                <div className="ev-empty svc-card relative isolate mt-8 flex items-start gap-5 overflow-hidden rounded-3xl p-6 sm:p-7 short:mt-6 short:p-5">
                    <span aria-hidden="true" className="svc-card-glow" />
                    <span aria-hidden="true" className="svc-badge svc-badge--amber">
                        <CalendarClock className="relative z-10 h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xl font-bold leading-snug text-vz-ink">No Upcoming Events</p>
                        <p className="mt-2 text-left text-base leading-relaxed text-slate-600 lg:text-[17px]">Please check back soon for new event announcements.</p>
                    </div>
                </div>
            </div>

            <CalendarStage />
        </div>
    );
}

/** Upcoming events: their posters in a row, paged by the arrows or by
 *  swiping. Each poster opens its event. Nothing moves on its own. */
function UpcomingRow({ events, filter }) {
    const trackRef = useRef(null);
    const [edge, setEdge] = useState({ start: true, end: false });

    const updateEdges = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const start = el.scrollLeft <= 4;
        const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
        setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    }, []);

    useEffect(() => {
        updateEdges();
        window.addEventListener("resize", updateEdges);
        return () => window.removeEventListener("resize", updateEdges);
    }, [events, updateEdges]);

    // Scroll to the poster before or after the first one in view, measured
    // from the posters themselves so it always lands on a snap point.
    const page = (direction) => {
        const el = trackRef.current;
        if (!el) return;
        const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
        const stops = [...el.children].map((li) => li.offsetLeft - pad);
        const current = stops.reduce((best, x, i) => (Math.abs(x - el.scrollLeft) < Math.abs(stops[best] - el.scrollLeft) ? i : best), 0);
        const next = Math.min(Math.max(current + direction, 0), stops.length - 1);
        el.scrollTo({ left: stops[next], behavior: prefersCalm() ? "auto" : "smooth" });
    };

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="min-w-0">
                    <Rule />
                    <HeroTitle />
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-label="Previous events" className={ROUND_BUTTON}>
                        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => page(1)} disabled={edge.end} aria-label="Next events" className={ROUND_BUTTON}>
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {filter}

            <div role="region" aria-roledescription="carousel" aria-labelledby="ev-upcoming-title" className="mt-8 short:mt-5">
                {/* The inset keeps focus rings and the cards' lift unclipped. */}
                <ul
                    ref={trackRef}
                    onScroll={updateEdges}
                    className="ev-track relative -mx-3 flex snap-x snap-mandatory scroll-pl-3 gap-5 overflow-x-auto px-3 pb-8 pt-3 lg:gap-6"
                >
                    {upcomingCards(events)}
                </ul>
            </div>
        </>
    );
}

function upcomingCards(events) {
    return events.map((event) => (
        <li key={event.id} className="flex-none basis-[85%] snap-start sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-3rem)/3)]">
            <Link
                to={`/upcoming-events/${event.id}`}
                className="svc-card group relative isolate block overflow-hidden rounded-3xl bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sf-violet"
            >
                <span aria-hidden="true" className="svc-card-glow" />
                <span className="ev-proof relative block aspect-[1024/724] overflow-hidden rounded-2xl">
                    <img
                        src={`${event.poster}`}
                        alt={event.eventTitle || "Upcoming Event"}
                        className="ev-poster-img block h-full w-full object-contain"
                        onError={(e) => { e.target.src = "https://placehold.co/300x450/EEE/31343C?text=No+Poster" }}
                    />
                </span>
                <span aria-hidden="true" className="ev-go">
                    <span className="svc-badge svc-badge--sm">
                        <ArrowUpRight className="relative z-10 h-5 w-5" strokeWidth={2} />
                    </span>
                </span>
            </Link>
        </li>
    ));
}

/** Hero: the upcoming events, or word that there are none yet. Fills one
 *  screen under the navbar on wide screens. */
function UpcomingHero({ events, hasAny, states, filter, onFilterChange }) {
    const filterBar = hasAny ? (
        <StateFilterBar states={states} value={filter} onChange={onFilterChange} className="mt-6 short:mt-4" />
    ) : null;

    return (
        <header className="vz-hero-v2 relative isolate overflow-hidden text-vz-ink lg:flex lg:min-h-[calc(100svh-7.6rem)] lg:flex-col">
            <HeroWaves />
            <span aria-hidden="true" className="ev-halftone right-[4%] top-6 hidden h-56 w-56 lg:block" />

            <div className={`${WRAP} pb-24 pt-12 sm:pb-28 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pb-20 lg:pt-8 short:pb-14 short:pt-5`}>
                {events.length === 0 ? (
                    <EmptyHero filter={filterBar} />
                ) : (
                    <UpcomingRow events={events} filter={filterBar} />
                )}
            </div>
        </header>
    );
}

export default function Events() {
    const [events, setEvents] = useState([]);
    const [upcomingStateFilter, setUpcomingStateFilter] = useState("");
    const [completedStateFilter, setCompletedStateFilter] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data, error } = await supabase
                    .from("veritaz_events")
                    .select(EVENT_SELECT);

                if (error) throw error;

                console.log("Events:", data);
                setEvents(data || []);
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };

        fetchEvents();
    }, []);

    const upcomingEventsRaw = events.filter(e => e.status !== "Completed");
    const completedEventsRaw = events.filter(e => e.status === "Completed");

    const upcomingStates = [...new Set(upcomingEventsRaw.map(e => e.state).filter(Boolean))].sort();
    const completedStates = [...new Set(completedEventsRaw.map(e => e.state).filter(Boolean))].sort();

    // Soonest first for upcoming, most recently completed first for completed
    const upcomingEvents = sortByEventDate(
        upcomingStateFilter ? upcomingEventsRaw.filter(e => e.state === upcomingStateFilter) : upcomingEventsRaw,
        "asc"
    );
    const completedEvents = sortByEventDate(
        completedStateFilter ? completedEventsRaw.filter(e => e.state === completedStateFilter) : completedEventsRaw,
        "desc"
    );

    useSeo(PAGES["/events"]);

    return (
        <main className="overflow-x-clip bg-white text-slate-800">
            <UpcomingHero
                events={upcomingEvents}
                hasAny={upcomingEventsRaw.length > 0}
                states={upcomingStates}
                filter={upcomingStateFilter}
                onFilterChange={setUpcomingStateFilter}
            />

            {/* Completed Events: the heading and its lead side by side, then
                the toolbar and the cards. It runs as long as the list. */}
            <section className="vz-draft relative isolate overflow-hidden py-16 lg:min-h-[calc(100svh-5rem)] lg:py-20 short:py-12">
                <span aria-hidden="true" className="ev-halftone -right-16 top-24 hidden h-64 w-64 lg:block" />
                <div className={WRAP}>
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
                        <div className="min-w-0">
                            <Eyebrow icon={History}>Previous Programs</Eyebrow>
                            <h2 className={`reveal mt-5 ${H2_FIT} leading-[1.1] text-vz-ink short:mt-3`}>
                                Completed <Accent>Events</Accent>
                            </h2>
                        </div>
                        <p className="reveal text-base leading-relaxed text-slate-600 max-sm:text-left lg:text-[17px]">
                            Explore our successfully completed Faculty Development Programs, Workshops, Conferences and Webinars conducted across various institutions.
                        </p>
                    </div>

                    <div className="mt-10 lg:mt-12 short:mt-8">
                        <CompletedEvents
                            events={completedEvents}
                            states={completedStates}
                            stateFilter={completedStateFilter}
                            onStateFilterChange={setCompletedStateFilter}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}
