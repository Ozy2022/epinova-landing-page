"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { flow, type FlowStage } from "@/lib/content";

/** node/text colour per stage tone — colour IS the meaning (v2 brief) */
const TONE: Record<FlowStage["tone"], { dot: string; title: string }> = {
  biology: { dot: "bg-teal-600 border-teal-500", title: "text-teal-300" },
  ai: { dot: "bg-blue-500 border-teal-300", title: "text-blue-500" },
  human: { dot: "bg-copper-400 border-copper-300", title: "text-copper-300" },
};

/**
 * Act 4 — how the data flows. A vertical journey: biological data →
 * molecular signals → AI analysis → clinically actionable insights.
 * A glowing line fills between stages as the visitor scrolls, with
 * particles streaming along it; particle colour shifts teal → cyan →
 * rose, mirroring biology → AI → human health.
 */
export function DataFlow() {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMotion();
    const rail = railRef.current;
    const fill = fillRef.current;
    if (!rail || !fill) return;

    const stages = Array.from(
      rail.querySelectorAll<HTMLElement>("[data-flow-stage]"),
    );

    if (prefersReducedMotion()) {
      gsap.set(fill, { scaleY: 1 });
      stages.forEach((s) => s.classList.add("is-lit"));
      return;
    }

    const css = (token: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(token).trim();

    const ctx = gsap.context(() => {
      gsap.set(fill, { scaleY: 0, transformOrigin: "top" });

      // line fill scrubbed to scroll
      ScrollTrigger.create({
        trigger: rail,
        start: "top 72%",
        end: "bottom 45%",
        scrub: 0.6,
        onUpdate: (self) => gsap.set(fill, { scaleY: self.progress }),
      });

      // Each stage lights on its OWN trigger, not on maths against the
      // rail's cached height — that version left the last stage dim when
      // ScrollTrigger's measurements went stale. onEnter also fires on the
      // initial refresh, so reloading mid-page lights everything above you.
      stages.forEach((stage) => {
        ScrollTrigger.create({
          trigger: stage,
          start: "top 62%",
          onEnter: () => stage.classList.add("is-lit"),
          onLeaveBack: () => stage.classList.remove("is-lit"),
        });
      });

      // streaming particles: teal → cyan → rose along the line
      const dots = rail.querySelectorAll<HTMLElement>("[data-flow-dot]");
      const streams = gsap.timeline({ repeat: -1, paused: true });
      dots.forEach((dot, i) => {
        streams.fromTo(
          dot,
          { top: "0%", backgroundColor: css("--teal-600"), autoAlpha: 0 },
          {
            top: "100%",
            duration: 4.5,
            ease: "none",
            keyframes: {
              autoAlpha: [0, 1, 1, 1, 0],
              backgroundColor: [
                css("--teal-600"),
                css("--teal-400"),
                css("--copper-400"),
              ],
            },
          },
          i * 1.5,
        );
      });

      ScrollTrigger.create({
        trigger: rail,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? streams.play() : streams.pause()),
      });
    }, rail);

    return () => ctx.revert();
  }, []);

  return (
    <Section id={flow.id} label={flow.label}>
      <Reveal>
        <h2 className="type-h2 max-w-3xl">{flow.h2}</h2>
      </Reveal>

      <div ref={railRef} className="relative mt-20 max-w-3xl">
        {/* track + scrubbed gradient fill */}
        <div aria-hidden className="absolute bottom-3 left-[13px] top-3 w-px bg-line" />
        <div
          ref={fillRef}
          aria-hidden
          className="absolute bottom-3 left-[13px] top-3 w-px bg-gradient-to-b from-teal-600 via-teal-400 to-copper-400"
        />
        {/* streaming data particles */}
        <div aria-hidden className="absolute bottom-3 left-[13px] top-3 w-px">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              data-flow-dot
              className="absolute -left-[3px] size-[7px] rounded-full opacity-0"
            />
          ))}
        </div>

        <ol className="space-y-20 md:space-y-24">
          {flow.stages.map((stage, i) => (
            <li
              key={stage.title}
              data-flow-stage
              className="group relative grid grid-cols-[28px_1fr] gap-6 md:gap-10"
            >
              <span
                aria-hidden
                className={`mt-1 size-[27px] rounded-full border transition-all duration-500 ease-brand ${TONE[stage.tone].dot} scale-90 opacity-40 group-[.is-lit]:scale-100 group-[.is-lit]:opacity-100 ${
                  stage.tone === "human"
                    ? "group-[.is-lit]:shadow-glow-rose"
                    : "group-[.is-lit]:shadow-glow-teal"
                }`}
              />
              <div className="transition-opacity duration-500 ease-brand opacity-50 group-[.is-lit]:opacity-100">
                <p className="type-label mb-2 text-tertiary">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3
                  className={`font-display text-[clamp(1.35rem,2.6vw,2rem)] font-bold tracking-tight ${TONE[stage.tone].title}`}
                >
                  {stage.title}
                </h3>
                <p className="mt-3 max-w-md text-secondary">{stage.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
