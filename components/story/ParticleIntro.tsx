"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";
import { ParticleField } from "@/lib/particles";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { hero } from "@/lib/content";

const clamp01 = gsap.utils.clamp(0, 1);

/**
 * Acts 1–2 of the story, entirely scroll-driven (client direction):
 * the page OPENS on the crisp brand logo, alone and clearly visible.
 * Scrolling dissolves it into the particle field and only then does the
 * hero copy arrive; scrolling further converges the particles into the
 * EPINOVA wordmark. A quiet bobbing cue invites the first scroll.
 */
export function ParticleIntro() {
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
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
    const logoEl = logoRef.current;
    const hintEl = hintRef.current;
    if (!wrap || !canvas || !heroEl || !wordEl || !logoEl || !hintEl) return;

    const field = new ParticleField({
      canvas,
      logoSrc: "/brand/logo-mark.png",
      word: hero.convergence.wordmark,
    });
    let killed = false;
    let fallback = false;
    let safety: ReturnType<typeof setTimeout> | undefined;

    const ctx = gsap.context(() => {
      // the copy waits for the visitor's scroll; the logo owns the open
      gsap.set(heroEl, { autoAlpha: 0, y: 24 });
      gsap.set(wordEl, { autoAlpha: 0 });

      const revealHero = () => {
        fallback = true;
        gsap.to(heroEl, { autoAlpha: 1, y: 0, duration: 0.7 });
      };
      // if the canvas can't initialise, never strand the visitor on a
      // logo with no copy — surface the hero anyway
      safety = setTimeout(() => {
        if (!killed) revealHero();
      }, 3000);

      field.init().then(() => {
        if (killed) return;
        clearTimeout(safety);
        field.start();
        // the crisp logo breathes very gently while it waits
        gsap.to(logoEl, {
          scale: 1.015,
          duration: 2.6,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      })
      .catch(() => {
        if (!killed) revealHero();
      });

      // one scrubbed storyline across the tall wrapper:
      // logo → dissolve → hero copy → convergence → wordmark
      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;

          field.disperse = clamp01(p / 0.28);
          field.converge = clamp01(gsap.utils.normalize(0.34, 0.88, p));

          // crisp logo hands over to the particles on the first scroll
          gsap.set(logoEl, { autoAlpha: clamp01(1 - p / 0.08) });
          gsap.set(hintEl, { autoAlpha: clamp01(1 - p / 0.05) });

          // hero copy: arrives once the dissolve is underway, leaves
          // before the wordmark forms
          if (!(fallback && p < 0.3)) {
            const heroIn = clamp01(gsap.utils.normalize(0.1, 0.24, p));
            const heroOut = 1 - clamp01(gsap.utils.normalize(0.32, 0.44, p));
            gsap.set(heroEl, {
              autoAlpha: Math.min(heroIn, heroOut),
              y: 24 * (1 - heroIn) - 48 * (1 - heroOut),
            });
          }

          gsap.set(wordEl, {
            autoAlpha: clamp01(gsap.utils.normalize(0.84, 0.97, p)),
          });
        },
      });
    }, wrap);

    return () => {
      killed = true;
      clearTimeout(safety);
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
    <section id={hero.id} ref={wrapRef} className="relative h-[220vh] md:h-[300vh]">
      <div className="bg-wash-deep sticky top-0 h-svh overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
        />

        {/* the opening frame: the actual brand mark, crisp and clear,
            registered exactly over the particle copy beneath it */}
        <div className="pointer-events-none absolute left-1/2 top-[46%] z-10 -translate-x-1/2 -translate-y-1/2">
          <div ref={logoRef}>
            <Image
              src="/brand/logo-mark.png"
              alt="EPINOVA"
              width={389}
              height={583}
              priority
              className="glow-mark h-[min(42svh,400px)] w-auto"
            />
          </div>
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div ref={hintRef} className="flex flex-col items-center gap-2.5">
            <span className="type-label text-tertiary">Scroll</span>
            <svg
              width="18"
              height="10"
              viewBox="0 0 18 10"
              fill="none"
              aria-hidden
              className="scroll-hint text-teal-400"
            >
              <path
                d="M1.5 1.5L9 8.5l7.5-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Act 1½ — hero copy over the quiet particle field. Hidden in the
            server HTML (invisible/opacity-0) so the first paint shows only
            the logo — GSAP's inline styles take over after hydration. */}
        <div
          ref={heroRef}
          className="invisible relative z-10 flex h-full flex-col items-center justify-center px-6 text-center opacity-0"
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

        {/* the subline beneath the particle-formed letters — also hidden in
            the server HTML to avoid the pre-hydration flash */}
        <div
          ref={wordRef}
          aria-hidden
          className="invisible pointer-events-none absolute inset-x-0 top-[63%] z-10 px-6 text-center opacity-0"
        >
          <p className="type-body-lg text-secondary">
            {hero.convergence.line}
          </p>
        </div>
      </div>
    </section>
  );
}
