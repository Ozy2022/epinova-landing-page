# CLAUDE.md — EpiNova Landing Page

> ⚠️ **REDESIGN v2 (2026-08-12):** the founder issued a new brief —
> `_assets/redesign-brief-v2.md` — that supersedes §4–§11 where they conflict.
> The site is now a cinematic scroll-driven story (particle logo disassembly →
> convergence → Biology×Intelligence fusion → data-flow → Saudi light section →
> roadmap → closing). **No dashboard section. No percentages or statistics
> anywhere.** New palette: deep navy #071A2A · biotech teal #08708F · electric
> cyan #16B8D4 · rose #C68F86 (human-impact accent only) · off-white #F3F7F8 ·
> dark blue #0B3045. Everything else below (stack, bans, conventions, contact
> details, claim discipline) still applies.

## 0. How to use this file
Single source of truth. Read fully before writing code. If this conflicts with a
general best practice, this file wins. Never invent product claims, statistics,
partnerships, or medical assertions — if it isn't in §11, ask.

---

## 1. Project overview

**Client:** EpiNova — pre-seed Saudi biotech startup (Riyadh / Eastern Province).
**Product:** AI-powered diagnostic platform analysing **DNA methylation biomarkers**
for early **breast cancer** detection. Roadmap → multi-cancer → precision oncology platform.

**Deliverable:** ONE single-page marketing site. Not multi-page. Not an app. No CMS.

**Primary purpose:** EpiNova exhibits at **LEAP 2026**. Visitors scan a QR code at
the booth **on phones**. They must understand what EpiNova does, why it's credible,
and how to book a meeting — in **under 60 seconds**.

**Secondary:** a credible URL for investor emails and LinkedIn.

**Replacing:** epinova.co, currently a GoDaddy Airo placeholder (black page, stock
DNA video, tagline "Innovating Life Sciences Solutions", contact form, GoDaddy
upsell banner). It is being replaced entirely.

---

## 2. Audience, in priority order
1. **Investors** — pre-seed/seed VCs, angels, sovereign funds. Need credibility:
   real data, real citations, real team, clear market.
2. **Hospital & lab decision-makers** — need clinical integration, privacy
   compliance, workflow fit.
3. **Government / regulatory / Vision 2030 stakeholders** — need the national-
   alignment story.
4. **Potential hires and partners.**

All four are sophisticated, time-poor and hype-averse. No consumer marketing tone.

---

## 3. Success criteria
- "AI + DNA methylation → earlier breast cancer detection" understood on screen
  one, without scrolling.
- Total page ≈ 8–9 screens. If a section doesn't earn its scroll, cut it.
- **Mobile-first.** Assume a mid-range Android on exhibition-hall wifi.
- Lighthouse mobile: Performance ≥ 90 · Accessibility 100 · Best Practices ≥ 95.
- LCP < 2.0s · CLS < 0.05 · INP < 200ms · JS < 250KB gzipped.
- Must not look AI-generated. See §5.

---

## 4. Art direction

### The one big idea
The EpiNova logo is a double helix: **teal strand = biology**, **copper strand =
human health**, threaded with **circuit traces = AI**. The whole site is built from it.

**Signature mechanic:** a single hairline **scroll-strand** runs down the page,
fixed to the left edge on desktop (top progress bar on mobile). Scroll-linked.
Its colour interpolates **teal → blue → copper** as the visitor descends, mirroring
*biology → intelligence → clinical outcome*. Each section docks onto it with a node
marker, like a base pair. Built with GSAP ScrollTrigger + DrawSVG, using the same
paths as the logo mark. **The logo becomes the animation.** This is the one loud
idea; everything else stays quiet.

### References (client-selected)
**Operator** (AI agent agency) and **AgenticX** (AI agent platform), both via
Landbook. Traits to adopt:
- Near-monochrome dark. Colour used surgically, never decoratively.
- **Visible hairline grid** — 1px borders at 8–14% white — dividing content into
  cells. Sections and footer are bordered grids, not floating cards.
- **Tiny uppercase mono labels** with a bullet marker: `• 01 — THE CHALLENGE`.
- Large centred geometric-sans headlines, generous negative space.
- Understated CTAs: solid or outline with a small `→`.
- Dark atmospheric photography, heavily dimmed, as **texture only**.
- Footer as a bordered multi-column grid with an inline CTA cell.

### Register
Serious, precise, scientific, expensive. Reference points: Vercel, Linear, Stripe,
Apple product pages. **Not** health-startup templates. **Not** sci-fi.

### Asymmetry requirement
Do not make every section a centred 3-column grid. At least two sections use an
off-balance split (7/5 or 8/4); at least one element breaks the container edge.

---

## 5. HARD BANS — violating any of these is a bug
- ❌ Purple / violet / indigo anywhere. Accents are teal and copper only.
- ❌ Emoji as icons (🧬🤖⚡). Real SVG only.
- ❌ A pill "badge" above the hero H1.
- ❌ Three identical feature cards repeated across sections.
- ❌ One radius on everything. Vary; prefer hairline framing to rounded cards.
- ❌ Everything centre-aligned.
- ❌ Stock photos of people in lab coats.
- ❌ Cursor followers, blob cursors, particle trails, splash cursors.
- ❌ Glitch / ASCII / scramble / decrypt text effects.
- ❌ Words: revolutionary, cutting-edge, seamlessly, empower, unlock,
  game-changing, transformative, leverage (verb), robust, holistic.
- ❌ Any claim not in §11. Any logo not cleared in §16.
- ❌ Autoplaying video or audio.
- ❌ Two WebGL canvases visible simultaneously.

---

## 6. Design tokens
Define in `app/globals.css`; mirror into `tailwind.config.ts`. **Never hard-code a
hex in a component.** Palette sampled from the actual logo files.

```css
:root{
  /* Biology — teal (left strand) */
  --teal-300:#7FDCEA; --teal-400:#4FC8DC; --teal-500:#2E9CB8;
  --teal-600:#1B6E88; --teal-700:#12505F;

  /* Human health — copper (right strand). ACCENT ONLY, max ~5% of a viewport */
  --copper-300:#EFC0AC; --copper-400:#E0A48F; --copper-500:#C4877A;
  --copper-600:#A66A5C;

  /* Intelligence — blue (mid-journey only) */
  --blue-500:#2E7DD4; --blue-600:#1E4E8C;

  /* Surfaces */
  --navy-950:#050F17; --navy-900:#0A1E29; --navy-850:#0F2836;
  --navy-800:#12303F; --navy-700:#1B4254;

  /* Light section (06 only) */
  --light-bg:#F1F6F8; --light-text:#0A1E29;

  /* Text */
  --text-primary:#EEF5F7; --text-secondary:#9FB8C4; --text-tertiary:#5E7C8B;

  /* Hairlines */
  --line:rgba(238,245,247,.08); --line-strong:rgba(238,245,247,.14);
  --line-accent:rgba(46,156,184,.24);

  /* Effects */
  --glass:rgba(255,255,255,.04);
  --glow-teal:0 0 48px rgba(46,156,184,.22);
  --ease:cubic-bezier(.22,1,.36,1);
}
```

**Colour semantics — enforce:** `teal = biology` · `blue = AI` · `copper = human
outcome`. The scroll-strand and pipeline progress teal → blue → copper.

**Spacing:** 8px scale (8/16/24/40/64/96/128/192). Section padding
`clamp(80px,10vw,160px)`. Max width 1200px (1440px for wide sections).
**Radii:** 4px default · 12px raised · 999px pills only. Not one radius everywhere.
**Breakpoints:** 390 / 768 / 1024 / 1280 / 1600.

---

## 7. Typography
Deliver via the **Fontshare CSS API** `<link>`.
⚠️ **Do NOT commit `.otf`/`.ttf`/`.woff*` to the repo.** Fontshare's EULA forbids
hosting font files on a public server. The local `*_Complete.zip` files in
`_assets/fonts/` are for Figma only. Google fonts via `next/font`.

| Role | Family | Weights | Licence |
|---|---|---|---|
| Display H1–H3 | **Cabinet Grotesk** | 500, 700, 800 | Fontshare, free commercial |
| Body / UI | **Switzer** | 400, 500, 600 | Fontshare, free commercial |
| Mono labels & numerals | **JetBrains Mono** | 400, 500 | OFL |
| Arabic (future) | **IBM Plex Sans Arabic** | 400, 600 | OFL |

```
display-xl  clamp(3.25rem,8vw,7rem)      Cabinet Grotesk 700 · tracking -.03em · lh .95
display-lg  clamp(2.5rem,5.5vw,4.5rem)   Cabinet Grotesk 700 · tracking -.02em · lh 1.02
h2          clamp(2rem,4vw,3.25rem)      Cabinet Grotesk 700 · tracking -.02em
h3          clamp(1.25rem,2vw,1.75rem)   Cabinet Grotesk 500
body-lg     clamp(1.0625rem,1.4vw,1.25rem) Switzer 400 · lh 1.6
body        1rem                          Switzer 400 · lh 1.65
label       11px                          JetBrains Mono 500 · uppercase · tracking .16em
stat        clamp(2.75rem,6vw,5rem)       JetBrains Mono 500 · tabular-nums
```
The contrast between a very large display size and 11px mono labels is a deliberate
editorial device. Use it.

---

## 8. Motion system
**Engine:** GSAP (100% free, all plugins). Plugins: `ScrollTrigger`, `DrawSVG`,
`SplitText`, optional `MorphSVG`. Smooth scroll: **Lenis**, disabled on touch and
under reduced-motion. **Do not also install Framer Motion** — one motion library.

Rules:
- One easing everywhere: `--ease`. Durations 400–700ms, never > 900ms.
- Reveals: fade + translateY 24px, `once:true`, trigger 20% in view, stagger 80ms.
- **Every animation must be wrapped so `prefers-reduced-motion: reduce` disables it
  and renders the final state instantly.** Non-negotiable.
- Pause all canvas/WebGL via IntersectionObserver and on `visibilitychange`.
- Cap DPR at 1.5 on WebGL. No animation may delay LCP.

Approved: scroll-strand draw · fade-up reveals · number count-up · gentle parallax
(≤40px) · button hover lift + glow · hairline draw-in · slow mesh drift.
Banned: everything in §5.

---

## 9. Stack & structure

**The repo is currently Vite** (`vite.config.ts`, `index.html`,
`tsconfig.app.json`). **Migrate to Next.js** — no app code exists yet, so the cost
is near zero, and we need image optimisation, font handling, the metadata/OG API
and static-export SEO. Delete `vite.config.ts`, `index.html`, `tsconfig.app.json`,
`tsconfig.node.json`, and the shadcn `components.json` unless shadcn is being used.

```bash
npx create-next-app@latest . --ts --tailwind --app --eslint
npm i gsap ogl lenis @phosphor-icons/react react-hook-form zod @vercel/analytics
```
- Next.js 14+ App Router · TypeScript strict · Tailwind.
- **React Bits** components are **copy-pasted** into `components/bits/` (MIT) and
  recoloured to tokens. Do not vendor the whole repo.
- WebGL backgrounds use **`ogl`** (tiny). **Do not install Three.js** — the hero
  helix is an **animated SVG** driven by GSAP DrawSVG, not 3D. This matches the
  Operator/AgenticX references, is far lighter, and is sharper on phones.
- Form → **Formspree** via `NEXT_PUBLIC_FORM_ENDPOINT`.
- Deploy **Vercel**; repoint epinova.co from GoDaddy.
- No CMS, DB, or auth. No cookies beyond privacy-friendly analytics.

```
epinova/
├── CLAUDE.md  .gitignore  package.json
├── app/       layout.tsx (fonts, metadata, JSON-LD) · page.tsx · globals.css
├── components/
│   ├── layout/   Header Footer Container Section ScrollStrand
│   ├── sections/ 01Hero … 09Contact
│   ├── ui/       Button Stat Card MonoLabel IconTile
│   ├── bits/     copy-pasted React Bits, recoloured
│   └── brand/    Helix.tsx (animated SVG), Logo.tsx
├── lib/       motion.ts (GSAP + reduced-motion guard) · content.ts (ALL copy)
├── public/    brand/ icons/ img/ og/
└── _assets/   NOT COMMITTED — deck/ logo-src/ fonts/ libs/ bg/
```
**All copy lives in `lib/content.ts`** as typed objects. No hard-coded strings in
JSX. This makes the Arabic version a drop-in.

---

## 10. Assets

### Already in the repo (move to `_assets/`, extract what's needed)
`EpiNova (17) (1).pdf` (deck) · `EPINOVA LOGO 1 (1).png`, `logo1.jpeg`,
`logo2.jpeg` · `bioicons-main.zip` · `phosphor-icons.zip` · `react-bits-main.zip` ·
`GSAP-master.zip` (use npm instead) · `CabinetGrotesk_Complete.zip`,
`Switzer_Complete.zip`, `Satoshi_Complete.zip`, `JetBrains_Mono.zip`,
`IBM_Plex_Sans_Arabic,JetBrains_Mono.zip` · Haikei SVGs (`blurry-gradient`,
`circle-scatter`, `layered-waves`, `low-poly-grid`, `polygon-scatter`,
`stacked-waves`, `wave`, `waves`) · `557shots_so.png` ·
`sangharsh-lohakare-...-unsplash.jpg` · MagicPattern JPEGs.

**Delete:** `motion-main.zip` (Framer Motion — not used). **Do not use** the
*Aurora*, *Greek Sunset*, *Endless Colors*, *The Touch of God* MagicPattern
wallpapers — default purple/rainbow palettes, off-brand. *Deep Blues* only, and
regenerate with our hexes.

### Logo
The supplied logo is **raster only** (likely AI-generated; no vector source). Its
wordmark is dark navy and **fails contrast on dark backgrounds** — confirmed by
testing the black version. Therefore:
- **`public/brand/logo-mark.svg`** — hand-drawn simplified two-tone helix (teal +
  copper strands, rung-and-node circuit traces). This is the canonical web mark.
- **`public/brand/logo-mark-mono.svg`** — `currentColor` knockout for the header.
- **`public/brand/favicon.svg`** — strands only, thicker strokes, for 16px.
- **Wordmark:** set "EPINOVA" in **Cabinet Grotesk Bold**, tracking ~.02em,
  converted to outlines. **Drop "TECHNOLOGY"** from the web lockup.
- Header lockup: mono mark 32px + "EpiNova" in `--text-primary`, 12px gap.
- The mark's two strand paths **are** the hero helix and the scroll-strand.
- Keep the rich raster logo for deck/print only.

### Icons
| Source | Licence | Use |
|---|---|---|
| **Bioicons** | CC0 / CC-BY / MIT — **filter to CC0** | Scientific illustrations |
| **SciDraw** | CC-BY — credit in footer | Lab consumables |
| **Phosphor**, **Light** weight | MIT | All interface icons |

Verified Bioicons picks: `DNA_double_helix` (CC0, James-Lloyd) ·
`ssDNA-single-stranded` (CC0, Samuel-Nestor-Meckoni) · `DNA_symbolic_extending`
(CC0, David-Eccles) · **`neural-network-1` (CC0, Simon Dürr)** ← AI node ·
`amino_acid_backbone_chem` (CC0, Bergheim) · `blood-flow` (CC-BY 3.0, Servier).
SciDraw: `Eppendorf tube closed` (Diogo Losch De Oliveira) ← blood-sample node.
⚠️ Bioicons has **no methylation and no vacutainer icon** (verified). Draw those
two as custom hairline SVGs matching Phosphor Light's 1.5px stroke →
`public/icons/`. They become proprietary brand assets.

### Backgrounds — React Bits (MIT), recolour every one
| Component | Section |
|---|---|
| `strands` (under /animations/) | **01 Hero** — glowing light strands, reads as DNA |
| `dot-field` | 02 Challenge |
| `silk` | 05 Platform, low opacity |
| `topography` | 08 Journey — contour lines read as genomic density |
| `aurora` | 09 Contact — `colorStops={["#2E9CB8","#1B6E88","#C4877A"]}` |
| `grainient` / `noise` | global grain overlay |
| `logo-loop` | partner strip — only if §16 clears it |

Text/utility: `split-text` (hero H1) · `count-up` (stats) · `scroll-reveal` (§06
ladder) · `blur-text` · `masked-heading` · `animated-content` · `fade-content` ·
`gradual-blur` · `electric-border` (card hover) · `glare-hover` (CTA).

**Banned React Bits:** `grid-scan`, `hyperspeed`, `galaxy`, `lightning`,
`letter-glitch`, `faulty-terminal`, `evil-eye`, `balatro`, `ferrofluid`,
`molten-metal`, `liquid-chrome`, `acid-squares`, `ballpit`, `prismatic-burst`,
and every cursor component.

### Generators (for static assets)
Haikei (haikei.app) · MagicPattern (magicpattern.design/tools) · React Bits Tools
(Background Studio, Shape Magic, **Texture Lab** for one consistent grain
treatment on team headshots) · shapedivider.app · css.glass · shots.so (frames).

### Photography
Minimise. Permitted: real team headshots; one very dark heavily blurred lab image
at ≤15% opacity as texture (reuse the deck background — already licensed).

---

## 11. Information architecture & APPROVED COPY
All of this goes in `lib/content.ts`. **Do not add claims not listed here.**

### 01 HERO — dark, full viewport
- Mono label: `• RIYADH, SAUDI ARABIA — PRECISION ONCOLOGY`
- H1: **Detect Earlier. Understand Deeper.**
- Sub: *AI-powered precision diagnostics using DNA methylation biomarkers for a new
  era of early breast cancer detection.*
- CTAs: `Request a Demo →` (solid teal) · `Meet Us at LEAP 2026 →` (outline)
- Visual: React Bits `strands` + the animated SVG helix.

### 02 THE CHALLENGE — dark, hairline grid
- Label `• 01 — THE CHALLENGE` · H2 **Why Early Detection Matters**
- Three grid cells (not floating cards):
  - **Late Detection** — Cancer is frequently identified at advanced stages.
  - **Limited Biomarkers** — Current methods lack sensitivity and specificity.
  - **Data Privacy** — Genetic information raises real security concerns.
- Count-up stats (tabular mono): `50%` detected at late stage · `80%` projected
  increase in cases by 2028 · `5.7×` higher treatment cost at late stage ·
  `75%` most diagnosed cancer among women in the region.
- Citation, `--text-tertiary`, 11px, DOI linked:
  *Almohanna et al., "A comprehensive epidemiological analysis of breast cancer in
  the Eastern Province of Saudi Arabia," Scientific Reports 15:20856 (2025).
  doi:10.1038/s41598-025-05276-7*
  → This citation is a credibility multiplier. Keep it.

### 03 HOW IT WORKS — dark
- Label `• 02 — THE PROCESS` · H2 **Biology to Insight, in Five Steps**
- 5-node pipeline, horizontal desktop / vertical under 768px:
  `Blood Sample → DNA Extraction → Methylation Analysis → AI Risk Assessment → Clinical Report`
- Connecting hairline fills on scroll, gradient teal → blue → copper. Each node
  scales 1.0→1.06 and gains `--glow-teal` as the fill arrives.
- Icons: SciDraw Eppendorf tube · `ssDNA-single-stranded` · custom methylation SVG
  · `neural-network-1` · Phosphor `FileText` Light.
- **No paragraphs in this section.** Labels only.

### 04 WHY DNA METHYLATION — dark, 7/5 asymmetric
- Label `• 03 — THE SCIENCE` · H2 **Reading the Signals Before Symptoms Appear**
- Body (≤50 words): DNA methylation changes are among the earliest detectable
  molecular events in tumour development. EpiNova reads these epigenetic patterns
  from a blood sample and interprets them with AI.
- Right: marker bars animating on view — **BRCA1**, **RASSF1A**, **GSTP1**, each
  tagged `Hypermethylated`.
- Three short points: detects molecular change before symptoms · AI-assisted
  interpretation · designed for clinical workflow.

### 05 THE PLATFORM — dark
- Label `• 04 — THE PLATFORM`
- H2 **Smarter Genomics.** — "Smarter" in `--copper-400`
- Sub *Faster Insights. Greater Confidence.*
- Line: *An AI-powered diagnostic platform for early breast cancer detection.*
- Visual: `public/img/dashboard.png` in a browser frame, mouse-driven tilt max 6°,
  two callout cards parallaxing at different rates: *AI-Generated Clinical Insights*
  and *Methylation Marker Analysis*.
- ⚠️ Optional metrics from the client's mockup — 1,264 samples processed · 2.3 hrs
  average processing time · 847 active patients · risk 68% low / 24% medium / 8%
  high. **Confirm with client before publishing as real, or label "illustrative".**

### 06 SAUDI BIOTECH VISION ⭐ — LIGHT SECTION, the one theme inversion
`--light-bg` / `--light-text`. Differentiates EpiNova from a generic AI-health
startup and gives the page a visual breath.
- Label `• 05 — NATIONAL ALIGNMENT` · H2 **From Saudi Innovation to Global Impact**
- Intro: *Our aim is to contribute to a healthier Saudi Arabia by turning
  biological data into actionable insight for earlier, more precise care.*
- Three numbered items, hairline dividers:
  - `01 — Better Health` Supporting earlier detection and more informed clinical decisions.
  - `02 — Local Innovation` Building Saudi biotechnology and AI capability for healthcare.
  - `03 — Global Impact` Designing solutions that scale from Saudi Arabia outward.
- Word ladder revealing in sequence:
  `Biotechnology → Genomics → Precision Medicine → AI → Early Detection`
- Close: *EpiNova sits at the intersection of biotechnology, genomics and
  artificial intelligence.*
- Footnote, quiet: *Aligned with Saudi Arabia's National Biotechnology Strategy
  and Vision 2030.*
  ⚠️ Use **"Aligned with"**. Never "part of" or "endorsed by". **No government
  logos, no Vision 2030 emblem.**

### 07 WHO WE SERVE — dark
- Label `• 06 — WHO WE SERVE` · H2 **Built for Healthcare Systems**
- Four icon tiles, one line each:
  - **Hospitals & Labs** — Integrate early detection into clinical workflows.
  - **Biotech & Research** — Leverage the platform for epigenetic research.
  - **Health Systems** — Implement population-level screening programmes.
  - **Government & Regulators** — Develop policy that promotes early detection.

### 08 OUR JOURNEY — dark, `topography`
- Label `• 07 — ROADMAP` · H2 **Where We're Going**
- Vertical roadmap docked to the scroll-strand, nodes illuminating in sequence:
  - **Today** — Retrospective pilot on 1,000 patient samples.
  - **Breast Cancer** *(primary focus)* — Q2 2026 regulatory preparation ·
    Q3 2026 pilot launch.
  - **Multi-Cancer Detection** — Q3–Q4 2026 platform expansion.
  - **Precision Oncology Platform** — Q1 2027 regional scaling.
- Traction count-ups: `1,000` patient samples · `95%` detection accuracy
  *(early-stage, retrospective pilot)* · `30s` processing time.
  ⚠️ **The 95% figure must always carry the "retrospective pilot" qualifier.**
  An unqualified accuracy claim on a public medical site is a regulatory risk.
- 🚫 **No funding figures.** The $800K ask and its split ($350K clinical /
  $300K R&D / $150K team) stay in the deck only.

### 09 CONTACT — `--navy-950`, `aurora`
- Label `• 08 — GET IN TOUCH` · H2 **Let's Transform Cancer Detection Together**
- Left: form — Name, Work email, Organisation, Role (Investor / Hospital or Lab /
  Research / Government / Other), Message. Zod validation, inline errors, loading
  + success + error states, honeypot.
- Right, bordered grid cells: email `k.bametraf@epinova.co` (⚠️ §17) ·
  `+966 55 080 5530` · LinkedIn · `Booth #[TBC] — LEAP 2026` · QR code →
  booking link, captioned *Book a meeting at our LEAP booth*.

### Header
Sticky. Transparent at scroll 0 → `--navy-900` at 72% with `backdrop-blur(12px)`
and a bottom hairline after 40px. Mono logo left, anchor nav centre (Challenge /
Process / Platform / Vision / Roadmap), `Request a Demo →` right. Full-screen
sheet under 768px.

### Footer
Operator-style bordered grid: logo + one-line descriptor · nav column · contact
column · CTA cell. Bottom row: `© EpiNova 2026`, illustration credits
(Servier CC-BY 3.0; SciDraw contributors CC-BY), privacy link.

---

## 12. Coding conventions
- TypeScript strict, no `any`, props interfaces exported.
- Server Components by default; `"use client"` only where hooks/WebGL require it.
- Tailwind utilities referencing CSS variables via `theme.extend`. No arbitrary
  hex values in class names.
- One component per file, named export matching filename.
- `<Section>` wrapper owns padding, max-width, the hairline grid and the strand
  node — sections never set their own padding.
- All GSAP registered once in `lib/motion.ts` with a `prefers-reduced-motion`
  guard and `ScrollTrigger.refresh()` on resize. Kill timelines on unmount.
- No `!important`. No inline styles except CSS-variable injection.
- Conventional commits.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
