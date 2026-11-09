import { useEffect, useState } from 'react';
import {
  Briefcase,
  Send,
  FileText,
  ArrowRight,
  MapPin,
  Monitor,
  Clock,
  GraduationCap,
} from 'lucide-react';

import { supabase } from '../lib/supabase';

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

const WRAP = 'mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20';
const SERIF = { fontFamily: "var(--font-serif)" };
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep';

// Accent colours from the logo, cycled across repeated cards.
const ACCENTS = [
  { border: 'border-brand-cyan', tile: 'bg-brand-cyan text-brand-ink' },
  { border: 'border-brand-bright', tile: 'bg-brand-bright text-white' },
  { border: 'border-brand-violet', tile: 'bg-brand-violet text-white' },
  { border: 'border-brand-orchid', tile: 'bg-brand-orchid text-brand-ink' },
];

const CARD = 'rounded-2xl bg-white shadow-[0_0_0_1px_rgb(8_72_168/0.07),0_14px_34px_rgb(8_72_168/0.08)]';

function SectionTitle({ children }) {
  return (
    <div className="mb-8 lg:mb-10">
      <h2 style={SERIF} className="text-3xl font-medium tracking-tight text-brand-ink sm:text-4xl">
        {children}
      </h2>
      <span aria-hidden="true" className="logo-rule mt-4 block w-20 rounded-full" />
    </div>
  );
}

export default function Careers() {
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
    <main className="min-h-screen bg-white text-slate-800">
      <CareersHero />

      {/* ── Open roles ─────────────────────────────────────
          The heading and the section are rendered in all three states, so the
          only thing that changes when the fetch lands is the body. That keeps the
          page from reflowing under the reader's cursor, and it means the loading
          state cannot be mistaken for a broken page. */}
      <section className="bg-white py-14 lg:py-20">
        <div className={WRAP}>
          <SectionTitle>Open Roles</SectionTitle>

          {loading ? (
            <RolesLoading />
          ) : roles.length > 0 ? (
            // A lone role takes the full row rather than leaving half of it empty.
            <div className={`grid gap-6 ${roles.length > 1 ? "lg:grid-cols-2" : ""}`}>
              {roles.map((role, i) => (
                <RoleCard key={role.id} role={role} accent={ACCENTS[i % ACCENTS.length]} />
              ))}
            </div>
          ) : (
            <NoRoles />
          )}
        </div>
      </section>

      {showHowToApply && <HowToApply />}
    </main>
  );
}

/**
 * Hero. The handshake photo fills the whole banner, blurred and under a light
 * veil, with the copy centred on top.
 */
function CareersHero() {
  return (
    <header className="relative overflow-hidden bg-brand-snow">
      <img
        src="/assets/image/careers-hero.png"
        alt=""
        aria-hidden="true"
        className="careers-hero-photo pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />
      <span aria-hidden="true" className="careers-hero-veil pointer-events-none absolute inset-0" />

      <div className={`${WRAP} relative flex items-center justify-center py-16 text-center sm:py-20 lg:min-h-[480px] lg:py-24`}>
        <div className="max-w-4xl">
          <h1 className="text-[2rem] font-extrabold leading-[1.15] tracking-tight text-brand-ink sm:text-5xl xl:text-[3.25rem]">
            Join Our Team at{' '}
            <span className="bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet bg-clip-text text-transparent">
              Veritaz International Press
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-700">
            Veritaz International Press publishes academic textbooks, coordinates scholarly volumes, and manages international academic conferences. We accept applications year-round and publish specific openings here and across our official channels as positions become available.
          </p>
        </div>
      </div>
      <div className="logo-rule relative" />
    </header>
  );
}

/**
 * How to Apply. Only rendered when there are no open roles (see Careers above).
 */
function HowToApply() {
  return (
    <section className="relative overflow-hidden bg-brand-snow py-14 lg:py-20">
      <span aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-brand-orchid/15 blur-[100px]" />
      <div className={`${WRAP} relative grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16`}>
        <div>
          <SectionTitle>How to Apply</SectionTitle>
          <p className="text-lg leading-relaxed text-slate-600">
            Submitting your application is simple and direct, no portal setup or lengthy forms required. Send a single email with your CV attached to our human resources team at{' '}
            <a href={APPLY_MAILTO} className="font-semibold text-brand-bright hover:underline">
              {HR_EMAIL}
            </a>
            .
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={APPLY_MAILTO}
              className={`inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet px-7 py-3.5 font-bold text-white shadow-[0_14px_30px_rgb(8_72_168/0.3)] transition-transform hover:-translate-y-0.5 ${FOCUS}`}
            >
              <Send size={18} aria-hidden="true" />
              Email your application
            </a>
            {/* The address is written out as well as linked: plenty of people
                read this on a phone with no mail client configured, or want to
                apply later from a work machine. */}
            <span className="text-sm text-slate-500">
              Or write to{' '}
              <a href={APPLY_MAILTO} className="font-semibold text-brand-bright hover:underline">
                {HR_EMAIL}
              </a>
            </span>
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-brand-ink">
            Please include the following in your email:
          </h3>
          <ol className="grid gap-4 sm:grid-cols-2">
            {WHAT_TO_INCLUDE.map(([label, text], i) => (
              <li key={label} className={`border-t-[3px] p-5 ${ACCENTS[i % ACCENTS.length].border} ${CARD}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold ${ACCENTS[i % ACCENTS.length].tile}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-4 font-bold text-brand-ink">{label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * The loading state.
 *
 * Two grey role-shaped blocks rather than a spinner. A spinner on a list that is
 * usually empty is the worst of both: it spins, then vanishes to reveal nothing,
 * which reads as a failure. A skeleton the size of the thing being fetched keeps
 * the section's height roughly stable instead, so the swap to either real roles or
 * the "nothing listed" panel is a small change rather than a jump.
 *
 * aria-busy plus the visually-hidden line give a screen reader the one fact the
 * pulsing rectangles carry, since the rectangles themselves are decorative.
 */
function RolesLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-2" aria-busy="true">
      <span className="sr-only">Loading open roles…</span>
      {[0, 1].map((i) => (
        <div key={i} aria-hidden="true" className={`animate-pulse p-6 ${CARD}`}>
          <div className="h-5 w-1/2 rounded bg-brand-snow" />
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-24 rounded-full bg-brand-snow" />
            <div className="h-7 w-20 rounded-full bg-brand-snow" />
          </div>
          <div className="mt-4 h-3 w-full rounded bg-brand-snow" />
          <div className="mt-2 h-3 w-4/5 rounded bg-brand-snow" />
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
 */
function NoRoles() {
  return (
    <div className={`relative overflow-hidden p-6 sm:p-8 ${CARD}`}>
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-cyan via-brand-bright to-brand-violet" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-brand-mist text-brand-deep">
          <Briefcase size={26} aria-hidden="true" />
        </span>
        <p className="flex-1 leading-relaxed text-slate-600">
          There are currently no active listings on this page. However, we continuously review incoming CVs and keep promising applications on file for upcoming opportunities across editorial, event management, and administrative teams.
        </p>
        <a
          href={APPLY_MAILTO}
          className={`inline-flex flex-none items-center justify-center gap-2 rounded-full border-2 border-brand-deep px-6 py-3 text-sm font-bold text-brand-deep transition-colors hover:bg-brand-deep hover:text-white ${FOCUS}`}
        >
          <Send size={16} aria-hidden="true" />
          Email your application
        </a>
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
function RoleCard({ role, accent }) {
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
    <article className={`flex flex-col border-t-[3px] p-6 transition-shadow hover:shadow-[0_0_0_1px_rgb(8_72_168/0.12),0_22px_44px_rgb(8_72_168/0.14)] sm:p-7 ${accent.border} ${CARD}`}>
      <div className="flex items-start gap-4">
        <span className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${accent.tile}`}>
          <Briefcase size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold leading-snug text-brand-ink">
            {/* A row with no title would be a card with no heading, so it falls back
                to something a reader can still click on rather than rendering blank. */}
            {jobtitle || 'Open role'}
          </h3>
          {category && (
            <span className="mt-2 inline-block rounded-full bg-brand-paper px-3 py-1 text-xs font-bold text-brand-violet">
              {category}
            </span>
          )}
        </div>
      </div>

      {meta.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {meta.map(([Icon, value], i) => (
            <li key={i} className="flex items-center gap-1.5 rounded-full border border-brand-bright/15 bg-brand-snow px-3 py-1.5 text-xs font-semibold text-brand-ink">
              <Icon size={14} aria-hidden="true" className="shrink-0 text-brand-bright" />
              {value}
            </li>
          ))}
        </ul>
      )}

      {paragraphs.length > 0 && (
        <div className="mt-5 space-y-2">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <div className="mt-auto pt-6">
        <a
          href={roleMailto(jobtitle)}
          className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-bright via-brand-deep to-brand-violet px-6 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgb(8_72_168/0.28)] transition-transform hover:-translate-y-0.5 ${FOCUS}`}
        >
          <FileText size={16} aria-hidden="true" />
          Apply for this role
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
