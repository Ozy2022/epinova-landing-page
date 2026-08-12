"use client";

import { useEffect, useRef } from "react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";
import { science } from "@/lib/content";

/** deterministic, deliberately unequal bar widths — reads as data, not decor */
const BAR_WIDTHS = [0.82, 0.64, 0.73];

/**
 * 04 — THE SCIENCE: 7/5 asymmetric split. Left: heading + ≤50-word body +
 * three short points. Right: BRCA1 / RASSF1A / GSTP1 marker bars animating
 * in on view, each tagged `Hypermethylated`.
 */
export function Science() {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMotion();
    const wrap = barsRef.current;
    if (!wrap) return;
    const fills = wrap.querySelectorAll<HTMLElement>("[data-bar]");

    if (prefersReducedMotion()) {
      fills.forEach((f) => (f.style.transform = "none"));
      return;
    }
    // context + revert so Strict Mode's double run restores pre-tween state
    const ctx = gsap.context(() => {
      gsap.from(fills, {
        scaleX: 0,
        duration: 0.9,
        stagger: 0.14,
        scrollTrigger: { trigger: wrap, start: "top 78%", once: true },
      });
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <Section id={science.id} label={science.label}>
      <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-7">
          <h2 className="type-h2">{science.h2}</h2>
          <p className="type-body-lg mt-6 max-w-xl text-secondary">
            {science.body}
          </p>
          <ul className="mt-10 space-y-4">
            {science.points.map((point) => (
              <li key={point} className="flex items-baseline gap-3 text-sm">
                <span aria-hidden className="h-px w-6 shrink-0 self-center bg-teal-500" />
                <span className="text-secondary">{point}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div ref={barsRef} className="space-y-8 self-center md:col-span-5">
          {science.markers.map((marker, i) => (
            <div key={marker.gene}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-sm font-medium text-primary">
                  {marker.gene}
                </span>
                <span className="type-label text-copper-400">{marker.tag}</span>
              </div>
              <div className="h-1.5 w-full bg-navy-800">
                <div
                  data-bar
                  className="h-full origin-left"
                  style={{
                    width: `${BAR_WIDTHS[i] * 100}%`,
                    background:
                      "linear-gradient(90deg, var(--teal-500), var(--teal-400))",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
