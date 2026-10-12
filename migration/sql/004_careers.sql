-- Veritaz International Press — job openings for the public Careers page.
-- Run once in the Supabase SQL Editor. Safe to re-run: every statement uses
-- IF NOT EXISTS / DROP POLICY IF EXISTS.
--
-- Why this table exists
-- The Careers page used to say, in a hardcoded aside, that no roles were listed.
-- That was the honest thing to render while there was no jobs data source, but it
-- meant HR could not advertise a role without a code change and a deploy. This is
-- that data source: the admin dashboard writes rows here, the public page reads
-- the ones with status 'Open'.
--
-- Column names are unprefixed and all-lowercase (jobtitle, workmode, ...) to match
-- the house style already set by veritaz_conferences (conferencename, registerlink).
-- Postgres folds unquoted identifiers to lowercase anyway, so camelCase in SQL
-- would only create a trap for whoever writes the next query by hand.

-- =========================================================
-- veritaz_careers
-- =========================================================
create table if not exists public.veritaz_careers (
  id                 text primary key,     -- app-generated, matching the id style of the other veritaz_ tables
  jobtitle           text,                 -- e.g. "Editorial Assistant"
  jobdescription     text,                 -- free text; the page renders it as paragraphs, not HTML
  category           text,                 -- e.g. Editorial | Publishing Operations | Events | Design | Technology | Support
  workmode           text,                 -- On-site | Hybrid | Remote
  location           text,                 -- free text, e.g. "Chennai, Tamil Nadu"
  experiencerequired text,                 -- free text, e.g. "2-4 years" / "Fresher"
  employmenttype     text,                 -- Full-time | Part-time | Contract | Internship
  status             text not null default 'Open',   -- Open = advertised publicly | Closed = kept for the record, hidden from the site
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- The public page filters on status, so give it an index rather than a seq scan
-- on every page load. Same treatment the other tables' status columns get.
create index if not exists veritaz_careers_status_idx on public.veritaz_careers (status);
-- Newest opening first is the page's default ordering.
create index if not exists veritaz_careers_created_at_idx on public.veritaz_careers (created_at desc);

-- =========================================================
-- Row Level Security
--
-- Read: open to anon, because the public site holds nothing but the anon key.
-- Write: authenticated only. This distinction is the whole point of the policies
-- below — the anon key ships inside the public JavaScript bundle, so a write
-- policy that allowed anon would let anyone who opened devtools post or delete
-- job adverts on a live company site. The admin dashboard signs in through
-- Supabase Auth (admin/src/pages/Login.jsx), so its requests carry a real
-- authenticated JWT and satisfy the write policy.
--
-- Note the shape differs from 001_schema.sql, which wrote
-- `using (auth.role() = 'authenticated')`. `TO authenticated` is the same
-- restriction expressed where Postgres can use it: the policy is simply not
-- considered for the anon role, instead of being evaluated and then failing.
-- =========================================================
alter table public.veritaz_careers enable row level security;

-- Anyone may read. The page needs this; it reads with the anon key.
drop policy if exists "public read" on public.veritaz_careers;
create policy "public read" on public.veritaz_careers
  for select
  to anon, authenticated
  using (true);

-- Only a signed-in admin may insert, update or delete. Deliberately NOT anon.
drop policy if exists "admin write" on public.veritaz_careers;
create policy "admin write" on public.veritaz_careers
  for all
  to authenticated
  using (true)
  with check (true);

-- updated_at is maintained by the admin app on every save (see
-- admin/src/pages/AddCareer.jsx) rather than by a trigger, keeping this schema
-- trigger-free like the rest of migration/sql.
