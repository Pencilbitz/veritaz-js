import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import {
    Award,
    BookOpen,
    Globe,
    Users,
    Headphones,
    Target,
    Eye,
    Megaphone,
    Wallet,
    Check,
} from "lucide-react";

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";
const SERIF = { fontFamily: "var(--font-serif)" };
const IMG = "/assets/image/our-company";
const SOFT = "shadow-[0_10px_30px_rgb(88_88_200/0.10)]";

const STATS = [
    { number: "500+", title: "Books Published", Icon: BookOpen },
    { number: "50+", title: "Countries Reached", Icon: Globe },
    { number: "98%", title: "Author Satisfaction", Icon: Users },
    { number: "24/7", title: "Author Support", Icon: Headphones },
];

const FEATURES = [
    {
        title: "Multiformat Book Publishing",
        text: "From precision paperback printing to digital formatting, we make your work accessible across every platform with full ISBN registration and custom cover design.",
        Icon: BookOpen,
        tile: "from-brand-bright to-brand-deep",
    },
    {
        title: "Targeted Academic Visibility",
        text: "Connect with institutions, scholars, and key readers using tailored positioning strategies designed specifically for academic textbooks and professional works.",
        Icon: Megaphone,
        tile: "from-brand-violet to-[#7a4fd6]",
    },
    {
        title: "Global eBook & Print Distribution",
        text: "Our expansive international distribution network places your title into leading online booksellers and library catalogs worldwide.",
        Icon: Globe,
        tile: "from-brand-bright to-brand-violet",
    },
    {
        title: "Cost-Effective Author Solutions",
        text: "Budget-friendly self-publishing packages crafted to maintain standard setting quality, fast turnaround times, and maximum global reach.",
        Icon: Wallet,
        tile: "from-brand-goldlight to-brand-gold",
    },
];

const BENEFITS = [
    ["Academic Community Impact:", "Authorship serves as a foundational benchmark for advancing curriculum standards and supporting higher education."],
    ["Career Advancement & Appraisal:", "Published textbooks directly strengthen eligibility for academic promotions, salary increments, and institutional appraisals."],
    ["Institutional Accreditation Alignment:", "Detailed publication metrics directly support submission criteria for NAAC, UGC, NIRF, NBA, and global ranking frameworks."],
    ["Elevated Professional Profile:", "Having formal publications adds weightage to your CV, establishing lasting academic authority in your discipline."],
    ["Global ISBN Recognition:", "Official ISBN assignment ensures unique worldwide identification, cataloging, and international availability across digital and print networks."],
];

/** Small uppercase label with a gold rule, as in the reference. */
function Eyebrow({ children, rule = "before", center = false }) {
    const line = <span aria-hidden="true" className="h-0.5 w-10 flex-none bg-brand-gold" />;
    return (
        <p className={`flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em] text-brand-ink ${center ? "justify-center" : ""}`}>
            {(rule === "before" || rule === "both") && line}
            {children}
            {(rule === "after" || rule === "both") && line}
        </p>
    );
}

export default function OurCompany() {
    useEffect(() => {
            document.title = "About Veritaz International | Academic Publishing Experts";
    
            // 1. Meta Description
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.name = "description";
                document.head.appendChild(metaDescription);
            }
            metaDescription.content = "Learn about Veritaz International,a trusted academic publishing company offering textbook publication, ISBN,patent,copyright and research support services.";
    
            // 2. Meta Keywords
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = "keywords";
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.content = "about Veritaz International, academic publishing company, textbook publisher India, research support services, ISBN registration company, patent and copyright services India";            
            // 3. Robots Tag
            let metaRobots = document.querySelector('meta[name="robots"]');
            if (!metaRobots) {
                metaRobots = document.createElement('meta');
                metaRobots.name = "robots";
                document.head.appendChild(metaRobots);
            }
            metaRobots.content = "index, follow";
    
            // 4. Canonical Link
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = "canonical";
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.href = "https://www.veritazinternational.com/our-company";
        }, []);
    return (
        <main className="min-h-screen overflow-hidden bg-white text-slate-800">

            {/* ================= HERO ================= */}
            <header className="relative bg-gradient-to-br from-brand-paper via-white to-brand-snow">
                {/* Photo on the right with a curved left edge, and lavender
                    swooshes following the curve. */}
                <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[52%] lg:block">
                    <span className="oc-curve absolute inset-0 -translate-x-6 bg-brand-violet/15" />
                    <span className="oc-curve absolute inset-0 -translate-x-3 bg-brand-violet/25" />
                    <img src={`${IMG}/hero-books.png`} alt="" className="oc-curve absolute inset-0 h-full w-full object-cover" />
                </div>

                <div className={`${WRAP} relative grid pb-28 pt-14 lg:min-h-[520px] lg:grid-cols-2 lg:items-center lg:pb-32 lg:pt-16`}>
                    <div className="max-w-xl">
                        <Eyebrow rule="after">Trusted Academic Publisher</Eyebrow>
                        <h1 style={SERIF} className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-brand-ink sm:text-5xl xl:text-6xl">
                            About <span className="text-brand-bright">Veritaz</span>
                            <br />
                            International Press
                        </h1>
                        <p className="mt-6 text-lg leading-relaxed text-slate-600">
                            We provide complete book publishing with editing, custom cover design, official ISBN registration, precision printing, and global eBook distribution. We deliver full patent filing and registration support to protect intellectual property for authors, scholars, and innovators.
                        </p>
                    </div>
                    <img src={`${IMG}/hero-books.png`} alt="" aria-hidden="true" className="mt-10 aspect-[16/10] w-full rounded-3xl object-cover lg:hidden" />
                </div>
            </header>

            {/* Stats bar, overlapping the bottom of the hero */}
            <div className={`${WRAP} relative z-10 -mt-16`}>
                <dl className={`grid grid-cols-2 gap-y-6 rounded-3xl border border-brand-violet/10 bg-white px-6 py-7 lg:grid-cols-4 lg:px-10 ${SOFT}`}>
                    {STATS.map(({ number, title, Icon }, i) => (
                        <div key={title} className={`flex items-center justify-center gap-4 ${i > 0 ? "lg:border-l lg:border-brand-violet/15" : ""}`}>
                            <Icon size={38} strokeWidth={1.5} aria-hidden="true" className={i % 2 ? "text-brand-violet" : "text-brand-bright"} />
                            <div>
                                <dt className="sr-only">{title}</dt>
                                <dd>
                                    <span style={SERIF} className="block text-3xl font-semibold leading-none text-brand-ink">{number}</span>
                                    <span className="mt-1 block text-sm font-medium text-slate-600">{title}</span>
                                </dd>
                            </div>
                        </div>
                    ))}
                </dl>
            </div>

            {/* ================= ABOUT OUR COMPANY ================= */}
            <section className="py-16 lg:py-24">
                <div className={`${WRAP} grid items-center gap-14 lg:grid-cols-2 lg:gap-20`}>
                    <div className="relative mx-4 sm:mx-8">
                        <span aria-hidden="true" className="absolute -right-8 -top-6 h-[70%] w-[42%] rounded-3xl bg-brand-violet/15" />
                        <span aria-hidden="true" className="absolute -bottom-6 -left-8 h-[70%] w-[45%] rounded-3xl bg-brand-paper" />
                        <img src={`${IMG}/bookshelf.png`} alt="Our Team" className="relative aspect-[16/9] w-full rounded-3xl object-cover" />
                    </div>

                    <div>
                        <Eyebrow>ABOUT OUR COMPANY</Eyebrow>
                        <h2 style={SERIF} className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-brand-ink sm:text-4xl lg:text-5xl">
                            Empowering Authors &amp; Innovators Worldwide
                        </h2>
                        <p className="mt-6 leading-relaxed text-slate-600">
                            <strong className="text-brand-ink">Welcome to Veritaz International Press</strong>,
                            a trusted destination for comprehensive publication services and patent solutions. We support educators, scholars, and institutions by advancing careers and turning original intellectual work into globally recognized publications.
                        </p>
                        <p className="mt-4 leading-relaxed text-slate-600">
                            From initial concept to multi channel reach, our dedicated team ensures your work achieves maximum impact, authority, and professional credibility.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= ABOUT VERITAZ (band) ================= */}
            <section className="pb-16 pt-6 lg:pb-24">
                <div className={WRAP}>
                    <div className="relative rounded-3xl bg-gradient-to-r from-brand-paper via-brand-paper to-[#e3e1fb]">
                        {/* Photo at the right end of the band: it rises a little above
                            the band's top edge, has rounded right corners and a curved
                            left edge over a soft swoosh, as in the reference. */}
                        <div aria-hidden="true" className="absolute -top-5 bottom-0 right-0 hidden w-[36%] lg:block">
                            <span className="oc-curve absolute inset-0 -translate-x-4 rounded-r-3xl bg-white/70" />
                            <span className="oc-curve absolute inset-0 -translate-x-2 rounded-r-3xl bg-brand-bright/30" />
                            <img src={`${IMG}/pen-book.png`} alt="" className="oc-curve absolute inset-0 h-full w-full rounded-r-3xl object-cover object-[50%_75%]" />
                        </div>

                        <div className="relative p-8 sm:p-10 lg:pr-[40%]">
                            <h2 style={SERIF} className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
                                Publishing Knowledge Without Limits
                            </h2>

                            <div className="mt-8 divide-y divide-brand-violet/20">
                                {[
                                    { Icon: Target, text: "We specialize in bringing high-quality textbooks, conference proceedings, patents, and academic works to life fueling innovation and career advancement across disciplines. Beyond complete book production, we manage Faculty Development Programs (FDPs), national and international academic conferences, and comprehensive patent filing to secure your intellectual property." },
                                    { Icon: Eye, text: "Whether you are an established scholar, educator, or first-time writer, our dedicated team supports your complete workflow: professional manuscript editing, custom cover design, official ISBN registration, precision book printing, worldwide eBook distribution, and full patent grant assistance." },
                                ].map(({ Icon, text }, i) => (
                                    <div key={i} className={`flex gap-5 ${i === 0 ? "pb-6" : "pt-6"}`}>
                                        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-brand-violet to-[#7a4fd6] text-white">
                                            <Icon size={26} aria-hidden="true" />
                                        </span>
                                        <p className="leading-relaxed text-slate-700">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= WHY CHOOSE US ================= */}
            <section className="pb-16 lg:pb-24">
                <div className={WRAP}>
                    <div className="mx-auto max-w-3xl text-center">
                        <Eyebrow rule="both" center>✦ Why Choose Us</Eyebrow>
                        <h2 style={SERIF} className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-brand-ink sm:text-4xl lg:text-5xl">
                            Why Authors Trust Veritaz International Press
                        </h2>
                        <p className="mt-6 leading-relaxed text-slate-600">
                            We don't just publish books—we bring intellectual work to life. From initial manuscript editing and official ISBN assignment to precision printing and patent filing, we deliver complete solutions that transform original ideas into globally recognized publications.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map(({ title, text, Icon, tile }) => (
                            <article key={title} className={`rounded-3xl border border-brand-violet/15 bg-white p-7 ${SOFT}`}>
                                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${tile}`}>
                                    <Icon size={26} aria-hidden="true" />
                                </span>
                                <h3 style={SERIF} className="mt-6 text-2xl font-semibold leading-tight text-brand-ink">{title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
                            </article>
                        ))}
                    </div>

                    {/* Your Success Is Our Priority */}
                    <div className="mt-6 flex flex-col items-center justify-between gap-6 rounded-3xl border border-brand-violet/15 bg-brand-paper px-8 py-6 sm:flex-row">
                        <div className="flex items-center gap-4">
                            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-brand-goldlight to-brand-gold text-brand-ink">
                                <Award size={24} aria-hidden="true" />
                            </span>
                            <p style={SERIF} className="text-2xl font-semibold text-brand-ink">
                                Your Success <span className="font-medium text-slate-600">Is Our Priority</span>
                            </p>
                        </div>
                        <p className="flex items-baseline gap-2">
                            <span style={SERIF} className="text-3xl font-semibold text-brand-bright">500+</span>
                            <span className="text-sm font-medium text-slate-600">Successful Publications</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= TECHNICAL BENEFITS ================= */}
            <section className="pb-16 lg:pb-24">
                <div className={WRAP}>
                    <div className="relative grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                        <img
                            src={`${IMG}/laptop-books.png`}
                            alt=""
                            aria-hidden="true"
                            className="aspect-[16/9] w-full rounded-t-3xl object-cover object-[40%_74%] lg:absolute lg:inset-y-0 lg:left-0 lg:aspect-auto lg:h-full lg:w-[48%] lg:rounded-3xl"
                        />

                        <div className="oc-panel relative rounded-b-3xl bg-gradient-to-br from-brand-ink via-brand-deep to-brand-deep px-8 py-10 text-white sm:px-12 lg:col-start-2 lg:rounded-3xl lg:py-12 lg:pl-20">
                            <h2 className="text-2xl font-semibold uppercase tracking-[0.25em] sm:text-3xl">
                                TECHNICAL BENEFITS
                            </h2>
                            <ol className="mt-8 space-y-4">
                                {BENEFITS.map(([label, text]) => (
                                    <li key={label} className="flex gap-3">
                                        <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-gold text-brand-ink">
                                            <Check size={15} strokeWidth={3} aria-hidden="true" />
                                        </span>
                                        <p className="leading-relaxed text-white/85">
                                            <strong className="text-white">{label}</strong> {text}
                                        </p>
                                    </li>
                                ))}
                            </ol>

                            <div className="mt-8 border-t border-white/15 pt-6">
                                <p className="leading-relaxed text-white/85">
                                    <strong className="mb-2 block text-brand-goldlight">AUTHOR ADVANCEMENT &amp; SUPPORT</strong>
                                    Behind every textbook, patent, and scholarly contribution is a personal vision to inspire others and advance knowledge. At <strong className="text-white">Veritaz International Press</strong>, we share that purpose. Whether you are taking your first courageous step as an author or adding another proud achievement to your career, our team supports your vision with genuine care, ensuring your work achieves the respect, credibility, and global reach it truly deserves.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= AWARD BAND ================= */}
            <section className="pb-16 lg:pb-24">
                <div className={WRAP}>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-deep via-brand-violet to-[#6a5ad8] px-8 py-8 text-white sm:px-12">
                        <span aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-white/10" />
                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
                            <Award size={64} strokeWidth={1.25} aria-hidden="true" className="flex-none text-white" />
                            <div className="flex-1">
                                <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-goldlight">
                                    Trusted Excellence
                                </span>
                                <h3 style={SERIF} className="mt-2 text-3xl font-semibold">
                                    Award-Winning Publishing Support
                                </h3>
                                <p className="mt-3 max-w-3xl leading-relaxed text-white/85">
                                    Recognized for high standard author care, our team delivers personalized assistance for textbook releases, patent grant processing, and academic event publishing to ensure maximum professional reach.
                                </p>
                            </div>
                            <span aria-hidden="true" className="hidden h-20 w-px bg-white/25 lg:block" />
                            <Link
                                to="/book-publishing"
                                className="shrink-0 self-start rounded-full bg-white px-8 py-3.5 font-bold text-brand-deep transition-colors hover:bg-brand-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:self-center"
                            >
                                Learn More →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
