import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BUTTON_BASE =
  "group inline-flex items-center justify-between gap-4 h-14 rounded-full pl-7 pr-1.5 text-[15px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep";

const VARIANTS = {
  primary: {
    button: "bg-brand-ink text-white hover:bg-brand-deep",
    circle: "bg-white text-brand-deep",
  },
  secondary: {
    button: "border border-brand-deep bg-white text-brand-deep hover:bg-brand-snow",
    circle: "bg-brand-deep text-white",
  },
};

/** Pill button with the arrow in a circle at its end. Renders a router Link
 *  for `to`, an anchor for `href`, otherwise a plain button. */
export function CtaButton({ to, href, variant = "primary", className = "", children, ...rest }) {
  const v = VARIANTS[variant];
  const classes = `${BUTTON_BASE} ${v.button} ${className}`;
  const content = (
    <>
      <span>{children}</span>
      <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ${v.circle}`}>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
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
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}

/** Light-blue call-to-action card with concentric rings on the right.
 *  `children` sits between the text and the buttons (e.g. a stats row). */
export default function CtaBanner({ eyebrow, title, text, actions, children, className = "", titleClass = "text-slate-900" }) {
  return (
    <div className={`cta-card relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 lg:px-24 lg:py-24 ${className}`}>
      <span className="cta-rings" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>

      <div className="relative max-w-3xl">
        {eyebrow && (
          <p className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
            <span className="h-2 w-2 rounded-full bg-brand-deep" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h2 className={`mt-5 max-w-xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl ${titleClass}`}>
          {title}
        </h2>
        {text && <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 lg:text-lg">{text}</p>}
        {children}
        {actions && <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
