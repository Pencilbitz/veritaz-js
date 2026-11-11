import { useId } from "react";
import { MapPin } from "lucide-react";

/* The state filter on the events page: a label and a row of chips, the
   chosen one filled with the brand gradient (.ev-chip in styles/events.css).
   Each chip is a toggle button, so screen readers hear which is pressed. */
export default function StateFilterBar({ states, value, onChange, className = "" }) {
  const labelId = useId();
  if (!states || states.length === 0) return null;

  const chip = (state, label) => (
    <button
      key={state || "all"}
      type="button"
      aria-pressed={value === state}
      onClick={() => onChange(state)}
      className="ev-chip"
    >
      {label}
    </button>
  );

  return (
    <div role="group" aria-labelledby={labelId} className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span id={labelId} className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold tracking-[0.08em] text-slate-600">
        <MapPin className="h-4 w-4 text-sf-violet" aria-hidden="true" />
        STATE:
      </span>
      {chip("", "All States")}
      {states.map((s) => chip(s, s))}
    </div>
  );
}
