/**
 * ALL site copy lives here as typed objects (CLAUDE.md §9).
 * v2 redesign brief (_assets/redesign-brief-v2.md): the page is a scroll-driven
 * story in six acts. No percentages, no statistics, no dashboard — anywhere.
 * Do not add claims beyond this file.
 */

export interface Cta {
  label: string;
  href: string;
  variant: "solid" | "outline";
}

export interface NavItem {
  label: string;
  href: string;
}

export const header = {
  brand: "EPINOVA",
  nav: [
    { label: "The Fusion", href: "#fusion" },
    { label: "Data Flow", href: "#flow" },
    { label: "Vision", href: "#vision" },
    { label: "Roadmap", href: "#roadmap" },
  ] satisfies NavItem[],
  cta: { label: "Meet Us at LEAP", href: "#contact", variant: "solid" } satisfies Cta,
} as const;

/* Act 1 — the logo disassembles · Act 2 — scroll convergence */
export const hero = {
  id: "hero",
  label: "RIYADH, SAUDI ARABIA — PRECISION ONCOLOGY",
  h1: ["Detect Earlier", "Understand Deeper"],
  sub: "A new era of cancer detection through AI",
  ctas: [
    { label: "Explore EPINOVA", href: "#fusion", variant: "solid" },
    { label: "Meet Us at LEAP", href: "#contact", variant: "outline" },
  ] satisfies Cta[],
  /** Act 2 — the wordmark that forms from the merged particles */
  convergence: {
    wordmark: "EPINOVA",
    line: "Where biology becomes insight.",
  },
} as const;

/* Act 3 — Biology × Intelligence */
export const fusion = {
  id: "fusion",
  label: "01 — THE FUSION",
  left: {
    title: "Biology",
    words: ["DNA", "Biomarkers", "Molecular Signals"],
  },
  right: {
    title: "Intelligence",
    words: ["AI", "Analytics", "Clinical Insights"],
  },
  statement: "Biology meets Intelligence.",
  substatement:
    "EPINOVA reads the body's earliest molecular signals and interprets them with AI.",
} as const;

/* Act 4 — how the data flows. Colour = meaning:
   teal (biology) → cyan (AI) → rose (human health). */
export interface FlowStage {
  title: string;
  body: string;
  /** drives node colour: biology | ai | human */
  tone: "biology" | "ai" | "human";
}

export const flow = {
  id: "flow",
  label: "02 — HOW THE DATA FLOWS",
  h2: "From Sample to Insight",
  stages: [
    {
      title: "Biological Data",
      body: "Biological samples carry molecular signals that can reveal meaningful changes.",
      tone: "biology",
    },
    {
      title: "Molecular Signals",
      body: "Epigenetic patterns reveal molecular changes that can support earlier detection.",
      tone: "biology",
    },
    {
      title: "AI Analysis",
      body: "AI models interpret molecular signals, separating meaningful patterns from noise.",
      tone: "ai",
    },
    {
      title: "Actionable Insights",
      body: "Actionable insights designed to support earlier, more informed clinical decisions.",
      tone: "human",
    },
  ] satisfies FlowStage[],
} as const;

/* Act 5 — Building Saudi Biotechnology (the light section) */
export interface Pillar {
  title: string;
  body: string;
}

export const vision = {
  id: "vision",
  label: "03 — NATIONAL ALIGNMENT",
  h2: "Building Saudi Biotechnology",
  sub: "From Saudi innovation to global impact.",
  pillars: [
    {
      title: "Health",
      body: "Improving early detection and precision healthcare.",
    },
    {
      title: "Innovation",
      body: "Advancing biotechnology through AI and molecular intelligence.",
    },
    {
      title: "Impact",
      body: "Building solutions from Saudi Arabia for the region and beyond.",
    },
  ] satisfies Pillar[],
  mapCaption: "Saudi Arabia → MENA → Global",
} as const;

/* Act 6 — the road ahead + closing */
export interface RoadStage {
  title: string;
  body: string;
}

export const roadmap = {
  id: "roadmap",
  label: "04 — THE ROAD AHEAD",
  h2: "Where We're Going",
  stages: [
    {
      title: "Breast Cancer",
      body: "Starting with breast cancer, we are building toward a broader precision oncology platform",
    },
    {
      title: "Multi-Cancer",
      body: "Extending the platform across cancer types.",
    },
    {
      title: "Precision Oncology",
      body: "A foundation for precision healthcare at scale.",
    },
  ] satisfies RoadStage[],
} as const;

export const closing = {
  brand: "EPINOVA",
  /** reserved for the closing only — the brand signature, not the hero */
  tagline: "Early Detection. Lifelong Protection",
  cta: "Let's build the future of precision healthcare.",
} as const;

export const contact = {
  id: "contact",
  label: "05 — GET IN TOUCH",
  form: {
    fields: {
      name: "Name",
      email: "Work email",
      organisation: "Organization",
      role: "Role",
    },
    roles: ["Partnership", "Pilot", "Investment", "Learning More"],
    submit: "Book a Meeting",
    sending: "Sending…",
    success: "Thank you — we'll be in touch shortly.",
    error: "Something went wrong. Please try again or email us directly.",
  },
  details: {
    email: "info@epinova.co",
    /** displayed without the + per founder; the tel: link keeps +966 so
     *  tapping still dials correctly from abroad */
    phone: "966 55 080 5530",
    phoneHref: "tel:+966550805530",
    linkedin: "https://www.linkedin.com/company/epinovaco/about/",
    booth: "Booth H1A.P292 — LEAP 2026",
    qrCaption: "Book a meeting at our LEAP booth",
  },
} as const;

export const footer = {
  descriptor: "Early Detection. Lifelong Protection",
  ctaTitle: "Meet us at LEAP 2026",
  ctaLabel: "Book a meeting",
  copyright: "Copyright © 2026 EPINOVA - All Rights Reserved",
} as const;
