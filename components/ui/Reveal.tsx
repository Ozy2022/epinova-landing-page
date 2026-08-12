"use client";

import { useEffect, useRef } from "react";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";

export interface RevealProps {
  children: React.ReactNode;
  /** stagger between direct children, seconds */
  stagger?: number;
  className?: string;
}

/**
 * Standard reveal (CLAUDE.md §8): direct children fade + rise 24px, once,
 * triggered 20% into view, 80ms stagger. Reduced motion renders final state.
 *
 * Uses gsap.context + revert so Strict Mode's double effect run restores the
 * pre-tween state — kill() alone leaves children stuck at opacity 0.
 */
export function Reveal({ children, stagger = 0.08, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMotion();
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger,
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
