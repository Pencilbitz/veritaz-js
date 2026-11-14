// Gives every file already in Supabase Storage (bucket: veritaz_media) a
// one-year cache lifetime instead of the one-hour default it was uploaded
// with.
//
// Why: the site's covers, posters and portraits are served from this bucket
// (directly, and resized through /storage/v1/render/image). With a one-hour
// lifetime a returning visitor downloads them all again; the performance audit
// counted about 3.3 MB of that on the home page and the Book Store. The admin
// now uploads new files with a one-year lifetime (admin/src/lib/storage.js);
// this script brings the existing ones in line.
//
// It is safe because no file here is ever changed in place: the admin gives
// every upload a new random name, and a replaced cover is a new file at a new
// address. (Scripts 04 and 06 named files after their source and could
// overwrite them if re-run with changed sources; they are one-off migrations
// that have already run. Do not re-run them after this.)
//
// How: Storage has no "change metadata" call, so each file is downloaded and
// uploaded again to the same path with the same content type and the new
// cache setting. Addresses do not change, and nothing in the database is
// touched. Files that already have the setting are skipped, so it can be
// re-run.
//
// Usage (from migration/, with SUPABASE_URL and SUPABASE_SECRET_KEY in .env):
//   node 08-set-media-cache-control.mjs            # dry run: lists what would change
//   node 08-set-media-cache-control.mjs --apply    # does it
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "veritaz_media";
const CACHE_SECONDS = "31536000";
const APPLY = process.argv.includes("--apply");
const PARALLEL = 4;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in migration/.env first.");
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

/** Every file in the bucket, walking folders (list() returns folders with no id). */
async function listAll(prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(`list ${prefix || "/"}: ${error.message}`);
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...(await listAll(path)));
      else files.push({ path, meta: item.metadata || {} });
    }
    if (data.length < 1000) break;
  }
  return files;
}

const hasLongCache = (meta) => new RegExp(`max-age=${CACHE_SECONDS}\\b`).test(meta.cacheControl || "");

async function update({ path, meta }) {
  const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(path);
  if (downloadError) throw new Error(`download: ${downloadError.message}`);
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    upsert: true,
    contentType: meta.mimetype || blob.type || undefined,
    cacheControl: CACHE_SECONDS,
  });
  if (error) throw new Error(`upload: ${error.message}`);
}

const files = await listAll();
const todo = files.filter((f) => !hasLongCache(f.meta));
const bytes = todo.reduce((sum, f) => sum + (f.meta.size || 0), 0);
console.log(`${files.length} files in ${BUCKET}; ${todo.length} without a one-year cache (${(bytes / 1048576).toFixed(1)} MB).`);

if (!APPLY) {
  for (const f of todo.slice(0, 20)) console.log(`  would update ${f.path}  (now: ${f.meta.cacheControl || "unset"})`);
  if (todo.length > 20) console.log(`  ...and ${todo.length - 20} more`);
  console.log("Dry run: nothing changed. Run again with --apply to update them.");
  process.exit(0);
}

let done = 0;
const failed = [];
for (let i = 0; i < todo.length; i += PARALLEL) {
  await Promise.all(
    todo.slice(i, i + PARALLEL).map(async (file) => {
      try {
        await update(file);
        done += 1;
      } catch (err) {
        failed.push(`${file.path}: ${err.message}`);
      }
    })
  );
  process.stdout.write(`\r  updated ${done} of ${todo.length}`);
}
console.log(`\nDone: ${done} updated, ${failed.length} failed.`);
for (const line of failed) console.log(`  ${line}`);
process.exit(failed.length ? 1 : 0);
