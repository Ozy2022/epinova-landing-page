/**
 * ALL site copy lives here as typed objects (CLAUDE.md §9, §11).
 * No hard-coded strings in JSX — this makes the Arabic version a drop-in.
 * Do not add claims that are not in CLAUDE.md §11.
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
  brand: "EpiNova",
  nav: [
    { label: "Challenge", href: "#challenge" },
    { label: "Process", href: "#process" },
    { label: "Platform", href: "#platform" },
    { label: "Vision", href: "#vision" },
    { label: "Roadmap", href: "#roadmap" },
  ] satisfies NavItem[],
  cta: { label: "Request a Demo", href: "#contact", variant: "solid" } satisfies Cta,
} as const;

export const hero = {
  id: "hero",
  label: "RIYADH, SAUDI ARABIA — PRECISION ONCOLOGY",
  h1: ["Detect Earlier.", "Understand Deeper."],
  sub: "AI-powered precision diagnostics using DNA methylation biomarkers for a new era of early breast cancer detection.",
  ctas: [
    { label: "Request a Demo", href: "#contact", variant: "solid" },
    { label: "Meet Us at LEAP 2026", href: "#contact", variant: "outline" },
  ] satisfies Cta[],
} as const;

export interface ChallengeCell {
  title: string;
  body: string;
}

export interface Stat {
  value: string;
  /** numeric part used by the count-up; suffix rendered after */
  number: number;
  suffix: string;
  caption: string;
}

export const challenge = {
  id: "challenge",
  label: "01 — THE CHALLENGE",
  h2: "Why Early Detection Matters",
  cells: [
    {
      title: "Late Detection",
      body: "Cancer is frequently identified at advanced stages.",
    },
    {
      title: "Limited Biomarkers",
      body: "Current methods lack sensitivity and specificity.",
    },
    {
      title: "Data Privacy",
      body: "Genetic information raises real security concerns.",
    },
  ] satisfies ChallengeCell[],
  stats: [
    { value: "50%", number: 50, suffix: "%", caption: "detected at late stage" },
    {
      value: "80%",
      number: 80,
      suffix: "%",
      caption: "projected increase in cases by 2028",
    },
    {
      value: "5.7×",
      number: 5.7,
      suffix: "×",
      caption: "higher treatment cost at late stage",
    },
    {
      value: "75%",
      number: 75,
      suffix: "%",
      caption: "most diagnosed cancer among women in the region",
    },
  ] satisfies Stat[],
  citation: {
    text: 'Almohanna et al., "A comprehensive epidemiological analysis of breast cancer in the Eastern Province of Saudi Arabia," Scientific Reports 15:20856 (2025).',
    doi: "10.1038/s41598-025-05276-7",
    href: "https://doi.org/10.1038/s41598-025-05276-7",
  },
} as const;

export interface PipelineStep {
  label: string;
  /** icon key resolved by the section component */
  icon: "sample" | "extraction" | "methylation" | "ai" | "report";
}

export const process = {
  id: "process",
  label: "02 — THE PROCESS",
  h2: "Biology to Insight, in Five Steps",
  steps: [
    { label: "Blood Sample", icon: "sample" },
    { label: "DNA Extraction", icon: "extraction" },
    { label: "Methylation Analysis", icon: "methylation" },
    { label: "AI Risk Assessment", icon: "ai" },
    { label: "Clinical Report", icon: "report" },
  ] satisfies PipelineStep[],
} as const;

export interface Marker {
  gene: string;
  tag: string;
}

export const science = {
  id: "science",
  label: "03 — THE SCIENCE",
  h2: "Reading the Signals Before Symptoms Appear",
  body: "DNA methylation changes are among the earliest detectable molecular events in tumour development. EpiNova reads these epigenetic patterns from a blood sample and interprets them with AI.",
  markers: [
    { gene: "BRCA1", tag: "Hypermethylated" },
    { gene: "RASSF1A", tag: "Hypermethylated" },
    { gene: "GSTP1", tag: "Hypermethylated" },
  ] satisfies Marker[],
  points: [
    "Detects molecular change before symptoms",
    "AI-assisted interpretation",
    "Designed for clinical workflow",
  ],
} as const;

export const platform = {
  id: "platform",
  label: "04 — THE PLATFORM",
  /** "Smarter" renders in --copper-400 */
  h2Accent: "Smarter",
  h2Rest: " Genomics.",
  sub: "Faster Insights. Greater Confidence.",
  line: "An AI-powered diagnostic platform for early breast cancer detection.",
  callouts: ["AI-Generated Clinical Insights", "Methylation Marker Analysis"],
  /** ⚠ metrics from the client mockup — not published until confirmed real,
   *  or must be labelled "illustrative" (CLAUDE.md §11-05) */
  illustrativeMetricsConfirmed: false,
} as const;

export interface VisionItem {
  index: string;
  title: string;
  body: string;
}

export const vision = {
  id: "vision",
  label: "05 — NATIONAL ALIGNMENT",
  h2: "From Saudi Innovation to Global Impact",
  intro:
    "Our aim is to contribute to a healthier Saudi Arabia by turning biological data into actionable insight for earlier, more precise care.",
  items: [
    {
      index: "01",
      title: "Better Health",
      body: "Supporting earlier detection and more informed clinical decisions.",
    },
    {
      index: "02",
      title: "Local Innovation",
      body: "Building Saudi biotechnology and AI capability for healthcare.",
    },
    {
      index: "03",
      title: "Global Impact",
      body: "Designing solutions that scale from Saudi Arabia outward.",
    },
  ] satisfies VisionItem[],
  ladder: [
    "Biotechnology",
    "Genomics",
    "Precision Medicine",
    "AI",
    "Early Detection",
  ],
  close:
    "EpiNova sits at the intersection of biotechnology, genomics and artificial intelligence.",
  /** "Aligned with" — never "part of" / "endorsed by". No government logos. */
  footnote:
    "Aligned with Saudi Arabia's National Biotechnology Strategy and Vision 2030.",
} as const;

export interface ServeTile {
  title: string;
  body: string;
  icon: "hospital" | "research" | "system" | "government";
}

export const serve = {
  id: "serve",
  label: "06 — WHO WE SERVE",
  h2: "Built for Healthcare Systems",
  tiles: [
    {
      title: "Hospitals & Labs",
      body: "Integrate early detection into clinical workflows.",
      icon: "hospital",
    },
    {
      title: "Biotech & Research",
      body: "Use the platform for epigenetic research.",
      icon: "research",
    },
    {
      title: "Health Systems",
      body: "Implement population-level screening programmes.",
      icon: "system",
    },
    {
      title: "Government & Regulators",
      body: "Develop policy that promotes early detection.",
      icon: "government",
    },
  ] satisfies ServeTile[],
} as const;

export interface RoadmapNode {
  title: string;
  note?: string;
  detail: string;
}

export const journey = {
  id: "roadmap",
  label: "07 — ROADMAP",
  h2: "Where We're Going",
  nodes: [
    {
      title: "Today",
      detail: "Retrospective pilot on 1,000 patient samples.",
    },
    {
      title: "Breast Cancer",
      note: "primary focus",
      detail: "Q2 2026 regulatory preparation · Q3 2026 pilot launch.",
    },
    {
      title: "Multi-Cancer Detection",
      detail: "Q3–Q4 2026 platform expansion.",
    },
    {
      title: "Precision Oncology Platform",
      detail: "Q1 2027 regional scaling.",
    },
  ] satisfies RoadmapNode[],
  traction: [
    { value: "1,000", number: 1000, suffix: "", caption: "patient samples" },
    {
      value: "95%",
      number: 95,
      suffix: "%",
      /** ⚠ the qualifier is mandatory — never render this stat without it */
      caption: "detection accuracy (early-stage, retrospective pilot)",
    },
    { value: "30s", number: 30, suffix: "s", caption: "processing time" },
  ] satisfies Stat[],
} as const;

export const contact = {
  id: "contact",
  label: "08 — GET IN TOUCH",
  h2: "Let's Transform Cancer Detection Together",
  form: {
    fields: {
      name: "Name",
      email: "Work email",
      organisation: "Organisation",
      role: "Role",
      message: "Message",
    },
    roles: ["Investor", "Hospital or Lab", "Research", "Government", "Other"],
    submit: "Send Message",
    sending: "Sending…",
    success: "Thank you — we'll be in touch shortly.",
    error: "Something went wrong. Please try again or email us directly.",
  },
  details: {
    email: "k.bametraf@epinova.co",
    phone: "+966 55 080 5530",
    linkedin: "https://www.linkedin.com/company/epinova",
    booth: "Booth #[TBC] — LEAP 2026",
    qrCaption: "Book a meeting at our LEAP booth",
  },
} as const;

export const footer = {
  descriptor:
    "AI-powered precision diagnostics for early breast cancer detection.",
  copyright: "© EpiNova 2026",
  credits:
    "Illustrations: Servier (CC-BY 3.0) · SciDraw contributors (CC-BY).",
  privacyLabel: "Privacy",
  privacyHref: "/privacy",
} as const;
