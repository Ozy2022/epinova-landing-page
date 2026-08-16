"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";

/**
 * Single GSAP registration point (CLAUDE.md §12). Import gsap from here,
 * never from "gsap" directly, so plugins and the reduced-motion guard are
 * always active.
 */
let registered = false;

export function initMotion(): void {
  if (typeof window === "undefined" || registered) return;
  registered = true;

  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText);

  gsap.defaults({ ease: "brand", duration: 0.6 });
  gsap.registerEase("brand", (p: number) => {
    // cubic-bezier(.22,1,.36,1) approximation via power curve blend
    return 1 - Math.pow(1 - p, 3.2);
  });

  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
}

/**
 * Founder decision (2026-08-16): motion is ALWAYS on. The scroll story is
 * the product, and the OS-level "reduce motion" setting was silently
 * switching whole devices to the static variant — which read as the site
 * being broken. Flip FORCE_MOTION to false to restore the accessibility
 * guard (every animation already has a static path behind this helper).
 */
const FORCE_MOTION = true;

/** True when animations should render their final state instantly. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  if (FORCE_MOTION) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Standard reveal: fade + translateY 24px, once, 20% in view, 80ms stagger. */
export function revealUp(
  targets: gsap.TweenTarget,
  opts: { stagger?: number; delay?: number } = {},
): gsap.core.Tween | null {
  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return null;
  }
  return gsap.from(targets, {
    opacity: 0,
    y: 24,
    duration: 0.6,
    stagger: opts.stagger ?? 0.08,
    delay: opts.delay ?? 0,
    scrollTrigger: {
      trigger: targets as gsap.DOMTarget,
      start: "top 80%",
      once: true,
    },
  });
}

export { gsap, ScrollTrigger, SplitText };
