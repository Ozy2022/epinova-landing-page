"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";

/**
 * The signature mechanic (CLAUDE.md §4): a hairline strand fixed to the left
 * edge (desktop) / top progress bar (mobile), scroll-linked. Its colour
 * interpolates teal → blue → copper as the visitor descends — biology →
 * intelligence → clinical outcome. Colours are read from the CSS tokens,
 * never hard-coded.
 */
export function ScrollStrand() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMotion();
    const el = rootRef.current;
    if (!el) return;

    const css = getComputedStyle(document.documentElement);
    const stops = [
      css.getPropertyValue("--teal-500").trim(),
      css.getPropertyValue("--blue-500").trim(),
      css.getPropertyValue("--copper-500").trim(),
    ];
    const colorAt = gsap.utils.interpolate(stops);

    const apply = (p: number) => {
      el.style.setProperty("--strand-progress", String(p));
      el.style.setProperty("--strand-color", colorAt(p));
    };

    if (prefersReducedMotion()) {
      apply(1);
      return;
    }

    apply(0);
    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => apply(self.progress),
    });
    return () => st.kill();
  }, []);

  return (
    <div ref={rootRef} aria-hidden>
      {/* desktop: left-edge vertical strand */}
      <div className="fixed inset-y-0 left-6 z-40 hidden w-px bg-line md:block">
        <div
          className="h-full w-full origin-top"
          style={{
            background: "var(--strand-color)",
            transform: "scaleY(var(--strand-progress))",
            boxShadow: "0 0 12px var(--strand-color)",
          }}
        />
      </div>
      {/* mobile: top progress bar */}
      <div className="fixed inset-x-0 top-0 z-40 h-0.5 md:hidden">
        <div
          className="h-full w-full origin-left"
          style={{
            background: "var(--strand-color)",
            transform: "scaleX(var(--strand-progress))",
          }}
        />
      </div>
    </div>
  );
}
