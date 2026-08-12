"use client";

import { useEffect, useRef } from "react";
import { Section } from "@/components/layout/Section";
import { CountUp } from "@/components/ui/CountUp";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";
import { journey } from "@/lib/content";

/**
 * 08 — OUR JOURNEY: vertical roadmap docked to a rail, nodes illuminating in
 * sequence; traction count-ups below. The 95% figure always carries its
 * retrospective-pilot qualifier (hard rule, CLAUDE.md §11).
 */
export function Journey() {
  const railRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    initMotion();
    const rail = railRef.current;
    if (!rail) return;
    const fill = rail.querySelector<HTMLElement>("[data-rail-fill]");
    const nodes = Array.from(rail.querySelectorAll<HTMLElement>("li"));
    if (!fill) return;

    if (prefersReducedMotion()) {
      fill.style.transform = "none";
      nodes.forEach((n) => n.classList.add("is-lit"));
      return;
    }

    const st = ScrollTrigger.create({
      trigger: rail,
      start: "top 70%",
      end: "bottom 55%",
      scrub: 0.8,
      onUpdate: (self) => {
        gsap.set(fill, { scaleY: self.progress });
        nodes.forEach((n, i) => {
          const threshold = nodes.length === 1 ? 0 : i / (nodes.length - 1);
          n.classList.toggle("is-lit", self.progress >= threshold - 0.02);
        });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <Section id={journey.id} label={journey.label} tone="panel">
      <h2 className="type-h2 max-w-3xl">{journey.h2}</h2>

      <ol ref={railRef} className="relative mt-16 max-w-2xl">
        {/* rail + gradient fill */}
        <div
          aria-hidden
          className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px bg-line"
        >
          <div
            data-rail-fill
            className="h-full w-full origin-top scale-y-0"
            style={{
              background:
                "linear-gradient(180deg, var(--teal-500), var(--blue-500), var(--copper-500))",
            }}
          />
        </div>

        {journey.nodes.map((node) => (
          <li key={node.title} className="group relative pb-12 pl-10 last:pb-0">
            <span
              aria-hidden
              className="absolute left-0 top-1.5 size-[11px] rounded-full border border-line bg-navy-900 transition-[border-color,box-shadow,background-color] duration-500 group-[.is-lit]:border-teal-400 group-[.is-lit]:bg-teal-500 group-[.is-lit]:shadow-glow-teal"
            />
            <h3 className="font-display text-xl font-medium text-primary">
              {node.title}
              {node.note ? (
                <span className="type-label ml-3 text-copper-400">
                  {node.note}
                </span>
              ) : null}
            </h3>
            <p className="mt-2 text-sm text-secondary">{node.detail}</p>
          </li>
        ))}
      </ol>

      {/* traction */}
      <div className="mt-20 grid grid-cols-1 gap-y-12 border-t border-line pt-14 sm:grid-cols-3 sm:gap-x-8">
        {journey.traction.map((stat) => (
          <div key={stat.caption}>
            <CountUp
              value={stat.number}
              suffix={stat.suffix}
              grouping={stat.number >= 1000}
              className="type-stat text-teal-400"
            />
            <p className="mt-3 max-w-[24ch] text-sm text-secondary">
              {stat.caption}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
