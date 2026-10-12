import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Mail,
  Send,
  FileText,
  Users,
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
  'Your CV or résumé, attached as a PDF.',
  'The kind of work you are looking for — editorial, publishing operations, events, design, technology or support.',
  'A short note on why Veritaz International Press, in your own words. A few lines is plenty.',
  'A phone number and an email address we can reach you on.',
];

const SectionHeading = ({ children }) => (
  <h2 className="border-b border-gray-100 pb-2 text-sm font-extrabold text-gray-900">
    {children}
  </h2>
);

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

  return (
    <section className="bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header — same shape as the Employment Verification page, since the two
            sit together under the HR Department menu and should read as one desk. */}
        <header className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white sm:grid">
            <Briefcase size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Careers
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-[15px]">
              Veritaz International Press publishes books and runs academic conferences and
              events. We welcome applications by email throughout the year, and we share open
              roles here and on our social channels whenever there are any.
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* ── Open roles ─────────────────────────────────────
                The heading and the card shell are rendered in all three states, so
                the only thing that changes when the fetch lands is the body. That
                keeps the page from reflowing under the reader's cursor, and it
                means the loading state cannot be mistaken for a broken page. */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading>Open roles</SectionHeading>

              {loading ? (
                <RolesLoading />
              ) : roles.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {roles.map((role) => (
                    <RoleCard key={role.id} role={role} />
                  ))}
                </div>
              ) : (
                <NoRoles />
              )}
            </div>

            {/* ── How to apply ─────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading>How to apply</SectionHeading>

              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                Email your application to our HR department. There is no form to fill in and no
                account to create — a single email with your CV attached is a complete
                application, whether or not a role has been advertised.
              </p>

              <h3 className="mt-6 text-sm font-extrabold text-gray-900">What to include</h3>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {WHAT_TO_INCLUDE.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-[11px] font-bold text-[#1d4ed8]">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
                <a
                  href={APPLY_MAILTO}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
                >
                  <Send size={16} />
                  Email your application
                </a>
                {/* The address is written out as well as linked: plenty of people
                    read this on a phone with no mail client configured, or want to
                    apply later from a work machine. */}
                <span className="text-xs text-gray-500">
                  Or write to{' '}
                  <a href={APPLY_MAILTO} className="font-semibold text-[#1d4ed8] hover:underline">
                    {HR_EMAIL}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <Users size={16} className="text-[#1d4ed8]" />
                After you apply
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Our HR department reviews each application. If your background suits something we
                are working on, they will get in touch using the phone number or email address in
                your message.
              </p>
            </div>

            {/* The other half of the HR Department menu. An employer who lands here
                looking to verify a former employee should not have to go back to the
                nav to find it. */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <Mail size={16} className="text-[#1d4ed8]" />
                Not applying for a job?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Employers, banks and screening agencies checking someone’s employment with us
                should use the employment verification page instead.
              </p>
              <Link
                to="/hr-department"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1d4ed8] hover:underline"
              >
                Employment Verification
                <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
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
 * the card's height roughly stable instead, so the swap to either real roles or
 * the "nothing listed" paragraph is a small change rather than a jump.
 *
 * aria-busy plus the visually-hidden line give a screen reader the one fact the
 * pulsing rectangles carry, since the rectangles themselves are decorative.
 */
function RolesLoading() {
  return (
    <div className="mt-4 space-y-4" aria-busy="true">
      <span className="sr-only">Loading open roles…</span>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="animate-pulse rounded-xl border border-gray-100 bg-white p-4"
        >
          <div className="h-4 w-1/2 rounded bg-gray-100" />
          <div className="mt-3 flex gap-2">
            <div className="h-5 w-24 rounded-full bg-gray-100" />
            <div className="h-5 w-20 rounded-full bg-gray-100" />
          </div>
          <div className="mt-3 h-3 w-full rounded bg-gray-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-gray-100" />
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
 * vacancy actually reads, and sending them back up the page to find the button is
 * how you lose them.
 */
function NoRoles() {
  return (
    <div className="mt-4">
      <p className="text-sm leading-relaxed text-slate-700">
        We do not have any roles listed on this page at the moment. That does not mean we are not
        hiring — applications are read as they arrive, so send yours in and it will be on file when
        something opens up.
      </p>
      <a
        href={APPLY_MAILTO}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1d4ed8] hover:underline"
      >
        <Send size={14} />
        Email your application
      </a>
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
function RoleCard({ role }) {
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
    <article className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-blue-100 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-extrabold leading-snug text-gray-900">
          {/* A row with no title would be a card with no heading, so it falls back
              to something a reader can still click on rather than rendering blank. */}
          {jobtitle || 'Open role'}
        </h3>
        {category && (
          <span className="shrink-0 rounded-full bg-[#2563eb]/10 px-2.5 py-1 text-[11px] font-bold text-[#1d4ed8]">
            {category}
          </span>
        )}
      </div>

      {meta.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {meta.map(([Icon, value], i) => (
            <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
              <Icon size={14} className="shrink-0 text-[#1d4ed8]" />
              {value}
            </li>
          ))}
        </ul>
      )}

      {paragraphs.length > 0 && (
        <div className="mt-3 space-y-2">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <a
        href={roleMailto(jobtitle)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#1d4ed8] hover:underline"
      >
        <FileText size={14} />
        Apply for this role
        <ArrowRight size={14} />
      </a>
    </article>
  );
}
