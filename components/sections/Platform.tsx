"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";
import { platform } from "@/lib/content";

/**
 * 05 — THE PLATFORM: dashboard in a browser frame with mouse tilt (max 6°)
 * and two glass callout cards parallaxing at different rates. Metrics in the
 * mockup are labelled illustrative until the client confirms them (§11-05).
 */
export function Platform() {
  const frameRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMotion();
    const frame = frameRef.current;
    const wrap = wrapRef.current;
    if (!frame || !wrap || prefersReducedMotion()) return;

    // mouse tilt, max 6°
    const qx = gsap.quickTo(frame, "rotationY", { duration: 0.5 });
    const qy = gsap.quickTo(frame, "rotationX", { duration: 0.5 });
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      qx(nx * 6);
      qy(ny * -6);
    };
    const onLeave = () => {
      qx(0);
      qy(0);
    };
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);

    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <Section id={platform.id} label={platform.label} wide>
      <Reveal className="max-w-3xl">
        <h2 className="type-display-lg">
          <span className="text-copper-400">{platform.h2Accent}</span>
          {platform.h2Rest}
        </h2>
        <p className="type-h3 mt-4 text-secondary">{platform.sub}</p>
        <p className="mt-4 text-sm text-tertiary">{platform.line}</p>
      </Reveal>

      <div
        ref={wrapRef}
        className="relative mt-16"
        style={{ perspective: "1200px" }}
      >
        <div
          ref={frameRef}
          className="overflow-hidden rounded-xl border border-line bg-navy-850 shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <span aria-hidden className="size-2.5 rounded-full bg-navy-700" />
            <span aria-hidden className="size-2.5 rounded-full bg-navy-700" />
            <span aria-hidden className="size-2.5 rounded-full bg-navy-700" />
            <span className="type-label ml-4 text-tertiary">
              platform.epinova.co
            </span>
          </div>
          <Image
            src="/img/dashboard.png"
            alt="EpiNova Lab Portal — analytics dashboard with methylation marker analysis and AI-generated clinical insights"
            width={1443}
            height={708}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="h-auto w-full"
          />
        </div>
      </div>

      {!platform.illustrativeMetricsConfirmed && (
        <p className="type-label mt-6 text-tertiary">
          Interface shown is illustrative.
        </p>
      )}
    </Section>
  );
}
