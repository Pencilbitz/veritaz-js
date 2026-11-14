// The Supabase client, loaded when a page first asks for data.
//
// Imported directly, the client has to download and run before the app can
// draw anything; loaded through db() the first screen appears first and the
// client follows a moment later. Every page's data requests already wait for
// an effect, so nothing else changes:
//
//   const supabase = await db();
//   const { data, error } = await supabase.from("veritaz_books").select("*");

let client;

export const db = () => (client ??= import("./supabase.js").then((m) => m.supabase));

// The events table uses snake_case columns; the UI components read the original
// camelCase field names, so we alias them back on every select.
export const EVENT_SELECT =
  "id, collegeName:college_name, topic, eventTitle:topic, date:date_text, time:time_text, status, location, state, contact1, contact2, registrationLink:registration_link, registerButtonText:register_button_text, poster, certificate, speakerContact:speaker_contact, created_at";
