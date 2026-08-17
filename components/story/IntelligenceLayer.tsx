"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";
import { Container } from "@/components/layout/Container";
import { intelligence, type ChainItem } from "@/lib/content";

const TONE: Record<ChainItem["tone"], string> = {
  biology: "text-teal-300",
  ai: "text-blue-500",
  human: "text-copper-300",
};

/** connector pulse colours: teal→cyan on the first link, cyan→rose on the second */
const LINK_COLORS: Array<[string, string]> = [
  ["--teal-400", "--blue-500"],
  ["--blue-500", "--copper-400"],
];

/**
 * Small interlude between Fusion and Data Flow (founder). Redesigned:
 * the three steps are glass cards joined by hairline connectors —
 * horizontal on desktop, vertical on mobile. A pulse travels the chain
 * continuously: each card glows in its semantic colour as a light dot
 * crosses the connector to the next — data moving through the layer.
 */
export function IntelligenceLayer() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    initMotion();
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const css = (token: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    const wide = window.matchMedia("(min-width: 768px)").matches;

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-chain-step]");
      const links = gsap.utils.toArray<HTMLElement>("[data-chain-link]");

      // entrance — headline, sentence, then the chain assembles
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 75%", once: true },
        })
        .from("[data-il-head]", {
          autoAlpha: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.12,
        })
        .from(
          steps,
          {
            autoAlpha: 0,
            scale: 0.9,
            y: 14,
            duration: 0.5,
            stagger: 0.14,
            ease: "power2.out",
            clearProps: "all",
          },
          "-=0.2",
        )
        .from(links, { autoAlpha: 0, duration: 0.4, stagger: 0.14 }, "-=0.55");

      // continuous cascade — a light pulse travelling card → link → card
      const cascade = gsap.timeline({ repeat: -1, repeatDelay: 1.3, paused: true });
      steps.forEach((step, i) => {
        const at = i * 0.85;
        cascade
          .to(
            step,
            {
              scale: 1.05,
              filter: "drop-shadow(0 0 16px currentColor)",
              duration: 0.35,
              ease: "power2.out",
            },
            at,
          )
          .to(
            step,
            { scale: 1, filter: "drop-shadow(0 0 0px transparent)", duration: 0.55 },
            at + 0.4,
          );

        const link = links[i];
        if (link) {
          const dot = link.querySelector("[data-link-dot]");
          const [from, to] = LINK_COLORS[i];
          if (dot) {
            cascade.fromTo(
              dot,
              {
                ...(wide ? { left: "-4%" } : { top: "-4%" }),
                backgroundColor: css(from),
                autoAlpha: 0,
              },
              {
                ...(wide ? { left: "96%" } : { top: "96%" }),
                backgroundColor: css(to),
                keyframes: { autoAlpha: [0, 1, 1, 0] },
                duration: 0.6,
                ease: "power1.inOut",
              },
              at + 0.35,
            );
          }
        }
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? cascade.play() : cascade.pause()),
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id={intelligence.id}
      ref={rootRef}
      className="border-t border-line"
    >
      <Container className="py-20 md:py-28">
        <div className="flex flex-col items-center text-center">
          <h2
            data-il-head
            className="font-display max-w-2xl text-[clamp(1.5rem,3.2vw,2.5rem)] font-bold tracking-tight"
          >
            {intelligence.title}
          </h2>
          <p data-il-head className="mt-5 max-w-xl text-secondary">
            {intelligence.body}
          </p>

          {/* the chain: glass cards joined by live connectors */}
          <div className="mt-14 flex flex-col items-center md:flex-row md:justify-center">
            {intelligence.chain.map((item, i) => (
              <Fragment key={item.label}>
                {i > 0 ? (
                  <span
                    data-chain-link
                    aria-hidden
                    className="relative block h-12 w-px bg-line-strong md:h-px md:w-16 lg:w-24"
                  >
                    <span
                      data-link-dot
                      className="absolute left-1/2 top-0 size-[7px] -translate-x-1/2 rounded-full opacity-0 md:left-0 md:top-1/2 md:translate-x-0 md:-translate-y-1/2"
                    />
                  </span>
                ) : null}
                <div
                  data-chain-step
                  className={`glass-card px-7 py-4 md:px-9 md:py-5 ${TONE[item.tone]}`}
                >
                  <span className="font-display text-lg font-bold tracking-tight md:text-xl">
                    {item.label}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
