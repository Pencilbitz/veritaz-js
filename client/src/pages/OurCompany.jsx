import {
    BookOpen,
    Globe,
    Users,
    Headphones,
    Target,
    Eye,
    Copy,
    GraduationCap,
    Package,
    Truck,
    ArrowUpRight,
    BadgeCheck,
    Building2,
    CircleCheck,
    HeartHandshake,
    ShieldCheck,
    Sparkles,
    Star,
} from "lucide-react";
import { Accent, Eyebrow, Pill, Rule } from "../components/PressUI";
import { BADGE_TONES, H2_FIT, SCREEN, SCREEN_PAD, WRAP } from "../components/pressLayout";
import { useSeo } from "../seo/useSeo";
import { PAGES } from "../seo/site";
import LOGO from "../components/logo";
import heroPhoto from "photo:/assets/image/our-company/hero-books.webp?hero";
import shelfPhoto from "photo:/assets/image/our-company/bookshelf.webp?frame";
import penPhoto from "photo:/assets/image/our-company/pen-book.webp?frame";
import deskPhoto from "photo:/assets/image/our-company/laptop-books.webp?card";
import cover1 from "photo:/assets/image/books/index-1.webp?cover";
import cover2 from "photo:/assets/image/books/index-2.webp?cover";
import cover3 from "photo:/assets/image/books/index-3.webp?cover";

/* Our Company, in the home page's "press" look: lavender, white and navy
   bands, headings with an italic accent word and a brush stroke, glossy icon
   badges, and each section sized to one screen on wide screens. The oc-*
   styles live under "Our Company page." in index.css. */

const COVERS = [cover1, cover2, cover3];
const H2 = `${H2_FIT} leading-[1.1] text-vz-ink`;
const H2_LIGHT = `${H2_FIT} leading-[1.1] text-white`;
const LEAD = "text-base leading-relaxed text-slate-600 lg:text-[17px] short:text-[15px]";

const STATS = [
    { number: "500+", title: "Books Published", Icon: BookOpen },
    { number: "50+", title: "Countries Reached", Icon: Globe },
    { number: "98%", title: "Author Satisfaction", Icon: Users },
    { number: "24/7", title: "Author Support", Icon: Headphones },
];

const KNOWLEDGE = [
    { Icon: Target, text: "We specialize in bringing high-quality textbooks, conference proceedings, patents, and academic works to life fueling innovation and career advancement across disciplines. Beyond complete book production, we manage Faculty Development Programs (FDPs), national and international academic conferences, and comprehensive patent filing to secure your intellectual property." },
    { Icon: Eye, text: "Whether you are an established scholar, educator, or first-time writer, our dedicated team supports your complete workflow: professional manuscript editing, custom cover design, official ISBN registration, precision book printing, worldwide eBook distribution, and full patent grant assistance." },
];

const FEATURES = [
    {
        title: "Multiformat Book Publishing",
        text: "From precision paperback printing to digital formatting, we make your work accessible across every platform with full ISBN registration and custom cover design.",
        Icon: Copy,
    },
    {
        title: "Targeted Academic Visibility",
        text: "Connect with institutions, scholars, and key readers using tailored positioning strategies designed specifically for academic textbooks and professional works.",
        Icon: GraduationCap,
    },
    {
        title: "Global eBook & Print Distribution",
        text: "Our expansive international distribution network places your title into leading online booksellers and library catalogs worldwide.",
        Icon: Truck,
    },
    {
        title: "Cost-Effective Author Solutions",
        text: "Budget-friendly self-publishing packages crafted to maintain standard setting quality, fast turnaround times, and maximum global reach.",
        Icon: Package,
    },
];

const BENEFITS = [
    ["Academic Community Impact:", "Authorship serves as a foundational benchmark for advancing curriculum standards and supporting higher education."],
    ["Career Advancement & Appraisal:", "Published textbooks directly strengthen eligibility for academic promotions, salary increments, and institutional appraisals."],
    ["Institutional Accreditation Alignment:", "Detailed publication metrics directly support submission criteria for NAAC, UGC, NIRF, NBA, and global ranking frameworks."],
    ["Elevated Professional Profile:", "Having formal publications adds weightage to your CV, establishing lasting academic authority in your discipline."],
    ["Global ISBN Recognition:", "Official ISBN assignment ensures unique worldwide identification, cataloging, and international availability across digital and print networks."],
];
const BENEFIT_ICONS = [GraduationCap, ArrowUpRight, ShieldCheck, Star, BadgeCheck];

/** The three things the purpose section promises, set large. */
const PURPOSE = [
    { word: "Respect", Icon: CircleCheck },
    { word: "Credibility", Icon: ShieldCheck },
    { word: "Global Reach", Icon: Truck },
];
const PURPOSE_TONES = ["", "svc-badge--pink", "svc-badge--emerald"];

/** Hero: the desk photo full width under a deep navy shade, the title and
 *  lead left-aligned in white with a gold rule, and the four figures in a
 *  frosted strip along the foot. */
function Hero() {
    return (
        <header className="oc-hero relative isolate flex flex-col overflow-hidden text-white lg:min-h-[calc(100svh-7.6rem)]">
            <img
                {...heroPhoto}
                alt=""
                fetchPriority="high"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-[72%_50%]"
            />
            <span className="oc-hero-shade" aria-hidden="true" />

            <div className={`${WRAP} flex flex-1 items-center py-16 lg:py-12 short:py-8`}>
                <div className="max-w-2xl">
                    <Eyebrow tone="light" icon={BadgeCheck}>
                        Trusted Academic Publisher
                    </Eyebrow>
                    <h1 className="mt-6 text-[2.25rem] leading-[1.1] text-white sm:text-5xl lg:text-[clamp(2.4rem,min(4vw,7.4svh),3.6rem)] short:mt-4">
                        About <span className="hero-accent hero-accent--light">Veritaz</span>
                        <br />
                        International Press
                    </h1>
                    <span className="oc-hero-rule mt-6 block h-1 w-20 rounded-full short:mt-4" aria-hidden="true" />
                    <p className="mt-6 text-base leading-relaxed text-white/80 lg:text-[17px] short:mt-4 short:text-[15px]">
                        We provide complete book publishing with editing, custom cover design, official ISBN registration, precision printing, and global eBook distribution. We deliver full patent filing and registration support to protect intellectual property for authors, scholars, and innovators.
                    </p>
                </div>
            </div>

            <div className="oc-hero-stats">
                <dl className={`${WRAP} grid grid-cols-2 sm:grid-cols-4`}>
                    {STATS.map(({ number, title, Icon }, i) => (
                        <div
                            key={title}
                            className={`flex flex-col-reverse gap-1 py-5 sm:py-6 short:py-4 ${i % 2 ? "pl-5" : ""} ${i ? "sm:border-l sm:border-white/15 sm:pl-6 lg:pl-8" : ""} ${i > 1 ? "border-t border-white/15 sm:border-t-0" : ""}`}
                        >
                            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">{title}</dt>
                            <dd className="flex items-center gap-3">
                                <span className="oc-hero-icon" aria-hidden="true">
                                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                                </span>
                                <span className="font-display text-[2rem] font-bold leading-none text-white tabular-nums lg:text-[2.25rem]">{number}</span>
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </header>
    );
}

/** About our company: the bookshelf photo on a violet backing with the logo
 *  as a seal, beside the welcome text. */
function About() {
    return (
        <section className={`vz-draft relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
            <div className={`${WRAP} grid items-center gap-16 lg:grid-cols-2 lg:gap-20`}>
                <div className="oc-frame relative mx-3 mb-4 sm:mx-8 lg:m-0 lg:mr-6">
                    <span className="oc-frame-back" aria-hidden="true" />
                    <img
                        {...shelfPhoto}
                        alt="Our Team"
                        loading="lazy"
                        className="oc-frame-img reveal relative aspect-[4/3] w-full rounded-[2rem] object-cover lg:aspect-auto lg:h-[min(28rem,calc(100svh-13rem))]"
                    />
                    <span className="oc-seal" aria-hidden="true">
                        <img {...LOGO} alt="" loading="lazy" />
                    </span>
                </div>

                <div className="min-w-0">
                    <Eyebrow icon={Building2}>ABOUT OUR COMPANY</Eyebrow>
                    <h2 className={`reveal mt-5 ${H2} short:mt-3`}>
                        Empowering Authors &amp; Innovators <Accent>Worldwide</Accent>
                    </h2>
                    <p className={`mt-6 ${LEAD} short:mt-4`}>
                        <strong className="font-bold text-vz-ink">Welcome to Veritaz International Press</strong>,
                        a trusted destination for comprehensive publication services and patent solutions. We support educators, scholars, and institutions by advancing careers and turning original intellectual work into globally recognized publications.
                    </p>
                    <p className="oc-callout mt-5 rounded-r-2xl py-4 pl-5 pr-4 text-base leading-relaxed text-slate-700 short:py-3">
                        From initial concept to multi channel reach, our dedicated team ensures your work achieves maximum impact, authority, and professional credibility.
                    </p>
                </div>
            </div>
        </section>
    );
}

/** Publishing knowledge without limits: a navy band, the two statements on
 *  glass cards, and the pen-and-book photo glowing violet beside them. */
function Knowledge() {
    return (
        <section className={`vz-shelf-band relative isolate overflow-hidden text-white ${SCREEN_PAD} ${SCREEN}`}>
            <div className={`${WRAP} grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16`}>
                <div className="min-w-0">
                    <Rule tone="dark" />
                    <h2 className={`reveal mt-5 ${H2_LIGHT} short:mt-3`}>
                        Publishing Knowledge <Accent tone="light">Without Limits</Accent>
                    </h2>
                    <ul className="mt-8 grid gap-4 short:mt-5 short:gap-3">
                        {KNOWLEDGE.map(({ Icon, text }, i) => (
                            <li key={i} className="oc-glass reveal flex gap-5 rounded-3xl p-6 short:p-4">
                                <span aria-hidden="true" className={`svc-badge svc-badge--sm ${i ? "svc-badge--pink" : ""}`}>
                                    <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                                </span>
                                <p className="text-[15px] leading-relaxed text-white/85 lg:text-base short:text-sm">{text}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="oc-photo relative mx-3 sm:mx-8 lg:mx-0">
                    <img
                        {...penPhoto}
                        alt=""
                        loading="lazy"
                        className="reveal h-[22rem] w-full rounded-[2rem] object-cover object-[50%_70%] sm:h-[26rem] lg:h-[min(32rem,calc(100svh-12rem))]"
                    />
                </div>
            </div>
        </section>
    );
}

/** Why authors trust us: the heading and lead in a row, then the four
 *  strengths two by two, each with a glossy badge beside its text and its
 *  icon faint in the corner. */
function WhyTrust() {
    return (
        <section className={`vz-services relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
            <div className={WRAP}>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
                    <div className="min-w-0">
                        <Rule />
                        <h2 className={`reveal mt-5 ${H2} short:mt-3`}>
                            Why Authors Trust Veritaz International <Accent>Press</Accent>
                        </h2>
                    </div>
                    <div className="reveal">
                        <p className="text-base font-bold text-vz-ink lg:text-[17px]">
                            We don't just publish books—we bring intellectual work to life.
                        </p>
                        <p className="mt-3 text-[15px] leading-relaxed text-slate-600 lg:text-base short:text-sm">
                            From initial manuscript editing and official ISBN assignment to precision printing and patent filing, we deliver complete solutions that transform original ideas into globally recognized publications.
                        </p>
                    </div>
                </div>

                <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12 short:mt-6 short:gap-3">
                    {FEATURES.map(({ title, text, Icon }, i) => (
                        <li key={title} className="svc-card reveal group relative isolate flex items-start gap-5 overflow-hidden rounded-3xl bg-white p-6 short:p-4">
                            <span aria-hidden="true" className="svc-card-glow" />
                            <Icon className="oc-watermark" strokeWidth={1.2} aria-hidden="true" />
                            <span aria-hidden="true" className={`svc-badge ${BADGE_TONES[[0, 2, 4, 1][i]]}`}>
                                <Icon className="relative z-10 h-6 w-6" strokeWidth={1.8} />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold leading-snug text-vz-ink short:text-base">{title}</h3>
                                <p className="mt-2 text-[15px] leading-relaxed text-slate-600 short:mt-1 short:text-sm">{text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/** Technical benefits: the heading and a desk photo on the left; the five
 *  benefits down a rail on the right, which draws itself as it scrolls in. */
function Benefits() {
    return (
        <section className={`vz-draft relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
            <div className={`${WRAP} grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-20`}>
                <div className="min-w-0">
                    <Rule />
                    <h2 className={`reveal mt-5 ${H2} short:mt-3`}>
                        Technical <Accent>Benefits</Accent>
                    </h2>
                    <p className={`reveal mt-5 max-w-md ${LEAD}`}>
                        What a published, ISBN-registered book does for your teaching, your career and your academic profile.
                    </p>
                    <img
                        {...deskPhoto}
                        alt=""
                        loading="lazy"
                        className="oc-tilt reveal mt-10 hidden aspect-[4/3] w-full max-w-sm rounded-[1.75rem] object-cover object-[50%_60%] lg:block short:hidden"
                    />
                </div>

                <div className="relative min-w-0">
                    <span className="oc-rail" aria-hidden="true">
                        <span className="oc-rail-fill" />
                    </span>
                    <ol className="relative grid gap-3 short:gap-2">
                        {BENEFITS.map(([label, text], i) => {
                            const Icon = BENEFIT_ICONS[i];
                            return (
                                <li key={label} className="reveal relative flex items-center gap-4 sm:gap-5">
                                    <span aria-hidden="true" className={`svc-badge svc-badge--sm z-10 ${BADGE_TONES[i % BADGE_TONES.length]}`}>
                                        <Icon className="relative z-10 h-5 w-5" strokeWidth={1.8} />
                                    </span>
                                    <div className="svc-card relative isolate min-w-0 flex-1 overflow-hidden rounded-2xl bg-white px-5 py-4 short:py-2.5">
                                        <span aria-hidden="true" className="svc-card-glow" />
                                        <h3 className="text-base font-bold leading-snug text-vz-ink lg:text-[17px] short:text-[15px]">{label.replace(/:$/, "")}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-600 short:text-[13px] short:leading-snug">{text}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </section>
    );
}

/** Our purpose: the text on the left; the three promises set huge on the
 *  right, each filling with colour as it scrolls into view. */
function Purpose() {
    return (
        <section className={`vz-services relative isolate overflow-hidden ${SCREEN_PAD} ${SCREEN}`}>
            <div className={`${WRAP} grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20`}>
                <div className="min-w-0">
                    <Eyebrow icon={HeartHandshake}>Our Purpose</Eyebrow>
                    <h2 className={`reveal mt-5 ${H2} short:mt-3`}>
                        Author Advancement
                        <br />
                        &amp; <Accent>Support</Accent>
                    </h2>
                    <p className={`mt-6 max-w-xl ${LEAD} short:mt-4`}>
                        Behind every textbook, patent, and scholarly contribution is a personal vision to inspire others and advance knowledge. At <strong className="font-bold text-vz-ink">Veritaz International Press</strong>, we share that purpose. Whether you are taking your first courageous step as an author or adding another proud achievement to your career, our team supports your vision with genuine care, ensuring your work achieves the respect, credibility, and global reach it truly deserves.
                    </p>
                </div>

                <ul className="min-w-0">
                    {PURPOSE.map(({ word, Icon }, i) => (
                        <li key={word} className="oc-word-row flex items-center gap-5 border-b border-vz-line py-5 last:border-0 sm:gap-7 short:py-3">
                            <span aria-hidden="true" className={`svc-badge ${PURPOSE_TONES[i]}`}>
                                <Icon className="relative z-10 h-6 w-6" strokeWidth={1.8} />
                            </span>
                            <span className={`oc-word oc-word--${i} font-display text-[clamp(2.5rem,min(5.4vw,10svh),4.5rem)] font-bold leading-none tracking-[-0.015em]`}>
                                {word}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/** The close: a night-indigo card asking authors to publish with us, with
 *  three real books standing fanned on a lit shelf; they spread on hover. */
function PublishCta() {
    return (
        <section className="relative isolate overflow-hidden bg-white py-16 lg:py-20 short:py-12">
            <div className={WRAP}>
                <div className="oc-cta relative isolate overflow-hidden rounded-[2.5rem] text-white lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center">
                    <span className="oc-cta-dots" aria-hidden="true" />
                    <div className="relative z-10 px-6 pb-2 pt-12 sm:px-12 lg:py-16 lg:pl-16 xl:pl-20">
                        <Eyebrow tone="light" icon={Sparkles}>
                            Publish with Veritaz
                        </Eyebrow>
                        <h2 className={`mt-5 ${H2_LIGHT}`}>
                            Ready To Publish Your <Accent tone="light">Book?</Accent>
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 lg:text-[17px]">
                            We publish textbooks, edited books, thesis books, poetry, short stories and fiction, and guide you from manuscript to finished book.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Pill to="/book-publishing" variant="light" arrow>
                                Explore Publishing
                            </Pill>
                            <Pill to="/contact" variant="outline-light">
                                Get In Touch
                            </Pill>
                        </div>
                    </div>

                    <div className="oc-cta-books relative" aria-hidden="true">
                        <span className="oc-cta-shelf" />
                        {COVERS.map((cover, i) => (
                            <img key={cover.src} {...cover} alt="" loading="lazy" className={`oc-cta-book oc-cta-book--${i}`} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function OurCompany() {
    useSeo(PAGES["/our-company"]);
    return (
        <main className="overflow-x-clip bg-white text-slate-800">
            <Hero />
            <About />
            <Knowledge />
            <WhyTrust />
            <Benefits />
            <Purpose />
            <PublishCta />
        </main>
    );
}
