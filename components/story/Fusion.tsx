"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  gsap,
  ScrollTrigger,
  initMotion,
  prefersReducedMotion,
} from "@/lib/motion";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { VideoBackdrop } from "@/components/story/VideoBackdrop";
import { fusion } from "@/lib/content";

/**
 * Act 3 — Biology × Intelligence (v2 brief). The scene splits: BIOLOGY in
 * teal on the left, INTELLIGENCE in cyan on the right, and each biology
 * term is wired to its counterpart by a signal pathway — a hairline
 * carrying quiet drifting particles and a staggered brighter pulse that
 * lights the destination term for a beat as it lands: biological signal →
 * transmission → insight. As the visitor scrolls, the two sides flow into
 * each other and fuse into the EpiNova mark. Scrub-linked; reduced motion
 * renders the static composition with plain connectors.
 */
export function Fusion() {
  const wrapRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    initMotion();
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }
    const wrap = wrapRef.current;
    const mark = markRef.current;
    if (!wrap || !mark) return;

    const ctx = gsap.context(() => {
      const lefts = gsap.utils.toArray<HTMLElement>(
        '[data-fusion-side="left"]',
        wrap,
      );
      const rights = gsap.utils.toArray<HTMLElement>(
        '[data-fusion-side="right"]',
        wrap,
      );
      const conns = gsap.utils.toArray<HTMLElement>("[data-fusion-conn]", wrap);
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
        .from(lefts, { xPercent: -45, autoAlpha: 0, duration: 0.3 }, 0)
        .from(rights, { xPercent: 45, autoAlpha: 0, duration: 0.3 }, 0)
        .from(words, { y: 20, autoAlpha: 0, stagger: 0.03, duration: 0.15 }, 0.12)
        // the signal pathways draw left → right once both sides are seated,
        // early enough that all three hold fully lit before the merge
        .from(
          conns,
          {
            scaleX: 0,
            autoAlpha: 0,
            transformOrigin: "left center",
            stagger: 0.03,
            duration: 0.1,
          },
          0.22,
        )
        .to(conns, { autoAlpha: 0, duration: 0.18 }, 0.5)
        // …then flow into each other
        .to(lefts, { xPercent: 26, autoAlpha: 0, duration: 0.3 }, 0.52)
        .to(rights, { xPercent: -26, autoAlpha: 0, duration: 0.3 }, 0.52)
        // …and fuse into the mark
        .from(mark, { scale: 0.7, autoAlpha: 0, duration: 0.3 }, 0.58);

      // the pathways live: a brighter pulse travels each line in sequence —
      // DNA → AI, then Biomarkers → Analytics, then Molecular Signals →
      // Clinical Insights — and the destination term glows as it lands
      const pulses = gsap.utils.toArray<HTMLElement>(
        "[data-signal-pulse]",
        wrap,
      );
      const targets = gsap.utils.toArray<HTMLElement>(
        "[data-signal-target]",
        wrap,
      );

      const cascade = gsap.timeline({ repeat: -1, repeatDelay: 1.8, paused: true });
      pulses.forEach((pulse, i) => {
        const at = i * 0.55;
        cascade.fromTo(
          pulse,
          { left: "0%", autoAlpha: 0 },
          {
            left: "94%",
            duration: 1.5,
            ease: "power1.inOut",
            keyframes: { autoAlpha: [0, 1, 1, 0] },
          },
          at,
        );
        const target = targets[i];
        if (target) {
          cascade.fromTo(
            target,
            { filter: "drop-shadow(0 0 0px transparent)" },
            {
              filter: "drop-shadow(0 0 9px currentColor)",
              duration: 0.3,
              ease: "power2.out",
              yoyo: true,
              repeat: 1,
              repeatDelay: 0.1,
            },
            at + 1.25,
          );
        }
      });

      // …under the pulses, small particles drift continuously along each
      // line — the quiet ambient half of the signal
      const drift = gsap.timeline({ paused: true });
      gsap.utils
        .toArray<HTMLElement>("[data-signal-dot]", wrap)
        .forEach((dot, i) => {
          drift.fromTo(
            dot,
            { left: "0%", autoAlpha: 0 },
            {
              left: "94%",
              duration: 3.4,
              ease: "none",
              repeat: -1,
              repeatDelay: 1.3,
              keyframes: { autoAlpha: [0, 0.45, 0.45, 0] },
            },
            (i % 2) * 1.7 + Math.floor(i / 2) * 0.45,
          );
        });

      ScrollTrigger.create({
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          [cascade, drift].forEach((t) => (self.isActive ? t.play() : t.pause()));
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  const pairs = fusion.left.words.map((word, i) => ({
    from: word,
    to: fusion.right.words[i] ?? "",
  }));

  const rows = (
    <div className="relative grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-4 md:gap-x-8 md:gap-y-6">
      <div data-fusion-side="left" className="text-right">
        <p className="type-label text-teal-400">{fusion.left.title}</p>
      </div>
      <span aria-hidden />
      <div data-fusion-side="right" className="text-left">
        <p className="type-label text-blue-500">{fusion.right.title}</p>
      </div>

      {pairs.map((pair) => (
        <Fragment key={pair.from}>
          <div data-fusion-side="left" className="text-right">
            <p
              data-fusion-word
              className="font-display text-[clamp(1.3rem,3.6vw,2.6rem)] font-bold tracking-tight text-teal-300"
            >
              {pair.from}
            </p>
          </div>

          {/* signal pathway: node → hairline → drifting particles → pulse → arrow */}
          <div
            data-fusion-conn
            aria-hidden
            className="relative h-4 w-14 md:w-32 lg:w-44"
          >
            <span className="absolute inset-y-0 left-0 right-[7px] my-auto h-px bg-gradient-to-r from-teal-600/60 via-teal-500/40 to-blue-500/70" />
            <span className="absolute left-0 top-1/2 size-[5px] -translate-y-1/2 rounded-full bg-teal-500" />
            <svg
              width="7"
              height="10"
              viewBox="0 0 7 10"
              fill="none"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500"
            >
              <path
                d="M1 1l5 4-5 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {[0, 1].map((j) => (
              <span
                key={j}
                data-signal-dot
                className="absolute top-1/2 size-[3px] -translate-y-1/2 rounded-full bg-teal-400 opacity-0"
              />
            ))}
            <span
              data-signal-pulse
              className="signal-pulse absolute top-1/2 size-[5px] -translate-y-1/2 rounded-full bg-teal-300 opacity-0"
            />
          </div>

          <div data-fusion-side="right" className="text-left">
            <p
              data-fusion-word
              data-signal-target
              className="font-display text-[clamp(1.3rem,3.6vw,2.6rem)] font-bold tracking-tight text-blue-500"
            >
              {pair.to}
            </p>
          </div>
        </Fragment>
      ))}
    </div>
  );

  if (reduced) {
    return (
      <section id={fusion.id} className="bg-wash-teal relative scroll-mt-16 border-t border-line">
        <VideoBackdrop
          src="/video/dna-loop.mp4"
          poster="/video/dna-poster.jpg"
          className="opacity-20"
        />
        <div className="relative mx-auto flex min-h-svh w-full max-w-300 flex-col items-center justify-center gap-14 px-6 py-28 md:px-10">
          <MonoLabel text={fusion.label} />
          {rows}
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
      className="relative h-[180vh] scroll-mt-16 border-t border-line md:h-[240vh]"
    >
      <div className="bg-wash-teal sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-6">
        <VideoBackdrop
          src="/video/dna-loop.mp4"
          poster="/video/dna-poster.jpg"
          className="opacity-20"
        />
        <MonoLabel text={fusion.label} className="absolute top-24" />
        {rows}
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
      </div>
    </section>
  );
}
