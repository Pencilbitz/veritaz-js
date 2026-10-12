import { Link } from 'react-router-dom';
import { Briefcase, Mail, Send, FileText, Users, ArrowRight } from 'lucide-react';

/**
 * Careers — the public "we are open to applications" page.
 *
 * ---------------------------------------------------------------------------
 * Why this page lists no vacancies
 *
 * There is no jobs data source on this site. Conferences come from Supabase and
 * books from the store, but nothing anywhere holds openings, departments,
 * locations or salary bands. A card saying "Editorial Assistant — Chennai" would
 * therefore be a number typed into JSX by whoever built the page, and on a live
 * company site that is not a placeholder, it is a lie: people spend an afternoon
 * writing an application against it.
 *
 * So this page does the one thing it can do truthfully — it points an applicant
 * at the HR inbox and says plainly that roles are published when there are any.
 * The day a real openings table exists, a list belongs here, driven by it. Until
 * then, resist the pull to "fill out" this page with plausible-looking roles,
 * benefits, employee counts or testimonials; everything on it is either verifiable
 * from the rest of the site or an instruction to the reader.
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
          {/* ── How to apply ─────────────────────────────────── */}
          <div className="lg:col-span-2">
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
            {/* Says "nothing listed" out loud. An empty page invites the reader to
                assume the list simply failed to load; naming the state is the
                honest version, and it is also the card a future openings list
                replaces. */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <FileText size={16} className="text-[#1d4ed8]" />
                Open roles
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                We do not have any roles listed on this page at the moment. That does not mean we
                are not hiring — applications are read as they arrive, so send yours in and it
                will be on file when something opens up.
              </p>
            </div>

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
