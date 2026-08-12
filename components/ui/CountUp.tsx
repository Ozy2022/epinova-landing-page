"use client";

import { useEffect, useRef } from "react";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";

export interface CountUpProps {
  value: number;
  suffix?: string;
  decimals?: number;
  /** format with thousands separators (e.g. 1,000) */
  grouping?: boolean;
  className?: string;
}

/**
 * Tabular-mono number that counts up once when scrolled into view.
 * Server-renders the final value (SEO / no-JS), animates from 0 on mount.
 */
export function CountUp({
  value,
  suffix = "",
  decimals = 0,
  grouping = false,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const format = (n: number) =>
    (grouping
      ? Math.round(n).toLocaleString("en-US")
      : n.toFixed(decimals)) + suffix;

  useEffect(() => {
    initMotion();
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const state = { n: 0 };
    el.textContent = format(0);
    const ctx = gsap.context(() => {
      gsap.to(state, {
        n: value,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(state.n);
        },
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
    return () => {
      ctx.revert();
      // restore the SSR'd final value so a re-run never strands the zero state
      el.textContent = format(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, suffix, decimals, grouping]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
