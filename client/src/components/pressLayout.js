/* Layout settings shared by the pages in the "press" look (Home, Our
   Company), so their sections line up and size alike. */

/** The page's content column. */
export const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";

/** Sections below the hero fill one screen under the sticky navbar (80px) on
 *  wide screens, with their content centred; `short:` (low laptop screens)
 *  tightens them further. Taller content simply grows the section. */
export const SCREEN = "lg:flex lg:min-h-[calc(100svh-5rem)] lg:flex-col lg:justify-center";
export const SCREEN_PAD = "py-16 lg:py-10 short:py-6";

/** A section heading sized to the screen's height as well as its width. */
export const H2_FIT = "text-[clamp(1.875rem,min(3.3vw,6.2svh),2.875rem)]";

/** Glossy badge colours (.svc-badge), as Sifalbitz tints its feature icons:
 *  indigo, then the accents. */
export const BADGE_TONES = ["", "svc-badge--amber", "svc-badge--pink", "svc-badge--sky", "svc-badge--emerald"];
