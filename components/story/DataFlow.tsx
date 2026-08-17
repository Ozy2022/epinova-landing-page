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

/** custom hairline icons, one per stage (1.5px stroke, currentColor) */
const ICONS = [
  // 01 — blood drop
  <svg key="drop" width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden>
    <path
      d="M14 3.5c4 5.4 7 8.7 7 12.4a7 7 0 1 1-14 0c0-3.7 3-7 7-12.4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>,
  // 02 — helix
  <svg key="helix" width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden>
    <path
      d="M9.5 3.5c9.5 5.3 9.5 15.7 0 21M18.5 3.5c-9.5 5.3-9.5 15.7 0 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10.8 9.2h6.4M9.6 14h8.8M10.8 18.8h6.4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>,
  // 03 — neural nodes
  <svg key="ai" width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden>
    <circle cx="7" cy="7.5" r="2.6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="7" cy="20.5" r="2.6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="21" cy="14" r="2.6" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M9.4 8.8l9 4M9.4 19.2l9-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>,
  // 04 — clinical report
  <svg key="report" width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden>
    <rect x="7" y="3.5" width="14" height="21" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10.5 9.5h7M10.5 13.5h7M10.5 17.5h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>,
];

/**
 * Act 4 — how the data flows. A centre spine fills teal → cyan → rose as
 * the visitor scrolls, particles stream along it, and the four stages sit
 * in glass cards that alternate sides of the spine on desktop, each
 * sliding in from its own side. Colour = meaning: biology → AI → human.
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
    const wide = window.matchMedia("(min-width: 768px)").matches;

    const ctx = gsap.context(() => {
      gsap.set(fill, { scaleY: 0, transformOrigin: "top" });

      // spine fill scrubbed to scroll
      ScrollTrigger.create({
        trigger: rail,
        start: "top 72%",
        end: "bottom 45%",
        scrub: 0.6,
        onUpdate: (self) => gsap.set(fill, { scaleY: self.progress }),
      });

      stages.forEach((stage, i) => {
        // lighting: each stage owns its trigger (survives stale measurements)
        ScrollTrigger.create({
          trigger: stage,
          start: "top 62%",
          onEnter: () => stage.classList.add("is-lit"),
          onLeaveBack: () => stage.classList.remove("is-lit"),
        });

        // entrance: cards arrive from their own side of the spine
        const card = stage.querySelector("[data-flow-card]");
        const node = stage.querySelector("[data-flow-node]");
        if (card) {
          gsap.from(card, {
            x: wide ? (i % 2 ? 64 : -64) : 0,
            y: wide ? 0 : 28,
            autoAlpha: 0,
            duration: 0.7,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: { trigger: stage, start: "top 80%", once: true },
          });
        }
        if (node) {
          gsap.from(node, {
            scale: 0.3,
            autoAlpha: 0,
            duration: 0.5,
            clearProps: "all",
            scrollTrigger: { trigger: stage, start: "top 80%", once: true },
          });
        }
      });

      // streaming particles: teal → cyan → rose along the spine
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

      <div ref={railRef} className="relative mx-auto mt-16 max-w-4xl md:mt-24">
        {/* spine: left on mobile, centre on desktop */}
        <div
          aria-hidden
          className="absolute bottom-2 left-[17px] top-2 w-px bg-line md:left-1/2 md:-translate-x-1/2"
        />
        <div
          ref={fillRef}
          aria-hidden
          className="absolute bottom-2 left-[17px] top-2 w-px bg-gradient-to-b from-teal-600 via-teal-400 to-copper-400 md:left-1/2 md:-translate-x-1/2"
        />
        {/* streaming data particles */}
        <div
          aria-hidden
          className="absolute bottom-2 left-[17px] top-2 w-px md:left-1/2 md:-translate-x-1/2"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              data-flow-dot
              className="absolute -left-[3px] size-[7px] rounded-full opacity-0"
            />
          ))}
        </div>

        <ol className="space-y-10 md:space-y-16">
          {flow.stages.map((stage, i) => (
            <li
              key={stage.title}
              data-flow-stage
              className="group relative md:grid md:grid-cols-[1fr_72px_1fr] md:items-start"
            >
              {/* node on the spine */}
              <span
                data-flow-node
                aria-hidden
                className={`absolute left-[17px] top-8 z-10 size-[30px] -translate-x-1/2 rounded-full border transition-all duration-500 ease-brand md:static md:col-start-2 md:row-start-1 md:mt-8 md:translate-x-0 md:justify-self-center ${TONE[stage.tone].dot} scale-90 opacity-40 group-[.is-lit]:scale-100 group-[.is-lit]:opacity-100 ${
                  stage.tone === "human"
                    ? "group-[.is-lit]:shadow-glow-rose"
                    : "group-[.is-lit]:shadow-glow-teal"
                }`}
              />

              {/* glass card, alternating sides on desktop */}
              <div
                data-flow-card
                className={`glass-card relative ml-12 p-6 opacity-60 transition-opacity duration-500 ease-brand group-[.is-lit]:opacity-100 md:row-start-1 md:ml-0 md:p-8 ${
                  i % 2 === 0 ? "md:col-start-1" : "md:col-start-3"
                }`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-5 top-4 select-none font-mono text-5xl font-medium text-tertiary/15"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={TONE[stage.tone].title}>{ICONS[i]}</span>
                <h3
                  className={`mt-4 font-display text-xl font-bold tracking-tight md:text-2xl ${TONE[stage.tone].title}`}
                >
                  {stage.title}
                </h3>
                <p className="mt-2.5 max-w-sm text-sm text-secondary md:text-base">
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
