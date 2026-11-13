/* The seven services' names, menu hints and icons, in the order Pencil Bitz
   lists them. Small on purpose: the navbar loads it with every page, while
   each service's full copy (services.js) loads only with the services pages.
   Slugs and names must match the search entries in seo/site.js. */
import { BookOpen, CalendarCheck, Copyright, Cpu, GraduationCap, Library, Lightbulb } from "lucide-react";

export const SERVICE_LINKS = [
  {
    slug: "textbook-publications",
    name: "Textbook Publications",
    short: "Editing, ISBN & distribution",
    Icon: BookOpen,
  },
  {
    slug: "patent-grant-support",
    name: "Patent Grant Support",
    short: "Filing, drafting & prosecution",
    Icon: Lightbulb,
  },
  {
    slug: "trademarks-copyright",
    name: "Trademarks & Copyright Services",
    navName: "Trademarks & Copyright",
    short: "Protect your brand & creative work",
    Icon: Copyright,
  },
  {
    slug: "ieee-conference-publications",
    name: "IEEE Conference Publications",
    short: "Papers for IEEE & top-tier conferences",
    Icon: Cpu,
  },
  {
    slug: "edited-book-chapters",
    name: "Scopus-Indexed Book Chapters",
    short: "Chapters in SCI & Scopus volumes",
    Icon: Library,
  },
  {
    slug: "academic-events",
    name: "Educational Event Management",
    short: "Conferences, FDPs & workshops",
    Icon: CalendarCheck,
  },
  {
    slug: "professional-upskilling",
    name: "Professional Upskilling Services",
    navName: "Professional Upskilling",
    short: "Programs for educators & professionals",
    Icon: GraduationCap,
  },
];

export const servicePath = (service) => `/services/${service.slug}`;
