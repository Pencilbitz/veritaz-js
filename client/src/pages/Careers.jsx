import { useEffect, useState } from 'react';
import {
  Briefcase,
  Send,
  FileText,
  MapPin,
  Monitor,
  Clock,
  GraduationCap,
  PenLine,
  Phone,
  Target,
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import { Accent, Pill, Rule } from '../components/PressUI';
import { BADGE_TONES, H2_FIT, SCREEN, SCREEN_PAD, WRAP } from '../components/pressLayout';
import { useSeo } from "../seo/useSeo";
import { PAGES } from "../seo/site";

/**
 * Careers — the public "we are open to applications" page.
 *
 * ---------------------------------------------------------------------------
 * Where the openings come from
 *
 * This page used to state, in a hardcoded aside, that no roles were listed. That
 * was the honest thing to render while there was no jobs data source — a card
 * reading "Editorial Assistant — Chennai" would have been a line typed into JSX,
 * and on a live company site that is not a placeholder, it is a lie: people spend
 * an afternoon writing an application against it.
 *
 * There is now a data source. `veritaz_careers` (migration/sql/004_careers.sql)
 * is written by the admin dashboard and read here, so HR can advertise or retire
 * a role without a code change and a deploy. Only rows with status 'Open' are
 * read; 'Closed' rows stay in the table for the record and never reach the site.
 *
 * The rule the old comment was protecting still holds, though: nothing on this
 * page is invented here. Every role shown is a row somebody in HR typed, and the
 * surrounding copy is either verifiable from the rest of the site or an
 * instruction to the reader. Resist the pull to pad this page out with benefits,
 * employee counts or testimonials.
 *
 * ---------------------------------------------------------------------------
 * Why "no roles listed" is a designed state, not a fallback
 *
 * Having no openings is the normal condition of this page, not an error — a small
 * publisher hires a few times a year. So the empty state is written out in full
 * and reads as deliberate. The two failure modes it exists to prevent are a blank
 * white area and a spinner that never resolves: both of those tell a reader
 * "the list failed to load, try again later", and the reader then leaves without
 * sending the email that was the point of the page.
 *
 * A fetch error lands on that same empty wording by design (see `load` below).
 * The email route beneath it works whether or not Supabase answered, so the page
 * stays useful; a raw PostgREST message on a careers page would help nobody who
 * could act on it.
 *
 * The one contact detail here is the published address already used by the footer,
 * the contact page and the book pages — info@veritazinternational.com. No HR name,
 * direct number or desk extension: those live in the HR system and a copy here
 * would drift the moment someone changes roles.
 *
 * ---------------------------------------------------------------------------
 * Look
 *
 * The site's "press" look (styles: cr-* in styles/hr.css): a lavender hero with
 * the handshake photo framed on a violet backing; Open Roles on white, the empty
 * state set beside a newspaper's classified column with its advert space still
 * blank; How to Apply on the navy band, with what to include down glass rows.
 */

// One address, spelled once. The subject line matters more than it looks: HR
// filters an inbox that also takes author and conference enquiries, so an
// application that arrives without this prefix is an application that gets read
// late.
const HR_EMAIL = 'info@veritazinternational.com';
const APPLY_SUBJECT = 'Job Application — Veritaz International Press';
const APPLY_MAILTO = `mailto:${HR_EMAIL}?subject=${encodeURIComponent(APPLY_SUBJECT)}`;

// Applying against a specific advert names the role in the subject, so HR can
// tell "answered the Editorial Assistant advert" from "wrote in speculatively"
// without opening the mail. Same prefix either way, so the inbox filter above
// still catches it.
const roleMailto = (jobtitle) =>
  `mailto:${HR_EMAIL}?subject=${encodeURIComponent(
    jobtitle ? `Job Application — ${jobtitle} — Veritaz International Press` : APPLY_SUBJECT,
  )}`;

// Columns are listed out instead of select('*'). The admin dashboard owns this
// table and may well grow a column that is nobody's business on a public page
// (an internal note, a salary band, who raised the requisition). Naming the
// columns means such a column has to be added here, deliberately, before the
// anon key can ever read it into the browser.
const CAREERS_SELECT =
  'id, jobtitle, jobdescription, category, workmode, location, experiencerequired, employmenttype';

// What an application should carry. These are instructions to the applicant, not
// claims about the company, which is why this list is safe to hardcode while a
// list of roles is not.
const WHAT_TO_INCLUDE = [
  ['CV or Résumé', 'Attached in PDF format.'],
  ['Desired Field', 'Specify your interest (e.g., Editorial, Publishing Operations, Event Coordination, Graphic Design, Information Technology, or Administration).'],
  ['Statement of Intent', 'A short note explaining why you wish to join Veritaz International Press (3–4 sentences is sufficient).'],
  ['Contact Details', 'Your current phone number and primary email address.'],
];
// A glossy badge for each of the four, in the accent tones.
const INCLUDE_BADGES = [
  { Icon: FileText, tone: '' },
  { Icon: Target, tone: 'svc-badge--amber' },
  { Icon: PenLine, tone: 'svc-badge--pink' },
  { Icon: Phone, tone: 'svc-badge--emerald' },
];

const HERO_PHOTO = '/assets/image/careers-hero.webp';
const H2 = `${H2_FIT} leading-[1.1] text-vz-ink`;
const H2_LIGHT = `${H2_FIT} leading-[1.1] text-white`;

export default function Careers() {
  useSeo(PAGES["/careers"]);
  // `roles` starts empty rather than null, because the empty state and the
  // "nothing loaded yet" state are not the same thing here and `loading` is what
  // separates them. Collapsing the two would make a failed fetch indistinguishable
  // from a slow one.
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set on unmount so a reply arriving after the reader has navigated away does
    // not call setState on a dead component. Supabase's client has no abort hook
    // on a plain select, so the flag is the available way to do this.
    let cancelled = false;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('veritaz_careers')
          .select(CAREERS_SELECT)
          .eq('status', 'Open')
          // Newest advert first: an applicant scanning the page should meet the
          // role that just opened, not whichever one has been up the longest.
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (cancelled) return;

        setRoles(data || []);
      } catch (err) {
        // Logged for whoever is debugging, not shown. The reader gets the empty
        // wording and the email route, which is the one action available to them
        // either way — see the note at the top of this file.
        console.error('Could not load open roles:', err);
        if (!cancelled) setRoles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // How to Apply is for the speculative applicant: it only appears once the list
  // has loaded and turned out empty. When roles are listed, each card carries its
  // own "Apply for this role" link, so the general instructions would just repeat
  // it. Hidden while loading so it does not flash up and vanish.
  const showHowToApply = !loading && roles.length === 0;

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-800">
      <CareersHero />

      {/* ── Open roles ─────────────────────────────────────
          The heading and the section are rendered in all three states, so the
          only thing that changes when the fetch lands is the body. That keeps the
          page from reflowing under the reader's cursor, and it means the loading
          state cannot be mistaken for a broken page. */}
      <section aria-labelledby="cr-roles" className={`cr-roles relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
        <div className={WRAP}>
          <Rule />
          <h2 id="cr-roles" className={`reveal mt-5 ${H2} short:mt-3`}>
            Open <Accent>Roles</Accent>
          </h2>

          <div className="mt-10 lg:mt-12 short:mt-6">
            {loading ? (
              <RolesLoading />
            ) : roles.length > 0 ? (
              // A lone role takes the full row rather than leaving half of it empty.
              <div className={`grid gap-6 ${roles.length > 1 ? 'lg:grid-cols-2' : ''}`}>
                {roles.map((role, i) => (
                  <RoleCard key={role.id} role={role} tone={BADGE_TONES[i % BADGE_TONES.length]} />
                ))}
              </div>
            ) : (
              <NoRoles />
            )}
          </div>
        </div>
      </section>

      {showHowToApply && <HowToApply />}
    </main>
  );
}

/**
 * Hero: lavender, the title and introduction on the left, and the handshake
 * photo on the right on a violet backing, with a patch of halftone behind its
 * corner and three glossy badges pinned round it.
 */
function CareersHero() {
  return (
    <header className="vz-hero-v2 relative isolate flex flex-col overflow-hidden text-vz-ink lg:min-h-[calc(100svh-7.6rem)]">
      <svg aria-hidden="true" className="vz-hero-waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cr-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#ddd6fe" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M0 64 C 220 8 430 118 720 78 C 990 42 1190 4 1440 46 L1440 120 L0 120 Z" fill="url(#cr-wave)" opacity="0.5" />
        <path d="M0 98 C 300 62 520 122 820 100 C 1080 82 1260 72 1440 92 L1440 120 L0 120 Z" fill="#fff" />
      </svg>

      <div
        className={`${WRAP} grid flex-1 items-center gap-16 pb-28 pt-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16 lg:pb-24 lg:pt-8 xl:gap-24 short:pb-20 short:pt-4`}
      >
        <div className="min-w-0">
          <Rule />
          <h1 className="mt-6 text-[2.25rem] leading-[1.1] text-vz-ink sm:text-5xl lg:text-[clamp(2.4rem,min(3.9vw,7.2svh),3.5rem)] short:mt-4">
            Join Our Team at <span className="hero-accent">Veritaz International Press</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-slate-600 lg:text-[17px] short:mt-5 short:text-[15px]">
            Veritaz International Press publishes academic textbooks, coordinates scholarly volumes, and manages international academic conferences. We accept applications year-round and publish specific openings here and across our official channels as positions become available.
          </p>
        </div>

        <div className="cr-frame relative mx-5 mb-4 sm:mx-12 lg:m-0 lg:mr-4">
          <span aria-hidden="true" className="cr-frame-back" />
          <img
            src={HERO_PHOTO}
            alt=""
            fetchPriority="high"
            className="cr-frame-img relative aspect-[4/3] w-full rounded-[2rem] object-cover object-[50%_60%] lg:aspect-auto lg:h-[min(27rem,calc(100svh-17rem))]"
          />
          <span aria-hidden="true" className="cr-pin cr-pin--1">
            <span className="svc-badge">
              <Briefcase className="relative z-10 h-6 w-6" strokeWidth={1.8} />
            </span>
          </span>
          <span aria-hidden="true" className="cr-pin cr-pin--2">
            <span className="svc-badge svc-badge--amber">
              <GraduationCap className="relative z-10 h-6 w-6" strokeWidth={1.8} />
            </span>
          </span>
          <span aria-hidden="true" className="cr-pin cr-pin--3">
            <span className="svc-badge svc-badge--sm svc-badge--pink">
              <Send className="relative z-10 h-5 w-5" strokeWidth={1.8} />
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

/**
 * How to Apply. Only rendered when there are no open roles (see Careers above).
 * The navy band: the instructions and the email button on the left, what to
 * include down four glass rows on the right.
 */
function HowToApply() {
  return (
    <section aria-labelledby="cr-apply" className={`vz-shelf-band relative isolate overflow-hidden text-white ${SCREEN_PAD} ${SCREEN}`}>
      <span aria-hidden="true" className="cr-apply-dots" />
      <div className={`${WRAP} grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16 xl:gap-24`}>
        <div className="min-w-0">
          <Rule tone="dark" />
          <h2 id="cr-apply" className={`reveal mt-5 ${H2_LIGHT} short:mt-3`}>
            How to <Accent tone="light">Apply</Accent>
          </h2>
          {/* Left-aligned: justifying the line before the unbreakable email
              address would stretch its word gaps wide. */}
          <p className="mt-6 text-left text-base leading-relaxed text-white/80 lg:text-[17px] short:mt-4">
            Submitting your application is simple and direct, no portal setup or lengthy forms required. Send a single email with your CV attached to our human resources team at{' '}
            <a
              href={APPLY_MAILTO}
              className="break-words font-semibold text-sf-lavender underline decoration-sf-lavender/50 underline-offset-4 hover:decoration-sf-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {HR_EMAIL}
            </a>
            .
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 short:mt-6">
            <Pill href={APPLY_MAILTO} variant="light" icon={Send}>
              Email your application
            </Pill>
            {/* The address is written out as well as linked: plenty of people
                read this on a phone with no mail client configured, or want to
                apply later from a work machine. */}
            <span className="text-sm text-white/75">
              Or write to{' '}
              <a
                href={APPLY_MAILTO}
                className="break-all font-semibold text-sf-lavender hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {HR_EMAIL}
              </a>
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white/90">
            Please include the following in your email:
          </h3>
          <ol className="mt-5 grid gap-3 short:mt-4 short:gap-2">
            {WHAT_TO_INCLUDE.map(([label, text], i) => {
              const { Icon, tone } = INCLUDE_BADGES[i];
              return (
                <li key={label} className="cr-glass reveal group flex items-start gap-5 rounded-2xl p-5 short:py-3.5">
                  <span aria-hidden="true" className={`svc-badge svc-badge--sm ${tone}`}>
                    <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                  </span>
                  {/* The number floats beside the label only, so the text
                      beneath runs the row's full width. */}
                  <div className="min-w-0 flex-1">
                    <span className="cr-num">{String(i + 1).padStart(2, '0')}</span>
                    <p className="pt-0.5 font-bold text-white">{label}</p>
                    {/* Ragged on phones, where the row is too narrow to justify evenly. */}
                    <p className="mt-1.5 text-left text-sm leading-relaxed text-white/75 sm:text-justify">{text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * The loading state.
 *
 * Two role-shaped blocks rather than a spinner. A spinner on a list that is
 * usually empty is the worst of both: it spins, then vanishes to reveal nothing,
 * which reads as a failure. A skeleton the size of the thing being fetched keeps
 * the section's height roughly stable instead, so the swap to either real roles or
 * the "nothing listed" panel is a small change rather than a jump. (It holds
 * still: the site plays no animation on a loop.)
 *
 * aria-busy plus the visually-hidden line give a screen reader the one fact the
 * placeholder blocks carry, since the blocks themselves are decorative.
 */
function RolesLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-2" aria-busy="true">
      <span className="sr-only">Loading open roles…</span>
      {[0, 1].map((i) => (
        <div key={i} aria-hidden="true" className="cr-skeleton rounded-3xl bg-white p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 flex-none rounded-[18px] bg-sf-mist" />
            <div className="h-5 w-1/2 rounded-full bg-sf-mist" />
          </div>
          <div className="mt-6 flex gap-2">
            <div className="h-7 w-24 rounded-full bg-vz-paper" />
            <div className="h-7 w-20 rounded-full bg-vz-paper" />
          </div>
          <div className="mt-5 h-3 w-full rounded-full bg-vz-paper" />
          <div className="mt-2.5 h-3 w-4/5 rounded-full bg-vz-paper" />
        </div>
      ))}
    </div>
  );
}

/**
 * The empty state — and, deliberately, the error state too.
 *
 * The wording is the one this page has always carried. It does two jobs: it says
 * the absence is real rather than a loading failure, and it tells the reader the
 * useful thing, which is that an application is worth sending anyway. The mailto
 * is repeated here because this paragraph is what a reader who came looking for a
 * vacancy actually reads, and sending them down the page to find the button is
 * how you lose them.
 *
 * Beside it, a newspaper's classified column with its advert space still blank.
 */
function NoRoles() {
  return (
    <div className="cr-empty relative isolate overflow-hidden rounded-[2rem] bg-white lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <span aria-hidden="true" className="svc-card-glow" />
      <div className="relative flex flex-col justify-center p-5 sm:p-10 lg:p-12 xl:p-14 short:p-8">
        <span aria-hidden="true" className="svc-badge">
          <Briefcase className="relative z-10 h-6 w-6" strokeWidth={1.8} />
        </span>
        <p className="mt-6 text-base leading-relaxed text-slate-600 lg:text-[17px] short:mt-4 short:text-[15px]">
          There are currently no active listings on this page. However, we continuously review incoming CVs and keep promising applications on file for upcoming opportunities across editorial, event management, and administrative teams.
        </p>
        <div className="mt-8 short:mt-6">
          <Pill href={APPLY_MAILTO} variant="outline" icon={Send}>
            Email your application
          </Pill>
        </div>
      </div>
      <Classifieds />
    </div>
  );
}

/** Decoration: a newspaper's classified column, its one advert space empty. */
function Classifieds() {
  const lines = (widths) => widths.map((w, i) => <span key={i} className={`cr-line ${w}`} />);
  return (
    <div aria-hidden="true" className="cr-board relative">
      <div className="cr-paper-tilt">
        <div className="cr-paper">
          <span className="cr-mast" />
          <span className="cr-mast-rule" />
          <div className="cr-cols">
            <div className="grid content-start gap-[2.4cqw]">
              <span className="cr-line cr-line--head w-[70%]" />
              {lines(['w-full', 'w-[92%]', 'w-full', 'w-[64%]'])}
              <span className="cr-boxad">
                <span className="cr-line cr-line--head w-1/2" />
                {lines(['w-full', 'w-[80%]'])}
              </span>
              {lines(['w-full', 'w-[86%]', 'w-[50%]'])}
            </div>
            <div className="grid content-start gap-[2.4cqw]">
              <span className="cr-vacant">
                <span className="svc-badge svc-badge--sm">
                  <Briefcase className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                </span>
              </span>
              <span className="cr-line cr-line--head w-[60%]" />
              {lines(['w-full', 'w-[88%]', 'w-full', 'w-[70%]'])}
            </div>
          </div>
        </div>
        <span className="cr-tape" />
      </div>
    </div>
  );
}

/**
 * One advertised role.
 *
 * Every field below is optional in the schema, so each one is rendered only when
 * it holds something. A row saved with just a title still produces a clean card
 * instead of a line of empty labels or a row of "N/A" — the admin form does not
 * force HR to fill in a location for a remote role, and the page should not
 * punish them for that.
 */
function RoleCard({ role, tone }) {
  const {
    jobtitle,
    jobdescription,
    category,
    workmode,
    location,
    experiencerequired,
    employmenttype,
  } = role;

  // Icon, value pairs, filtered down to the ones actually set.
  const meta = [
    [MapPin, location],
    [Monitor, workmode],
    [Clock, employmenttype],
    [GraduationCap, experiencerequired],
  ].filter(([, value]) => value && String(value).trim());

  // Rendered as text in paragraphs, never as HTML. The description is typed into
  // the admin dashboard, so piping it through dangerouslySetInnerHTML would make
  // the admin form a route to inject script into the public site. Splitting on
  // blank lines keeps the paragraph breaks whoever wrote it intended.
  const paragraphs = String(jobdescription || '')
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <article className="svc-card reveal group relative isolate flex flex-col overflow-hidden rounded-3xl bg-white p-5 sm:p-8">
      <span aria-hidden="true" className="svc-card-glow" />
      <Briefcase className="cr-watermark" strokeWidth={1.2} aria-hidden="true" />
      <div className="flex items-start gap-5">
        <span aria-hidden="true" className={`svc-badge ${tone}`}>
          <Briefcase className="relative z-10 h-6 w-6" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold leading-snug text-vz-ink">
            {/* A row with no title would be a card with no heading, so it falls back
                to something a reader can still click on rather than rendering blank. */}
            {jobtitle || 'Open role'}
          </h3>
          {category && (
            <span className="mt-2 inline-block rounded-full bg-sf-mist px-3 py-1 text-xs font-bold text-sf-indigo-deep">
              {category}
            </span>
          )}
        </div>
      </div>

      {meta.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {meta.map(([Icon, value], i) => (
            <li
              key={i}
              className="flex items-center gap-1.5 rounded-full bg-vz-paper px-3 py-1.5 text-xs font-semibold text-vz-ink ring-1 ring-vz-line"
            >
              <Icon size={14} aria-hidden="true" className="shrink-0 text-sf-indigo" />
              {value}
            </li>
          ))}
        </ul>
      )}

      {paragraphs.length > 0 && (
        <div className="mt-5 space-y-2">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-left text-[15px] leading-relaxed text-slate-600 sm:text-justify">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <div className="mt-auto pt-7">
        <Pill href={roleMailto(jobtitle)} icon={FileText} arrow>
          Apply for this role
        </Pill>
      </div>
    </article>
  );
}
