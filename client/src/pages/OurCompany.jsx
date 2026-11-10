import React from "react";
import { useEffect, useRef, useState } from "react";

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
    CircleCheck,
    ShieldCheck,
    Star,
} from "lucide-react";
import CtaBanner, { CtaButton } from "../components/CtaBanner";

const WRAP = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-20";
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
        Icon: Copy,
        card: "bg-[#e8f0fc]",
        icon: "border-[#0848a8] text-[#0848a8]",
    },
    {
        title: "Targeted Academic Visibility",
        text: "Connect with institutions, scholars, and key readers using tailored positioning strategies designed specifically for academic textbooks and professional works.",
        Icon: GraduationCap,
        card: "bg-[#efebfd]",
        icon: "border-[#5858c8] text-[#5858c8]",
    },
    {
        title: "Global eBook & Print Distribution",
        text: "Our expansive international distribution network places your title into leading online booksellers and library catalogs worldwide.",
        Icon: Truck,
        card: "bg-[#e2f4ea]",
        icon: "border-[#0f7a55] text-[#0f7a55]",
    },
    {
        title: "Cost-Effective Author Solutions",
        text: "Budget-friendly self-publishing packages crafted to maintain standard setting quality, fast turnaround times, and maximum global reach.",
        Icon: Package,
        card: "bg-[#fdf1df]",
        icon: "border-[#b06a12] text-[#b06a12]",
    },
];

const BENEFITS = [
    ["Academic Community Impact:", "Authorship serves as a foundational benchmark for advancing curriculum standards and supporting higher education."],
    ["Career Advancement & Appraisal:", "Published textbooks directly strengthen eligibility for academic promotions, salary increments, and institutional appraisals."],
    ["Institutional Accreditation Alignment:", "Detailed publication metrics directly support submission criteria for NAAC, UGC, NIRF, NBA, and global ranking frameworks."],
    ["Elevated Professional Profile:", "Having formal publications adds weightage to your CV, establishing lasting academic authority in your discipline."],
    ["Global ISBN Recognition:", "Official ISBN assignment ensures unique worldwide identification, cataloging, and international availability across digital and print networks."],
];

/** The three things the purpose section promises, set large. */
const PURPOSE = [
    { word: "Respect", Icon: CircleCheck, tint: "bg-[#e8f0fc] text-[#0848a8]", color: "text-[#0848a8]" },
    { word: "Credibility", Icon: ShieldCheck, tint: "bg-[#f3e8fb] text-[#7b3fa8]", color: "text-[#7b3fa8]" },
    { word: "Global Reach", Icon: Truck, tint: "bg-[#e2f4ea] text-[#0f6b4a]", color: "text-[#0f6b4a]" },
];

/** Icon and tint for each benefit, in order. */
const BENEFIT_ICONS = [
    { Icon: GraduationCap, tint: "bg-[#e8f0fc] text-[#0848a8]" },
    { Icon: ArrowUpRight, tint: "bg-[#efe9fc] text-[#5858c8]" },
    { Icon: ShieldCheck, tint: "bg-[#fdf1df] text-[#b06a12]" },
    { Icon: Star, tint: "bg-[#fde8f0] text-[#c0306a]" },
    { Icon: BadgeCheck, tint: "bg-[#e2f4ea] text-[#0f7a55]" },
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

/** Why Choose Us cards: 2×2, split by a cross with a badge where the lines
 *  meet. The cards fly in from the sides and join the first time the grid
 *  scrolls into view (see .join-grid in index.css). */
function WhyCards() {
    const ref = useRef(null);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setJoined(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`join-grid relative mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 ${joined ? "is-joined" : ""}`}>
            <span aria-hidden="true" className="join-line-y absolute -inset-y-3 left-1/2 hidden w-px bg-[linear-gradient(to_bottom,#e2e8f0_calc(50%-46px),transparent_calc(50%-46px),transparent_calc(50%+46px),#e2e8f0_calc(50%+46px))] sm:block" />
            <span aria-hidden="true" className="join-line-x absolute -inset-x-3 top-1/2 hidden h-px bg-[linear-gradient(to_right,#e2e8f0_calc(50%-46px),transparent_calc(50%-46px),transparent_calc(50%+46px),#e2e8f0_calc(50%+46px))] sm:block" />
            <span aria-hidden="true" className="join-badge absolute left-1/2 top-1/2 z-10 hidden h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:flex">
                <img src="/assets/image/veritaz-bg-Remove.png" alt="" className="h-20 w-20 object-contain drop-shadow-[0_4px_10px_rgb(8_72_168/0.25)]" />
            </span>

            {FEATURES.map(({ title, text, Icon, card, icon }, i) => (
                <article key={title} className={`join-card ${i % 2 ? "from-right" : "from-left"} relative rounded-2xl p-6 lg:p-8 ${card}`}>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white ${icon}`}>
                        <Icon size={20} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-brand-ink">{title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">{text}</p>
                </article>
            ))}
        </div>
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
        <main className="min-h-screen overflow-x-clip bg-white text-slate-800">

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
                        <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-brand-ink sm:text-5xl xl:text-6xl">
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
                                    <span className="block text-3xl font-bold leading-none text-brand-ink">{number}</span>
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
                        <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-brand-ink sm:text-4xl lg:text-5xl">
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
                            <h2 className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
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
            <section className="overflow-x-clip pb-16 lg:pb-24">
                <div className={WRAP}>
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-brand-ink lg:text-4xl">
                            Why Authors Trust Veritaz International Press
                        </h2>
                        <p className="mt-4 text-lg font-semibold text-slate-900">
                            We don't just publish books—we bring intellectual work to life.
                        </p>
                        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
                            From initial manuscript editing and official ISBN assignment to precision printing and patent filing, we deliver complete solutions that transform original ideas into globally recognized publications.
                        </p>
                    </div>

                    <WhyCards />
                </div>
            </section>

            {/* ================= TECHNICAL BENEFITS ================= */}
            <section className="bg-brand-snow py-16 lg:py-24">
                <div className={`${WRAP} grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-20`}>
                    <div className="lg:sticky lg:top-32 lg:self-start">
                        <h2 className="text-3xl font-bold tracking-tight text-brand-ink lg:text-4xl">
                            Technical Benefits
                        </h2>
                        <p className="mt-4 max-w-md leading-relaxed text-slate-600">
                            What a published, ISBN-registered book does for your teaching, your career and your academic profile.
                        </p>
                    </div>

                    {/* Benefits written on a ruled sheet, with a second sheet peeking out behind */}
                    <div className="relative mx-auto w-full max-w-2xl">
                        <span aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-4 rotate-2 rounded-2xl bg-[#efe6fb]" />
                        <ol className="ruled-paper relative -rotate-1 space-y-7 rounded-2xl py-10 pl-16 pr-6 shadow-[0_18px_40px_rgb(15_23_42/0.10)] sm:pl-20 sm:pr-10">
                            {BENEFITS.map(([label, text], i) => {
                                const { Icon, tint } = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                                return (
                                    <li key={label} className="flex gap-4">
                                        <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${tint}`}>
                                            <Icon size={18} aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-semibold text-brand-ink">{label.replace(/:$/, "")}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </div>
            </section>

            {/* ================= AUTHOR ADVANCEMENT & SUPPORT ================= */}
            <section className="py-16 lg:py-24">
                <div className={`${WRAP} grid items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-[#e8f0fc] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-deep" />
                            Our Purpose
                        </p>
                        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-brand-ink lg:text-4xl">
                            Author Advancement
                            <br />
                            &amp; Support
                        </h2>
                        <p className="mt-5 max-w-lg leading-relaxed text-slate-600">
                            Behind every textbook, patent, and scholarly contribution is a personal vision to inspire others and advance knowledge. At <strong className="font-semibold text-slate-900">Veritaz International Press</strong>, we share that purpose. Whether you are taking your first courageous step as an author or adding another proud achievement to your career, our team supports your vision with genuine care, ensuring your work achieves the respect, credibility, and global reach it truly deserves.
                        </p>
                    </div>

                    <ul className="divide-y divide-slate-200">
                        {PURPOSE.map(({ word, Icon, tint, color }) => (
                            <li key={word} className="flex items-center gap-5 py-4 first:pt-0 last:pb-0">
                                <span className={`flex h-12 w-12 flex-none items-center justify-center rounded-full ${tint}`}>
                                    <Icon size={20} aria-hidden="true" />
                                </span>
                                <span className={`text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${color}`}>{word}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ================= CALL TO ACTION ================= */}
            <section className="pb-16 lg:pb-24">
                <div className={WRAP}>
                    <CtaBanner
                        eyebrow="Publish with Veritaz"
                        title="Ready To Publish Your Book?"
                        titleClass="text-brand-ink"
                        text="We publish textbooks, edited books, thesis books, poetry, short stories and fiction, and guide you from manuscript to finished book."
                        actions={
                            <>
                                <CtaButton to="/book-publishing">Explore Publishing</CtaButton>
                                <CtaButton to="/contact" variant="secondary">Get In Touch</CtaButton>
                            </>
                        }
                    />
                </div>
            </section>
        </main>
    );
}
