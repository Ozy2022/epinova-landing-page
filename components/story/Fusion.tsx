"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { fusion } from "@/lib/content";

/**
 * Act 3 — Biology × Intelligence (v2 brief). The scene splits: BIOLOGY in
 * teal on the left, INTELLIGENCE in cyan on the right. As the visitor
 * scrolls, the two sides flow into each other and fuse into the EpiNova
 * mark. Scrub-linked; reduced motion renders a static composition.
 */
export function Fusion() {
  const wrapRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    initMotion();
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }
    const wrap = wrapRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const mark = markRef.current;
    if (!wrap || !left || !right || !mark) return;

    const ctx = gsap.context(() => {
      const words = wrap.querySelectorAll("[data-fusion-word]");
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        })
        // the two sides arrive from their edges
        .from(left, { xPercent: -45, autoAlpha: 0, duration: 0.3 }, 0)
        .from(right, { xPercent: 45, autoAlpha: 0, duration: 0.3 }, 0)
        .from(words, { y: 20, autoAlpha: 0, stagger: 0.03, duration: 0.15 }, 0.12)
        // …then flow into each other
        .to(left, { xPercent: 26, autoAlpha: 0, duration: 0.3 }, 0.52)
        .to(right, { xPercent: -26, autoAlpha: 0, duration: 0.3 }, 0.52)
        // …and fuse into the mark
        .from(mark, { scale: 0.7, autoAlpha: 0, duration: 0.3 }, 0.58);
    }, wrap);

    return () => ctx.revert();
  }, []);

  const columns = (
    <>
      <div
        ref={leftRef}
        className="flex flex-col items-end gap-4 text-right md:gap-6"
      >
        <p className="type-label text-teal-400">{fusion.left.title}</p>
        {fusion.left.words.map((word) => (
          <p
            key={word}
            data-fusion-word
            className="font-display text-[clamp(1.3rem,3.6vw,2.6rem)] font-bold tracking-tight text-teal-300"
          >
            {word}
          </p>
        ))}
      </div>
      <div ref={rightRef} className="flex flex-col gap-4 text-left md:gap-6">
        <p className="type-label text-blue-500">{fusion.right.title}</p>
        {fusion.right.words.map((word) => (
          <p
            key={word}
            data-fusion-word
            className="font-display text-[clamp(1.3rem,3.6vw,2.6rem)] font-bold tracking-tight text-blue-500"
          >
            {word}
          </p>
        ))}
      </div>
    </>
  );

  const mark = (
    <div
      ref={markRef}
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
    >
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={140}
        height={210}
        className="glow-mark h-auto w-24 md:w-32"
      />
      <p className="type-h2 mt-10">{fusion.statement}</p>
      <p className="type-body-lg mt-4 max-w-xl text-secondary">
        {fusion.substatement}
      </p>
    </div>
  );

  if (reduced) {
    return (
      <section id={fusion.id} className="bg-wash-teal relative scroll-mt-16 border-t border-line">
        <div className="mx-auto flex min-h-svh w-full max-w-300 flex-col items-center justify-center gap-14 px-6 py-28 md:px-10">
          <MonoLabel text={fusion.label} />
          <div className="grid w-full grid-cols-2 gap-10 md:gap-24 [&>div]:!items-center [&>div]:!text-center">
            {columns}
          </div>
          <div className="relative flex flex-col items-center text-center">
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={140}
              height={210}
              className="h-auto w-24 md:w-32"
            />
            <p className="type-h2 mt-10">{fusion.statement}</p>
            <p className="type-body-lg mt-4 max-w-xl text-secondary">
              {fusion.substatement}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={fusion.id}
      ref={wrapRef}
      className="relative h-[240vh] scroll-mt-16 border-t border-line"
    >
      <div className="bg-wash-teal sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-6">
        <MonoLabel text={fusion.label} className="absolute top-24" />
        <div className="grid w-full max-w-4xl grid-cols-2 gap-12 md:gap-32">
          {columns}
        </div>
        {mark}
      </div>
    </section>
  );
}
