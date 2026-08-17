"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { roadmap } from "@/lib/content";

/**
 * Act 6 — the road ahead. A simple progression: Breast Cancer →
 * Multi-Cancer → Precision Oncology, connected by the glowing line motif.
 * Horizontal on desktop, vertical under 768px. No dashboards, no numbers.
 */
export function Roadmap() {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMotion();
    const rail = railRef.current;
    const fill = fillRef.current;
    if (!rail || !fill) return;

    const stages = Array.from(
      rail.querySelectorAll<HTMLElement>("[data-road-stage]"),
    );
    const horizontal = () => window.matchMedia("(min-width: 768px)").matches;

    if (prefersReducedMotion()) {
      gsap.set(fill, { scaleX: 1, scaleY: 1 });
      stages.forEach((s) => s.classList.add("is-lit"));
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(fill, { scaleX: 0, scaleY: 0, transformOrigin: "top left" });

      ScrollTrigger.create({
        trigger: rail,
        start: "top 75%",
        end: "bottom 40%",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          if (horizontal()) gsap.set(fill, { scaleX: p, scaleY: 1 });
          else gsap.set(fill, { scaleX: 1, scaleY: p });
        },
      });

      // per-stage triggers (same fix as DataFlow): index-staggered starts
      // keep the left-to-right sequence in the horizontal desktop layout,
      // where all three stages share the same top edge
      stages.forEach((stage, i) => {
        ScrollTrigger.create({
          trigger: stage,
          start: `top ${78 - i * 9}%`,
          onEnter: () => stage.classList.add("is-lit"),
          onLeaveBack: () => stage.classList.remove("is-lit"),
        });
      });
    }, rail);

    return () => ctx.revert();
  }, []);

  return (
    <Section id={roadmap.id} label={roadmap.label} tone="panel">
      <Reveal>
        <h2 className="type-h2 max-w-3xl">{roadmap.h2}</h2>
      </Reveal>

      <div ref={railRef} className="relative mt-20">
        {/* connecting line: vertical on mobile, horizontal from md */}
        <div
          aria-hidden
          className="absolute left-[13px] top-4 h-[calc(100%-2rem)] w-px bg-line md:left-4 md:right-4 md:top-[13px] md:h-px md:w-auto"
        />
        <div
          ref={fillRef}
          aria-hidden
          className="absolute left-[13px] top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-teal-600 via-teal-400 to-copper-400 md:left-4 md:right-4 md:top-[13px] md:h-px md:w-auto md:bg-gradient-to-r"
        />

        <ol className="grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-8">
          {roadmap.stages.map((stage, i) => (
            <li
              key={stage.title}
              data-road-stage
              className="group relative grid grid-cols-[28px_1fr] gap-6 md:grid-cols-1 md:gap-0"
            >
              <span
                aria-hidden
                className={`size-[27px] rounded-full border transition-all duration-500 ease-brand md:mb-8 ${
                  i === roadmap.stages.length - 1
                    ? "border-copper-300 bg-copper-400 group-[.is-lit]:shadow-glow-rose"
                    : "border-teal-300 bg-teal-600 group-[.is-lit]:shadow-glow-teal"
                } scale-90 opacity-40 group-[.is-lit]:scale-100 group-[.is-lit]:opacity-100`}
              />
              <div className="opacity-50 transition-opacity duration-500 ease-brand group-[.is-lit]:opacity-100">
                <h3 className="font-display text-xl font-bold tracking-tight text-primary md:text-2xl">
                  {stage.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm text-secondary md:text-base">
                  {stage.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
