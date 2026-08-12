"use client";

import { useEffect, useRef } from "react";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { vision } from "@/lib/content";

/** Riyadh (46.7°E, 24.7°N) projected into the map frame below */
const ORIGIN = { x: 207, y: 150 };

/** network arcs: Riyadh → Saudi cities → MENA → global (edges of the frame) */
const ARCS = [
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q140 200 77 214`, reach: "saudi" }, // Jeddah
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q240 130 263 118`, reach: "saudi" }, // Dammam
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q110 90 32 82`, reach: "saudi" }, // NEOM
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q60 30 -50 60`, reach: "mena" }, // Levant / Egypt
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q330 120 440 140`, reach: "mena" }, // Gulf / Asia
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q80 300 -50 330`, reach: "global" }, // Africa
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q340 40 440 0`, reach: "global" }, // far east
] as const;

/**
 * Minimal KSA outline — equirectangular projection of the real border
 * (x = (lon−34.5)·17 · y = (32.2−lat)·20), simplified to ~22 vertices.
 */
const KSA_PATH =
  "M7 56 L43 14 L60 2 L129 22 L204 62 L221 74 L236 73 L250 92 L267 118 " +
  "L291 153 L352 190 L349 244 L298 264 L243 284 L219 298 L185 298 " +
  "L141 316 L136 306 L114 272 L77 214 L60 164 L20 97 Z";

/**
 * Act 5 — Building Saudi Biotechnology. The one light section: a minimal
 * outline of Saudi Arabia, a pulse from Riyadh, and a network of lines
 * spreading Saudi → MENA → Global, beside three text-only pillars.
 */
export function SaudiVision() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMotion();
    const root = rootRef.current;
    if (!root) return;

    const outline = root.querySelector<SVGPathElement>("[data-map-outline]");
    const arcs = root.querySelectorAll<SVGPathElement>("[data-map-arc]");
    const dots = root.querySelectorAll<SVGCircleElement>("[data-map-dot]");
    if (!outline) return;

    if (prefersReducedMotion()) return; // SVG is fully drawn by default

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        })
        .from(outline, { drawSVG: "0%", duration: 1.1, ease: "power2.inOut" })
        .from(
          arcs,
          { drawSVG: "0%", duration: 0.8, stagger: 0.12, ease: "power2.out" },
          "-=0.3",
        )
        .from(dots, { autoAlpha: 0, scale: 0, transformOrigin: "center", stagger: 0.08 }, "-=0.6");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <Section id={vision.id} label={vision.label} tone="light">
      <div ref={rootRef}>
        <Reveal>
          <h2 className="type-h2 max-w-3xl">{vision.h2}</h2>
          <p className="type-body-lg mt-4 text-light-text/65">{vision.sub}</p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          {/* the map — 7 columns, off-balance split */}
          <div className="lg:col-span-7">
            <svg
              viewBox="-70 -40 520 420"
              className="h-auto w-full max-w-xl"
              role="img"
              aria-label="Network spreading from Riyadh across Saudi Arabia, the MENA region and the world"
            >
              <path
                data-map-outline
                d={KSA_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-light-text/30"
              />
              {ARCS.map((arc) => (
                <path
                  key={arc.d}
                  data-map-arc
                  d={arc.d}
                  fill="none"
                  strokeWidth={arc.reach === "saudi" ? 1.5 : 1}
                  strokeDasharray={arc.reach === "global" ? "3 5" : undefined}
                  stroke="currentColor"
                  className="text-teal-600"
                />
              ))}
              {ARCS.map((arc) => {
                const end = arc.d.split(" ").slice(-2);
                return (
                  <circle
                    key={`dot-${arc.d}`}
                    data-map-dot
                    cx={Number(end[0].replace(/[A-Z]/gi, ""))}
                    cy={Number(end[1])}
                    r="3.5"
                    className="fill-teal-600"
                  />
                );
              })}
              {/* Riyadh — origin pulse */}
              <circle cx={ORIGIN.x} cy={ORIGIN.y} r="5" className="fill-teal-600" />
              <circle
                cx={ORIGIN.x}
                cy={ORIGIN.y}
                r="9"
                fill="none"
                strokeWidth="1.5"
                stroke="currentColor"
                className="map-pulse text-teal-500"
              />
            </svg>
            <p className="type-label mt-6 text-light-text/50">
              {vision.mapCaption}
            </p>
          </div>

          {/* pillars — 5 columns, text only, hairline dividers */}
          <Reveal className="lg:col-span-5 lg:self-center">
            {vision.pillars.map((pillar, i) => (
              <div
                key={pillar.title}
                className={`py-8 ${i > 0 ? "border-t border-light-text/10" : ""}`}
              >
                <h3 className="font-display text-xl font-bold tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-light-text/70">{pillar.body}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <p className="mt-16 text-sm text-light-text/45">{vision.footnote}</p>
      </div>
    </Section>
  );
}
