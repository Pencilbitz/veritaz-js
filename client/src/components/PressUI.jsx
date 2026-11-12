import { useId } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* Small building blocks of the "press" look, shared by the Home and Our
   Company pages. Their styles (hero-accent, hero-swash, vz-rule, pill-primary)
   live in index.css. */

/** Brush stroke drawn under an accent word; it draws itself in (see
 *  .hero-swash in index.css). */
export function Swash({ className = "" }) {
  const id = `swash-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg aria-hidden="true" className={`hero-swash ${className}`} viewBox="0 0 300 24" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-sf-indigo)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-sf-violet)" }} />
        </linearGradient>
      </defs>
      <path
        d="M6 15 C 70 6 150 3 236 8 C 262 10 282 14 294 21"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="6"
        strokeLinecap="round"
        pathLength="1"
      />
    </svg>
  );
}

/** Decorative mark above a heading: a short gradient rule ending in the
 *  logo's diamond. */
export function Rule({ tone = "light", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`flex items-center gap-1.5 ${tone === "dark" ? "text-vz-cyan" : "text-vz-violet"} ${className}`}
    >
      <span className="vz-rule h-0.5 w-10" />
      <span className="h-2 w-2 rotate-45 border-[1.5px] border-current" />
    </span>
  );
}

/** Section label: a lilac pill with an optional icon. `tone="light"` for
 *  dark or coloured backgrounds. */
export function Eyebrow({ children, icon: Icon, tone = "dark", className = "" }) {
  const colors =
    tone === "light"
      ? "bg-white/15 text-white ring-1 ring-white/25"
      : "bg-sf-mist text-sf-indigo-deep";
  return (
    <p
      className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${colors} ${className}`}
    >
      {Icon && <Icon className={`h-4 w-4 ${tone === "light" ? "text-amber-300" : "text-sf-violet"}`} aria-hidden="true" />}
      {children}
    </p>
  );
}

/** A heading's accent words: the italic book serif in the brand gradient,
 *  with a brush stroke drawing in beneath as the heading scrolls into view.
 *  `tone="light"` for dark backgrounds. */
export function Accent({ children, tone = "dark" }) {
  return (
    <span className="relative inline-block">
      <span className={`hero-accent ${tone === "light" ? "hero-accent--light" : ""}`}>{children}</span>
      <Swash className="hero-swash--word hero-swash--scroll" />
    </span>
  );
}

const PILL_BASE =
  "group inline-flex h-14 items-center justify-center gap-3 rounded-full px-8 text-[15px] font-bold transition-[box-shadow,background-color,border-color,color] focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60 short:h-12";
const PILL_VARIANTS = {
  primary: "pill-primary text-white focus-visible:outline-sf-violet",
  outline: "border-2 border-vz-ink/85 bg-white/50 text-vz-ink hover:bg-white focus-visible:outline-sf-violet",
  light: "bg-white text-vz-ink shadow-[0_14px_30px_-12px_rgb(0_0_0/0.45)] hover:bg-sf-mist focus-visible:outline-white",
  "outline-light": "border-2 border-white/70 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white",
};

/** Pill button: a router Link for `to`, an anchor for `href`, otherwise a
 *  button. `icon` goes before the label; `arrow` adds a sliding arrow after. */
export function Pill({ to, href, variant = "primary", type = "button", icon: Icon, arrow = false, className = "", children, ...rest }) {
  const classes = `${PILL_BASE} ${PILL_VARIANTS[variant]} ${className}`;
  const content = (
    <>
      {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
      {children}
      {arrow && <ArrowRight className="h-5 w-5 motion-safe:transition-transform group-hover:translate-x-1" aria-hidden="true" />}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
