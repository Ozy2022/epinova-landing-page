"use client";

import { useEffect, useRef } from "react";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";
import { Container } from "@/components/layout/Container";
import { ecosystem } from "@/lib/content";

/** desync the light sweeps and dot pulses so they never move in unison */
const WORD_DELAYS = ["", "[animation-delay:2s]", "[animation-delay:4s]"];
const DOT_DELAYS = ["", "[animation-delay:1.3s]"];

/**
 * Compact strip after the roadmap (founder): a small "Built for the
 * Healthcare Ecosystem" label and three big words — no explanations.
 * Motion: words rise from a blur in sequence, then carry a continuous
 * travelling light sweep; the separator dots breathe.
 */
export function Ecosystem() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    initMotion();
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        })
        .from("[data-eco-label]", { autoAlpha: 0, y: 16, duration: 0.5 })
        .from(
          "[data-eco-word]",
          {
            autoAlpha: 0,
            y: 44,
            filter: "blur(10px)",
            duration: 0.9,
            stagger: 0.16,
            ease: "power2.out",
          },
          "-=0.2",
        );
      // (the dots' own CSS pulse owns their transform/opacity — a GSAP
      // entrance on the same properties would be overridden mid-animation)
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id={ecosystem.id} ref={rootRef} className="scroll-mt-16 border-t border-line">
      <Container className="py-20 md:py-28">
        <div className="flex flex-col items-center gap-10 text-center">
          <p data-eco-label className="type-label text-tertiary">
            <span aria-hidden className="text-teal-500">
              •
            </span>{" "}
            {ecosystem.title}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:gap-x-10">
            {ecosystem.items.map((item, i) => (
              <li key={item} className="flex items-center gap-6 md:gap-10">
                {i > 0 ? (
                  <span
                    data-eco-dot
                    aria-hidden
                    className={`dot-pulse size-1.5 rounded-full bg-teal-500 ${DOT_DELAYS[i - 1]}`}
                  />
                ) : null}
                <span
                  data-eco-word
                  className={`shine-text font-display text-[clamp(1.6rem,3.4vw,2.75rem)] font-bold tracking-tight ${WORD_DELAYS[i]}`}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
