"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";
import { ParticleField } from "@/lib/particles";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { hero } from "@/lib/content";

/**
 * Acts 1–2 of the story (v2 brief).
 * Act 1 (time-based): the logo mark appears as particles, dissolves into a
 * drifting field, then the hero text fades in.
 * Act 2 (scroll-scrubbed): the field converges into the EPINOVA wordmark —
 * the visitor assembles the brand by scrolling.
 *
 * Reduced motion renders a fully static hero (logo + text) instead.
 */
export function ParticleIntro() {
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    initMotion();
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const heroEl = heroRef.current;
    const wordEl = wordRef.current;
    if (!wrap || !canvas || !heroEl || !wordEl) return;

    const field = new ParticleField({
      canvas,
      logoSrc: "/brand/logo-mark.png",
      word: hero.convergence.wordmark,
    });
    let killed = false;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) field.start();
      else field.stop();
    });
    const onVisibility = () => {
      if (document.hidden) field.stop();
      else field.start();
    };

    const ctx = gsap.context(() => {
      // hero copy waits for the dissolve; wordmark waits for convergence
      gsap.set(heroEl, { autoAlpha: 0, y: 24 });
      gsap.set(wordEl, { autoAlpha: 0 });

      field.init().then(() => {
        if (killed) return;
        field.start();
        io.observe(canvas);
        document.addEventListener("visibilitychange", onVisibility);

        // Act 1 — hold the assembled mark, then dissolve
        gsap
          .timeline({ delay: 0.6 })
          .to(field, {
            disperse: 1,
            duration: 1.8,
            ease: "power2.inOut",
          })
          .to(heroEl, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.7");
      });

      // Act 2 — scrub-linked convergence across the tall wrapper
      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;
          field.converge = gsap.utils.clamp(
            0,
            1,
            gsap.utils.normalize(0.1, 0.85, p),
          );
          // hero copy leaves early…
          gsap.set(heroEl, {
            autoAlpha: gsap.utils.clamp(0, 1, 1 - p / 0.2),
            y: -48 * gsap.utils.clamp(0, 1, p / 0.2),
          });
          // …the crisp wordmark lands at the end
          gsap.set(wordEl, {
            autoAlpha: gsap.utils.clamp(0, 1, gsap.utils.normalize(0.8, 0.97, p)),
          });
        },
      });
    }, wrap);

    return () => {
      killed = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ctx.revert();
      field.destroy();
    };
  }, []);

  if (reduced) {
    return (
      <section id={hero.id} className="relative">
        <div className="bg-wash-deep flex min-h-svh flex-col items-center justify-center px-6 py-28 text-center">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={112}
            height={168}
            priority
            className="h-auto w-24 md:w-28"
          />
          <MonoLabel text={hero.label} className="mb-6 mt-10" />
          <h1 className="type-display-xl">
            {hero.h1.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="type-body-lg mt-6 max-w-2xl text-secondary">{hero.sub}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {hero.ctas.map((cta) => (
              <Button key={cta.label} href={cta.href} variant={cta.variant}>
                {cta.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={hero.id} ref={wrapRef} className="relative h-[300vh]">
      <div className="bg-wash-deep sticky top-0 h-svh overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
        />

        {/* Act 1 — hero copy over the quiet particle field */}
        <div
          ref={heroRef}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <MonoLabel text={hero.label} className="mb-6" />
          <h1 className="type-display-xl">
            {hero.h1.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="type-body-lg mt-6 max-w-2xl text-secondary">{hero.sub}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {hero.ctas.map((cta) => (
              <Button key={cta.label} href={cta.href} variant={cta.variant}>
                {cta.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Act 2 — the particles themselves form the wordmark; only the
            subline is DOM text, landing beneath the assembled letters */}
        <div
          ref={wordRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[63%] z-10 px-6 text-center"
        >
          <p className="type-body-lg text-secondary">
            {hero.convergence.line}
          </p>
        </div>
      </div>
    </section>
  );
}
