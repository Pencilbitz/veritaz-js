// src/lib/supabase.js
// Centralized Supabase client for the public site. Pages load it through
// db() in ./db.js, so it stays out of the first download.
//
// The site only reads and writes tables (supabase.from(...)), which is what
// @supabase/postgrest-js does: supabase-js's own `from()` hands straight to
// it. The full supabase-js also carries sign-in, realtime, storage and
// functions clients the public site never uses (about 45 KB compressed), so
// the query client is used on its own, with the same anon key headers.
import { PostgrestClient } from "@supabase/postgrest-js";
import { EVENT_SELECT } from "./db.js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY environment variables."
  );
}

export const supabase = new PostgrestClient(`${supabaseUrl}/rest/v1`, {
  headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
});

export { EVENT_SELECT };

export default supabase;
