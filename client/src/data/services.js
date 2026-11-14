import {
  Award,
  BadgeCheck,
  Barcode,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Copyright,
  Cpu,
  FilePen,
  FileSearch,
  FileText,
  Gauge,
  Globe,
  GraduationCap,
  Layers,
  Library,
  ListOrdered,
  Mic,
  Palette,
  Presentation,
  Scale,
  School,
  Search,
  Send,
  ShieldCheck,
  SpellCheck,
  Stamp,
  Target,
  Truck,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { SERVICE_LINKS, servicePath } from "./serviceLinks";

/* What each service's page says, for the Services overview
   (pages/Services.jsx) and each service's own page (pages/ServiceDetail.jsx).
   Names, menu hints and icons are in serviceLinks.js, which the navbar loads
   with every page; this copy downloads only with the services pages. Search
   titles and descriptions for these pages live in seo/site.js.

   Every section of a service page is optional: a service shows only the
   sections it has data for.
   - h1: [before, accent, after]; the accent word is set in the italic serif.
   - highlights: the four things named in the hero's frosted strip.
   - overview: the photo beside the opening text; `callout` is set off as a
     pull-quote and `points` as a short list.
   - offerings: cards in a grid.
   - steps: a numbered process down a rail.
   - coverage: groups of short labels on the navy band.
   - audience: who the service is for. */

const IMG = "/assets/image/services";

const CONTENT = [
  {
    slug: "textbook-publications",
    summary:
      "National and international textbook publishing, from manuscript support and editing to ISBN registration and Flipkart distribution.",
    hero: `${IMG}/textbook-hero-fhd.jpg`,
    heroPosition: "center center",
    h1: ["", "Textbook", "Publications for Students, Educators & Institutions"],
    lead:
      "National & international textbook publishing with Flipkart distribution. We help educators and subject experts transform academic content into structured textbooks designed for students, institutions and professional learners.",
    cta: "Publish Your Textbook",
    highlights: [
      { label: "ISBN Registration", Icon: Barcode },
      { label: "Library Legal Deposit", Icon: Library },
      { label: "Flipkart Distribution", Icon: Truck },
      { label: "Cover Design", Icon: Palette },
    ],
    overview: {
      eyebrow: "The Transformation",
      title: ["From Academic Content to a Structured", "Textbook"],
      image: `${IMG}/textbook-detail-fhd.jpg`,
      imageAlt: "A university classroom with an open laptop, potted plant, and a stack of academic textbooks on a wooden desk",
      body: [
        "Textbook publications provide high-quality academic and educational materials designed to meet modern curriculum standards and student needs. Our content is accurate, clear, and easy to understand.",
        "We also support faculty development programs, helping teachers improve their skills and knowledge through reliable educational resources.",
      ],
      callout:
        "Trusted by schools and colleges across the country, we aim to make learning and teaching better through impactful publications.",
    },
    offerings: {
      eyebrow: "Our Support",
      title: ["From Academic Content to a Published", "Textbook"],
      text: "Support across key areas of textbook development and publication.",
      items: [
        { title: "Manuscript Support", text: "Support for preparing academic manuscript content.", Icon: FilePen },
        { title: "Content Development", text: "Help developing and structuring textbook content.", Icon: Layers },
        { title: "Textbook Editing", text: "Editorial support to improve the prepared content.", Icon: SpellCheck },
        { title: "Book Formatting", text: "Professional formatting for the book, with index registers.", Icon: ListOrdered },
        { title: "Book Cover Design", text: "Cover design support for the published textbook.", Icon: Palette },
        { title: "Publication Support", text: "ISBN registration, library legal deposit and metadata cataloguing.", Icon: Barcode },
        { title: "Distribution Support", text: "Flipkart distribution, major marketplaces and open-library access.", Icon: Truck },
      ],
    },
    audience: {
      eyebrow: "Who We Support",
      title: ["Built for Those Who Teach, Learn &", "Create Knowledge"],
      items: [
        { title: "Educators", text: "Shape academic knowledge into structured learning resources.", Icon: Presentation },
        { title: "Subject Experts", text: "Transform expertise into accessible textbook content.", Icon: GraduationCap },
        { title: "Students", text: "Support structured learning with professionally prepared textbooks.", Icon: BookOpen },
        { title: "Institutions", text: "Create academic resources aligned with educational needs.", Icon: Building2 },
        { title: "Professional Learners", text: "Make specialised knowledge more accessible for continued learning.", Icon: Briefcase },
      ],
    },
    close: {
      title: ["Have Academic Content Ready to Become a", "Textbook?"],
      text: "Take the next step toward publishing your textbook. Work with Veritaz International Press to transform your academic content into a structured textbook.",
      also: { to: "/book-publishing", label: "See Book Publishing" },
    },
  },

  {
    slug: "patent-grant-support",
    summary:
      "Patentability assessment, technical drafting, filing and examination support across India, the US, the UK, Germany, Japan, Australia, Canada and South Africa.",
    hero: `${IMG}/patent-hero-fhd.jpg`,
    heroPosition: "center center",
    h1: ["Patent", "Grant", "& IP Registration Services"],
    lead:
      "Expert patent grant support with structured patent filing, patent registration, precise documentation, comprehensive IP services, and professional grant assistance for innovators, startups, and enterprises.",
    cta: "Enquire About Patent Support",
    highlights: [
      { label: "Prior Art Search", Icon: FileSearch },
      { label: "Technical Drafting", Icon: FilePen },
      { label: "Filing in 8 Countries", Icon: Globe },
      { label: "Office Action Support", Icon: ClipboardCheck },
    ],
    overview: {
      eyebrow: "Why Veritaz",
      title: ["Why Choose Veritaz for Patent", "Services?"],
      image: `${IMG}/patent-detail-fhd.jpg`,
      imageAlt: "Official patent grant certificate with gold seal, technical blueprints, and laptop on an executive legal desk",
      body: [
        "We specialize in assisting clients in securing their intellectual property rights across multiple jurisdictions, including India, the US, the UK, Germany, Japan, Australia, Canada, and South Africa.",
      ],
      callout:
        "Aligned with national and international registry frameworks, our mission is to safeguard your innovations while maximizing their commercial value.",
      points: [
        { title: "Multi-Country Patent Filing Support", text: "Seamless cross-border protection tailored to your target markets." },
        { title: "Structured Documentation & Legal Drafting", text: "Precise technical writing and compliance-focused paperwork." },
        { title: "Regulatory Compliance Expertise", text: "Navigating complex international patent office requirements with complete accuracy." },
        { title: "Dedicated IP Coordination Team", text: "End-to-end guidance from initial consultation to final grant." },
      ],
    },
    offerings: {
      eyebrow: "Core Services",
      title: ["Our Core Patent", "Services"],
      text: "Our dedicated team guides you through every stage of the intellectual property lifecycle, from patentability assessment and technical drafting to filing, prosecution, and final grant.",
      items: [
        {
          title: "Patentability Assessment & Prior Art Search",
          text: "Evaluating novelty and prior art to ensure your innovation stands on solid ground.",
          Icon: FileSearch,
        },
        {
          title: "National & International Patent Filing",
          text: "Comprehensive patent filing and official patent registration across key global jurisdictions.",
          Icon: Globe,
        },
        {
          title: "Examination & Prosecution Support",
          text: "Managing official responses, office actions, and compliance hurdles during the review process.",
          Icon: Scale,
        },
      ],
    },
    steps: {
      eyebrow: "From Idea to Patent",
      title: ["Our Structured Patent", "Process"],
      text: "Five structured stages that take your invention from the first consultation through to publication or grant.",
      items: [
        { title: "Initial Consultation", text: "Discussing your invention, scope, and strategic protection goals." },
        { title: "Patentability Assessment & Evaluation", text: "Reviewing novelty and market viability." },
        { title: "Technical Drafting & Documentation", text: "Preparing precise technical specifications and IP documentation." },
        { title: "Application Filing & Documentation", text: "Submitting formal applications to the relevant registries." },
        { title: "Examination Assurance & Response", text: "Managing office actions and guiding the application through to publication or grant." },
      ],
    },
    coverage: {
      eyebrow: "Ideas & Innovation",
      title: ["Your Innovation Deserves", "Attention"],
      text: "We support a wide range of protections, including utility patents, design registrations, utility models, and copyrights.",
      groups: [
        {
          label: "Where we file",
          Icon: Globe,
          items: ["India", "US", "UK", "Germany", "Japan", "Australia", "Canada", "South Africa"],
        },
        {
          label: "What we protect",
          Icon: ShieldCheck,
          items: ["Utility patents", "Design registrations", "Utility models", "Copyrights"],
        },
      ],
    },
    close: {
      title: ["Let's Discuss Your Patent Support", "Needs"],
      text: "Secure your intellectual property rights across India, the US, the UK, Germany, Japan, Australia, Canada, and South Africa. Connect with Veritaz International Press to discuss your invention and the support available for it.",
    },
  },

  {
    slug: "trademarks-copyright",
    summary:
      "Brand clearance searches, trademark filing and registration, and copyright protection for books, papers, media, code and artwork.",
    hero: `${IMG}/trademark-hero-fhd.jpg`,
    heroPosition: "center center",
    h1: ["Trademarks &", "Copyright", "Services"],
    lead:
      "Safeguard your brand identity, creative assets, and commercial innovations with comprehensive trademark and copyright services from Veritaz International Press.",
    cta: "Protect Your Brand",
    highlights: [
      { label: "Brand Clearance Search", Icon: Search },
      { label: "Trademark Filing", Icon: FileText },
      { label: "Official Registration", Icon: Stamp },
      { label: "Copyright Protection", Icon: Copyright },
    ],
    overview: {
      eyebrow: "Protect What You Create",
      title: ["Legally Secure, Globally", "Defensible"],
      image: `${IMG}/trademark-detail.webp`,
      imageAlt: "A laptop showing the trademark and copyright steps beside IP law books, a seal stamp and a padlocked copyright shield",
      body: [
        "We provide structured, compliance-driven guidance through brand clearance searches, trademark filing, official registration, and copyright protection.",
      ],
      callout:
        "Every step is aimed at one outcome: intellectual property that remains legally secure and globally defensible.",
    },
    offerings: {
      eyebrow: "Core Protection Offerings",
      title: ["Protection for Your Brand and Your", "Work"],
      text: "Trademark and copyright support for businesses, authors, academics and creators.",
      items: [
        {
          title: "Trademark Registration & Search",
          text: "Protect your business name, brand logos, slogans, and commercial identifiers from unauthorized use.",
          Icon: Search,
        },
        {
          title: "Copyright Protection",
          text: "Secure official ownership for books, academic papers, creative media, software code, and artistic works.",
          Icon: Copyright,
        },
        {
          title: "IP Documentation & Filing",
          text: "Meticulous preparation and submission of legal paperwork aligned with national and international registry frameworks.",
          Icon: FileText,
        },
        {
          title: "Portfolio Strategy",
          text: "Strategic advisory to help businesses and creators manage, expand, and defend their intellectual property assets.",
          Icon: Target,
        },
      ],
    },
    steps: {
      eyebrow: "How It Works",
      title: ["From Clearance Search to Registered", "Protection"],
      text: "Four steps from checking that a name is free to holding registered protection for it.",
      items: [
        { title: "Brand Clearance Search", text: "Confirm your name, logo or slogan is free to use and register." },
        { title: "Trademark Filing", text: "Prepare and submit the application to the relevant registry." },
        { title: "Official Registration", text: "Follow the application through examination to registration." },
        { title: "Copyright Protection", text: "Secure ownership of your books, papers, media, code and artwork." },
      ],
    },
    coverage: {
      eyebrow: "What We Protect",
      title: ["Your Brand and Your Creative", "Assets"],
      text: "Trademarks protect the identifiers customers know you by; copyright protects the work you create.",
      groups: [
        {
          label: "Brand identity",
          Icon: BadgeCheck,
          items: ["Business names", "Brand logos", "Slogans", "Commercial identifiers"],
        },
        {
          label: "Creative & commercial assets",
          Icon: Palette,
          items: ["Books & academic papers", "Creative media", "Software code", "Artistic works"],
        },
      ],
    },
    close: {
      title: ["Ready to Protect Your Brand and Creative", "Work?"],
      text: "Talk to Veritaz International Press about trademark search, filing, registration and copyright protection for your business, books and creative assets.",
    },
  },

  {
    slug: "ieee-conference-publications",
    summary:
      "Manuscript preparation, IEEE formatting, technical editing and submission support for high-standard conference papers.",
    hero: `${IMG}/ieee-hero-fhd.jpg`,
    heroPosition: "right center",
    h1: ["IEEE", "Conference", "Publications"],
    lead:
      "End-to-end guidance for authors, scholars, and researchers aiming to publish high-standard papers in top-tier academic conferences and IEEE conference publications.",
    cta: "Publish Your Conference Paper",
    highlights: [
      { label: "Manuscript Preparation", Icon: FilePen },
      { label: "IEEE Formatting", Icon: ListOrdered },
      { label: "Technical Editing", Icon: SpellCheck },
      { label: "Submission Support", Icon: Send },
    ],
    overview: {
      eyebrow: "Peer-Review Ready",
      title: ["Built to Meet International Peer", "Review"],
      image: `${IMG}/ieee-detail-fhd.jpg`,
      imageAlt: "A researcher's desk with an annotated IEEE paper, peer-review submission portal on laptop, and conference proceedings",
      body: [
        "Veritaz International Press provides end-to-end guidance for authors, scholars, and researchers aiming to publish in top-tier academic conferences and IEEE conference publications.",
      ],
      callout:
        "From manuscript preparation, structural formatting, and technical editing to final research paper submission, every stage is handled so your work meets the peer-review standards of IEEE and other top-tier conferences.",
    },
    steps: {
      eyebrow: "End-to-End Support",
      title: ["From Manuscript to", "Submission"],
      text: "Four stages that take your research from a draft to a paper ready for international peer review.",
      items: [
        { title: "Manuscript Preparation", text: "Developing your research into a clear, well-structured conference paper." },
        { title: "Structural Formatting", text: "Formatting the paper to the conference template and IEEE style requirements." },
        { title: "Technical Editing", text: "Refining language, figures, equations and references for technical accuracy." },
        { title: "Research Paper Submission", text: "Final checks and submission support to meet rigorous international peer-review standards." },
      ],
    },
    audience: {
      eyebrow: "Who It's For",
      title: ["For Authors, Scholars &", "Researchers"],
      items: [
        { title: "Authors", text: "Prepare a first conference paper with structured guidance from manuscript to submission.", Icon: FilePen },
        { title: "Scholars", text: "Present ongoing research at top-tier academic conferences with rigorous formatting and editing.", Icon: GraduationCap },
        { title: "Researchers", text: "Meet IEEE and international peer-review standards for high-standard conference publications.", Icon: Search },
      ],
    },
    close: {
      title: ["Have a Paper Ready for a", "Conference?"],
      text: "Get end-to-end support for preparing, formatting, editing and submitting your paper to IEEE and top-tier academic conferences.",
    },
  },

  {
    slug: "edited-book-chapters",
    summary:
      "Publisher selection, manuscript editing, plagiarism checks and publication support for chapters in SCI and Scopus indexed volumes.",
    hero: `${IMG}/chapters-hero-fhd.jpg`,
    heroPosition: "center center",
    h1: ["Scopus-Indexed", "Book Chapters", ""],
    lead: "Professional editing and formatting support to feature your work in SCI and Scopus indexed volumes.",
    cta: "Publish Your Book Chapter",
    highlights: [
      { label: "Publisher Selection", Icon: Target },
      { label: "Manuscript Editing", Icon: SpellCheck },
      { label: "Plagiarism Check", Icon: ShieldCheck },
      { label: "Publication Support", Icon: BadgeCheck },
    ],
    overview: {
      eyebrow: "SCI & Scopus Indexed Volumes",
      title: ["From Publisher Selection to Final", "Submission"],
      image: `${IMG}/chapters-detail-fhd.jpg`,
      imageAlt: "An academic editor reviewing printed manuscript proofs with an indexed reference book and laptop",
      body: [
        "Veritaz International Press provides comprehensive SCI & Scopus publication support for scholars, offering end-to-end assistance from initial publisher selection to final submission.",
      ],
      callout:
        "Whether you are targeting top-tier SCI indexed books or leading Scopus indexed volumes, our team helps your work achieve the visibility and recognition it deserves through meticulous manuscript editing and thorough plagiarism checks.",
    },
    offerings: {
      eyebrow: "Core Publication Support",
      title: ["Core Publication Support", "Services"],
      text: "End-to-end assistance from initial publisher selection to final submission for SCI and Scopus indexed volumes.",
      items: [
        {
          title: "Publisher Selection",
          text: "Identifying the SCI indexed books and Scopus indexed volumes that best match your subject scope.",
          Icon: Target,
        },
        {
          title: "Manuscript Editing",
          text: "In-depth editing to elevate language clarity, structural flow, and academic presentation.",
          Icon: SpellCheck,
        },
        {
          title: "Plagiarism Check",
          text: "Plagiarism checks and originality screening for compliance with international publishing standards.",
          Icon: ShieldCheck,
        },
        {
          title: "Publication Support",
          text: "Formatting, responses to reviewer notes, and SCI and Scopus publication for edited volumes.",
          Icon: BadgeCheck,
        },
      ],
    },
    coverage: {
      eyebrow: "The Curation",
      title: ["From Individual Contributions to One Edited", "Book"],
      text: "Bring research contributions and academic expertise together into a cohesive publication.",
      groups: [
        {
          label: "How a volume comes together",
          Icon: Layers,
          flow: true,
          items: ["Multiple contributions", "Content curation", "Editorial development", "Edited book"],
        },
      ],
    },
    close: {
      title: ["Feature Your Work in an Indexed", "Volume"],
      text: "Get professional editing and formatting support to publish your chapter in SCI and Scopus indexed book volumes.",
    },
  },

  {
    slug: "academic-events",
    summary:
      "Complete organisation support for international conferences, faculty development programs, workshops and seminars.",
    hero: `${IMG}/events-hero.webp`,
    h1: ["Educational", "Event", "Management"],
    lead:
      "Complete organization support for International Conferences, Faculty Development Programs, workshops, and seminars.",
    cta: "Organize an Academic Event",
    highlights: [
      { label: "International Conferences", Icon: Globe },
      { label: "Faculty Development Programs", Icon: Presentation },
      { label: "Interactive Workshops", Icon: Wrench },
      { label: "Academic Seminars", Icon: Mic },
    ],
    overview: {
      eyebrow: "Bring Knowledge Into Conversation",
      title: ["Academic Gatherings, Managed", "End to End"],
      image: `${IMG}/events-detail-fhd.jpg`,
      imageAlt: "A keynote speaker presenting at a prestigious international academic conference with attentive faculty and researchers",
      body: [
        "Veritaz International Press partners with educational institutions and organizations to design and execute impactful academic gatherings. From international conferences to specialized faculty development initiatives, we manage every detail to foster collaboration, learning, and professional excellence.",
      ],
      callout:
        "Academic events bring people together to share knowledge, discuss ideas and explore learning, and build lasting connections among participants.",
    },
    offerings: {
      eyebrow: "What We Organize",
      title: ["Core Event", "Offerings"],
      text: "Academic gatherings designed and executed to foster collaboration, learning, and professional excellence.",
      items: [
        {
          title: "International Conferences",
          text: "Bringing global scholars and innovators together through structured planning, delegate coordination, and technical execution.",
          Icon: Globe,
        },
        {
          title: "Faculty Development Programs (FDP)",
          text: "Specialized training modules created to advance teaching methodologies, professional capabilities, and institutional standards.",
          Icon: Presentation,
        },
        {
          title: "Interactive Workshops",
          text: "Practical, skill-oriented learning sessions designed to foster active participation and applied expertise.",
          Icon: Wrench,
        },
        {
          title: "Academic Seminars",
          text: "Targeted presentation platforms for subject matter experts, keynote speakers, and collaborative discussions.",
          Icon: Mic,
        },
      ],
    },
    coverage: {
      eyebrow: "Different Formats",
      title: ["Different Formats. Shared", "Learning."],
      text: "Every format shares one aim: bringing people together to learn from each other.",
      groups: [
        {
          label: "Programs we run",
          Icon: CalendarCheck,
          items: [
            "Faculty Development Programs",
            "International Conferences",
            "Research-oriented academic programs",
            "Workshops & Seminars",
            "Upskilling Programs",
          ],
        },
      ],
    },
    audience: {
      eyebrow: "Who It's For",
      title: ["For Educators, Researchers &", "Institutions"],
      items: [
        { title: "Educators & Faculty", text: "Explore opportunities for academic learning, professional development and personal growth.", Icon: Presentation },
        { title: "Researchers", text: "Engage in academic discussions and knowledge sharing that inspire collaboration and innovative thinking.", Icon: Search },
        { title: "Institutions", text: "Discuss event requirements for your academic community and plan next steps with us.", Icon: School },
      ],
    },
    close: {
      title: ["Let's Plan Your Next Academic", "Event"],
      text: "Have an FDP, workshop, seminar or conference in mind? Start a conversation with Veritaz International Press and share your event requirements with our team.",
      also: { to: "/events", label: "See Our Events" },
    },
  },

  {
    slug: "professional-upskilling",
    summary:
      "Structured, high-impact learning modules that build technical knowledge, practical domain skills and professional efficiency.",
    hero: `${IMG}/upskilling-hero-fhd.jpg`,
    heroPosition: "center center",
    h1: ["Professional", "Upskilling", "Services"],
    lead: "Targeted learning programs engineered to boost your professional capabilities.",
    cta: "Enquire About Upskilling",
    highlights: [
      { label: "Technical Knowledge", Icon: Cpu },
      { label: "Practical Domain Skills", Icon: Wrench },
      { label: "Professional Efficiency", Icon: Gauge },
      { label: "Educators & Professionals", Icon: Users },
    ],
    overview: {
      eyebrow: "Upskilling Modules",
      title: ["Structured, High-Impact Upskilling", "Modules"],
      image: `${IMG}/upskilling-detail-fhd.jpg`,
      imageAlt: "An instructor and a professional collaborating on an interactive learning module and analytics dashboard",
      body: [
        "Veritaz International Press delivers structured, high-impact upskilling modules designed to expand technical knowledge, refine practical domain skills, and enhance professional efficiency.",
      ],
      callout:
        "Our targeted learning programs empower educators and working professionals to stay ahead in rapidly evolving academic and industry landscapes.",
    },
    offerings: {
      eyebrow: "What Our Programs Build",
      title: ["Skills That Keep You", "Ahead"],
      text: "Each module is built around one of three outcomes.",
      items: [
        { title: "Technical Knowledge", text: "Expand technical knowledge through structured, high-impact learning modules.", Icon: Cpu },
        { title: "Practical Domain Skills", text: "Refine practical, domain-specific skills through applied, hands-on learning.", Icon: Wrench },
        {
          title: "Professional Efficiency",
          text: "Enhance professional efficiency and stay ahead in rapidly evolving academic and industry landscapes.",
          Icon: Gauge,
        },
      ],
    },
    audience: {
      eyebrow: "Who It's For",
      title: ["For Educators & Working", "Professionals"],
      items: [
        {
          title: "Educators",
          text: "Targeted programs that strengthen teaching practice and subject expertise for faculty and academic staff.",
          Icon: Presentation,
        },
        {
          title: "Working Professionals",
          text: "Skill-focused modules designed to keep professionals current in rapidly evolving industry landscapes.",
          Icon: UserRound,
        },
      ],
    },
    close: {
      title: ["Ready to Upskill Your Team or", "Faculty?"],
      text: "Share your learning goals with Veritaz International Press and we will shape a targeted upskilling program for your educators or professionals.",
    },
  },
];

export const SERVICES = SERVICE_LINKS.map((link) => ({ ...link, ...CONTENT.find((c) => c.slug === link.slug) }));

export { servicePath };

export const findService = (slug) => SERVICES.find((s) => s.slug === slug);

/** Four steps every engagement follows, for the overview page. */
export const ENGAGEMENT = [
  { title: "Consultation", text: "Tell us about your manuscript, invention, paper or event, and what you want from it.", Icon: Users },
  { title: "Plan & Scope", text: "We map the stages, documents and timelines your project needs.", Icon: ClipboardCheck },
  { title: "Expert Execution", text: "Editors, IP specialists and coordinators handle each stage with you.", Icon: Award },
  { title: "Delivery & Support", text: "Publication, filing or event day, with our team on hand afterwards.", Icon: BadgeCheck },
];
