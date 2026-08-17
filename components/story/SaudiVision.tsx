"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { vision } from "@/lib/content";

/** Riyadh (46.7°E, 24.7°N) projected into the map frame below */
const ORIGIN = { x: 207, y: 150 };

/** network arcs: Riyadh → Saudi cities → MENA → global (edges of the frame) */
const ARCS = [
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q140 200 77 214`, end: [77, 214], reach: "saudi" }, // Jeddah
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q240 130 263 118`, end: [263, 118], reach: "saudi" }, // Dammam
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q110 90 32 82`, end: [32, 82], reach: "saudi" }, // NEOM
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q80 40 -30 48`, end: [-30, 48], reach: "mena" }, // Levant / Egypt
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q330 120 428 118`, end: [428, 118], reach: "mena" }, // Gulf / Asia
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q90 290 -40 326`, end: [-40, 326], reach: "global" }, // Africa
  { d: `M${ORIGIN.x} ${ORIGIN.y} Q340 40 428 -8`, end: [428, -8], reach: "global" }, // far east
] as const;

type Reach = (typeof ARCS)[number]["reach"];

const NODE_FILL: Record<Reach, string> = {
  saudi: "fill-teal-600",
  mena: "fill-teal-500",
  global: "fill-copper-500",
};

/**
 * Minimal KSA outline — equirectangular projection of the real border
 * (x = (lon−34.5)·17 · y = (32.2−lat)·20), simplified to ~22 vertices.
 */
const KSA_POLY: ReadonlyArray<readonly [number, number]> = [
  [7, 56], [43, 14], [60, 2], [129, 22], [204, 62], [221, 74], [236, 73],
  [250, 92], [267, 118], [291, 153], [352, 190], [349, 244], [298, 264],
  [243, 284], [219, 298], [185, 298], [141, 316], [136, 306], [114, 272],
  [77, 214], [60, 164], [20, 97],
];

const KSA_PATH =
  KSA_POLY.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ") + " Z";

/** ray-cast point-in-polygon against the outline above */
function inKsa(x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = KSA_POLY.length - 1; i < KSA_POLY.length; j = i++) {
    const [xi, yi] = KSA_POLY[i];
    const [xj, yj] = KSA_POLY[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Halftone fill of the country: a dot matrix, brightest near Riyadh and
 * fading with distance, grouped into five distance bands so the entrance
 * can ripple outward from the origin. Deterministic — safe for SSR.
 */
const BANDS: Array<Array<{ x: number; y: number; o: number }>> = (() => {
  const bands: Array<Array<{ x: number; y: number; o: number }>> = [
    [], [], [], [], [],
  ];
  for (let y = 6; y <= 316; y += 12) {
    for (let x = 6; x <= 354; x += 12) {
      if (!inKsa(x, y)) continue;
      const dist = Math.hypot(x - ORIGIN.x, y - ORIGIN.y);
      bands[Math.min(4, Math.floor(dist / 55))].push({
        x,
        y,
        o: Math.max(0.1, 0.42 - dist / 800),
      });
    }
  }
  return bands;
})();

/** dashed reach rings around Riyadh — Saudi, MENA, Global */
const RINGS = [60, 130, 200] as const;

/**
 * Act 5 — Building Saudi Biotechnology. The one light section: Saudi
 * Arabia rendered as a halftone dot matrix that ripples out from a
 * glowing Riyadh, ringed by dashed reach circles (Saudi → MENA → Global),
 * with data beads travelling the network arcs — beside three text pillars.
 */
export function SaudiVision() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    initMotion();
    if (prefersReducedMotion()) {
      setReduced(true);
      return; // SVG is fully drawn by default; beads are simply not rendered
    }
    const root = rootRef.current;
    if (!root) return;

    const outline = root.querySelector<SVGPathElement>("[data-map-outline]");
    if (!outline) return;

    const ctx = gsap.context(() => {
      const bands = root.querySelectorAll("[data-map-band]");
      const rings = root.querySelectorAll("[data-map-ring]");
      const solidArcs = root.querySelectorAll(
        "[data-map-arc]:not([data-dashed])",
      );
      const dashedArcs = root.querySelectorAll("[data-map-arc][data-dashed]");
      const nodes = root.querySelectorAll("[data-map-node]");
      const origin = root.querySelector("[data-map-origin]");

      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        })
        .from(outline, { drawSVG: "0%", duration: 1.1, ease: "power2.inOut" })
        // the country fills in, rippling outward from Riyadh
        .from(bands, { autoAlpha: 0, duration: 0.5, stagger: 0.12 }, "-=0.55")
        // reach rings expand from the origin
        .from(
          rings,
          {
            scale: 0.55,
            autoAlpha: 0,
            transformOrigin: "center",
            duration: 0.7,
            stagger: 0.15,
            ease: "power2.out",
          },
          "-=0.45",
        )
        .from(origin, { autoAlpha: 0, duration: 0.5 }, "<")
        // arcs draw out along the network (dashed ones fade — DrawSVG
        // would clobber their dash pattern)
        .from(
          solidArcs,
          { drawSVG: "0%", duration: 0.8, stagger: 0.12, ease: "power2.out" },
          "-=0.4",
        )
        .from(dashedArcs, { autoAlpha: 0, duration: 0.6, stagger: 0.15 }, "-=0.6")
        .from(
          nodes,
          { autoAlpha: 0, scale: 0, transformOrigin: "center", stagger: 0.08 },
          "-=0.6",
        );
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
              <defs>
                <radialGradient id="riyadh-glow">
                  <stop offset="0%" stopColor="var(--teal-400)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--teal-400)" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* halftone country fill, banded by distance from Riyadh */}
              {BANDS.map((band, b) => (
                <g key={b} data-map-band>
                  {band.map((dot) => (
                    <circle
                      key={`${dot.x}-${dot.y}`}
                      cx={dot.x}
                      cy={dot.y}
                      r="1.5"
                      opacity={dot.o}
                      className="fill-teal-600"
                    />
                  ))}
                </g>
              ))}

              <path
                data-map-outline
                d={KSA_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-light-text/25"
              />

              {/* dashed reach rings: Saudi → MENA → Global */}
              {RINGS.map((r) => (
                <circle
                  key={r}
                  data-map-ring
                  cx={ORIGIN.x}
                  cy={ORIGIN.y}
                  r={r}
                  fill="none"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                  stroke="currentColor"
                  className="text-light-text/12"
                />
              ))}

              {ARCS.map((arc) => (
                <path
                  key={arc.d}
                  data-map-arc
                  data-dashed={arc.reach === "global" ? "" : undefined}
                  d={arc.d}
                  fill="none"
                  strokeWidth={
                    arc.reach === "saudi" ? 1.5 : arc.reach === "mena" ? 1.2 : 1
                  }
                  strokeLinecap="round"
                  strokeDasharray={arc.reach === "global" ? "3 5" : undefined}
                  stroke="currentColor"
                  className={
                    arc.reach === "saudi" ? "text-teal-600" : "text-teal-500/70"
                  }
                />
              ))}

              {/* data beads travelling the network (static under reduced motion) */}
              {!reduced &&
                ARCS.map((arc, i) => (
                  <circle
                    key={`bead-${arc.d}`}
                    r="2"
                    opacity="0"
                    className={
                      arc.reach === "global" ? "fill-copper-400" : "fill-teal-500"
                    }
                  >
                    <animateMotion
                      dur={`${2.8 + i * 0.3}s`}
                      begin={`${i * 0.45}s`}
                      repeatCount="indefinite"
                      path={arc.d}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.9;0.9;0"
                      keyTimes="0;0.15;0.75;1"
                      dur={`${2.8 + i * 0.3}s`}
                      begin={`${i * 0.45}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}

              {/* endpoint nodes — filled for Saudi, ringed for MENA, copper for global */}
              {ARCS.map((arc) => (
                <g key={`node-${arc.d}`} data-map-node>
                  {arc.reach !== "saudi" && (
                    <circle
                      cx={arc.end[0]}
                      cy={arc.end[1]}
                      r="6.5"
                      fill="none"
                      strokeWidth="1"
                      className={
                        arc.reach === "global"
                          ? "stroke-copper-500/40"
                          : "stroke-teal-500/40"
                      }
                    />
                  )}
                  <circle
                    cx={arc.end[0]}
                    cy={arc.end[1]}
                    r="3"
                    className={NODE_FILL[arc.reach]}
                  />
                </g>
              ))}

              {/* Riyadh — glowing labelled origin with a double pulse */}
              <g data-map-origin>
                <circle cx={ORIGIN.x} cy={ORIGIN.y} r="34" fill="url(#riyadh-glow)" />
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
                <circle
                  cx={ORIGIN.x}
                  cy={ORIGIN.y}
                  r="9"
                  fill="none"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="map-pulse-late text-teal-500"
                />
                <text
                  x={ORIGIN.x + 14}
                  y={ORIGIN.y + 17}
                  className="fill-light-text/55 font-mono text-[9px] uppercase tracking-[0.16em]"
                >
                  {vision.mapOrigin}
                </text>
              </g>
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
      </div>
    </Section>
  );
}
