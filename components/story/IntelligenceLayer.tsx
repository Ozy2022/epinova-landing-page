"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";
import { Container } from "@/components/layout/Container";
import { intelligence, type ChainItem } from "@/lib/content";

const TONE: Record<ChainItem["tone"], string> = {
  biology: "text-teal-300",
  ai: "text-blue-500",
  human: "text-copper-300",
};

/**
 * Small interlude between Fusion and Data Flow (founder): title, one
 * sentence, and a three-step chain. Motion: the chain reveals downward,
 * then a continuous pulse cascades through it — Molecular Data →
 * AI Intelligence → Clinical Insight — glowing each step in its
 * semantic colour, like data trickling through the intelligence layer.
 */
export function IntelligenceLayer() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    initMotion();
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-chain-step]");
      const arrows = gsap.utils.toArray<HTMLElement>("[data-chain-arrow]");

      // entrance — headline, sentence, then the chain builds downward
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 75%", once: true },
        })
        .from("[data-il-head]", {
          autoAlpha: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.12,
        })
        .from(
          [steps[0], arrows[0], steps[1], arrows[1], steps[2]],
          { autoAlpha: 0, y: -14, duration: 0.45, stagger: 0.12 },
          "-=0.15",
        );

      // continuous cascade — one pulse travelling down the chain
      const cascade = gsap.timeline({ repeat: -1, repeatDelay: 1.4, paused: true });
      steps.forEach((step, i) => {
        const at = i * 0.55;
        cascade
          .to(
            step,
            {
              scale: 1.07,
              filter: "drop-shadow(0 0 14px currentColor)",
              duration: 0.35,
              ease: "power2.out",
            },
            at,
          )
          .to(
            step,
            { scale: 1, filter: "drop-shadow(0 0 0px transparent)", duration: 0.5 },
            at + 0.4,
          );
        if (arrows[i]) {
          cascade.fromTo(
            arrows[i],
            { y: -3, opacity: 0.4 },
            { y: 3, opacity: 1, duration: 0.3, yoyo: true, repeat: 1 },
            at + 0.3,
          );
        }
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? cascade.play() : cascade.pause()),
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id={intelligence.id}
      ref={rootRef}
      className="border-t border-line"
    >
      <Container className="py-20 md:py-28">
        <div className="flex flex-col items-center text-center">
          <h2
            data-il-head
            className="font-display max-w-2xl text-[clamp(1.5rem,3.2vw,2.5rem)] font-bold tracking-tight"
          >
            {intelligence.title}
          </h2>
          <p data-il-head className="mt-5 max-w-xl text-secondary">
            {intelligence.body}
          </p>

          <div className="mt-12 flex flex-col items-center gap-1.5">
            {intelligence.chain.map((item, i) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5">
                {i > 0 ? (
                  <span
                    data-chain-arrow
                    aria-hidden
                    className="font-mono text-lg text-tertiary"
                  >
                    ↓
                  </span>
                ) : null}
                <span
                  data-chain-step
                  className={`font-display text-xl font-bold tracking-tight md:text-2xl ${TONE[item.tone]}`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
