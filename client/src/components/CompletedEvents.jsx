import { MapPin, Calendar, Users, CalendarCheck2, CheckCheck } from "lucide-react";
import StateFilterBar from "./StateFilterBar";
import { mediaImg, retryOriginal } from "../lib/media";

/* The completed events on the events page: a toolbar holding the list's
   title and the state filter, then the events as cards. Each card shows its
   poster in a white mat like a printed proof, with an emerald "done" stamp on
   its corner, then the college, date and place. The ev-* styles live in
   styles/events.css. */

// speakerContact may be an array, a plain string, or a JSON-encoded string
function speakerList(speakerContact) {
  if (Array.isArray(speakerContact)) return speakerContact;
  if (!speakerContact) return [];
  try {
    const parsed = JSON.parse(speakerContact);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [speakerContact];
  }
}

const META_ICON = "flex h-7 w-7 flex-none items-center justify-center rounded-full";

export default function CompletedEvents({ events = [], states = [], stateFilter = "", onStateFilterChange = () => {} }) {
  return (
    <div>
      <div className="ev-toolbar rounded-3xl p-4 sm:p-5 lg:px-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="svc-badge svc-badge--xs svc-badge--emerald">
            <CalendarCheck2 className="relative z-10 h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <h3 className="text-lg font-bold text-vz-ink">Completed Events</h3>
        </div>

        <StateFilterBar
          states={states}
          value={stateFilter}
          onChange={onStateFilterChange}
          className="mt-4 border-t border-dashed border-vz-line pt-4"
        />
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-7">
        {events.map((event, index) => {
          const speakersArray = speakerList(event.speakerContact);

          return (
            <li
              key={event.id || event._id || index}
              className="svc-card group relative isolate flex flex-col overflow-hidden rounded-3xl bg-white"
            >
              <span aria-hidden="true" className="svc-card-glow" />

              {/* Poster in its mat. The frame keeps the posters' landscape
                  shape so nothing is letterboxed; object-contain keeps any
                  other shape whole. */}
              <div className="relative p-2.5 pb-0">
                <div className="ev-proof relative aspect-[1024/724] overflow-hidden rounded-2xl">
                  <img
                    {...mediaImg(event.poster, "posterCard")}
                    alt={event.eventTitle || "Completed Event"}
                    loading="lazy"
                    className="ev-poster-img h-full w-full object-contain"
                    onError={retryOriginal(event.poster, (e) => { e.target.src = "https://placehold.co/480x300/EEE/31343C?text=No+Poster" })}
                  />
                </div>
                <span aria-hidden="true" className="ev-stamp">
                  <CheckCheck className="relative h-5 w-5" strokeWidth={2.2} />
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-6">
                {event.collegeName && (
                  <h4 className="pr-14 text-[13px] font-bold uppercase leading-snug tracking-[0.05em] text-sf-indigo-deep">
                    {event.collegeName}
                  </h4>
                )}

                {event.date && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <span aria-hidden="true" className={`${META_ICON} bg-sf-mist text-sf-indigo`}>
                      <Calendar size={14} strokeWidth={2} />
                    </span>
                    <span className="line-clamp-2">{event.date}</span>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <span aria-hidden="true" className={`${META_ICON} bg-emerald-50 text-emerald-700`}>
                      <MapPin size={14} strokeWidth={2} />
                    </span>
                    <span className="line-clamp-2">{event.location}</span>
                  </div>
                )}
              </div>

              {/* Speakers, when listed */}
              {speakersArray.length > 0 && (
                <div className="mt-auto border-t border-dashed border-vz-line px-5 pb-5 pt-4">
                  <div className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span aria-hidden="true" className={`${META_ICON} bg-amber-50 text-amber-700`}>
                      <Users size={14} strokeWidth={2} />
                    </span>
                    <div className="w-full">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Speakers / Contacts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {speakersArray.map((speaker, idx) => (
                          <span key={idx} className="rounded-full bg-sf-mist px-2.5 py-0.5 text-xs font-medium text-sf-indigo-deep">
                            {speaker}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
