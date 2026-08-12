"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";

export interface HelixProps {
  /** parent controls width via className (e.g. "w-40 md:w-64") */
  className?: string;
  /** responsive sizes hint for next/image */
  sizes?: string;
}

/**
 * Hero visual: the official helix mark, breathing. Slow float + soft ambient
 * glow — "alive, not a video game". Pauses off-screen and on tab blur
 * (CLAUDE.md §8); reduced motion renders the static mark.
 */
export function Helix({ className, sizes }: HelixProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMotion();
    const wrap = wrapRef.current;
    if (!wrap || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(wrap, { opacity: 0, y: 28, duration: 0.9, delay: 0.15 });
      gsap.to(wrap, {
        y: -10,
        duration: 4.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.05,
      });
    }, wrap);

    const setPaused = (paused: boolean) =>
      gsap.getTweensOf(wrap).forEach((t) => (paused ? t.pause() : t.play()));

    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(wrap);
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      {/* soft ambient glow behind the mark — decorative */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full opacity-60 blur-3xl"
        style={{ background: "var(--line-accent)" }}
      />
      <Image
        src="/brand/logo-mark.png"
        alt="EpiNova helix mark — DNA strands threaded with circuit traces"
        width={389}
        height={583}
        priority
        sizes={sizes ?? "(max-width: 768px) 40vw, 280px"}
        className="h-auto w-full"
      />
    </div>
  );
}
