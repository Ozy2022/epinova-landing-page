"use client";

import { useEffect, useRef } from "react";
import { TestTube, FileText } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { MethylationIcon } from "@/components/icons/MethylationIcon";
import { NeuralNetworkIcon } from "@/components/icons/NeuralNetworkIcon";
import { gsap, ScrollTrigger, initMotion, prefersReducedMotion } from "@/lib/motion";
import { process as processContent, type PipelineStep } from "@/lib/content";

/** ssDNA-style extraction glyph, hairline to match the set. */
function ExtractionIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M9 4c0 8 14 8 14 12S9 20 9 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.2 7h7M11 25h7M14.5 16h6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS: Record<PipelineStep["icon"], React.ReactNode> = {
  sample: <TestTube size={32} weight="light" />,
  extraction: <ExtractionIcon />,
  methylation: <MethylationIcon />,
  ai: <NeuralNetworkIcon />,
  report: <FileText size={32} weight="light" />,
};

/**
 * 03 — THE PROCESS: 5-node pipeline. The connecting hairline fills on scroll
 * with the teal → blue → copper gradient; nodes scale to 1.06 and gain the
 * teal glow as the fill reaches them. Labels only — no paragraphs.
 */
export function Process() {
  const trackRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    initMotion();
    const track = trackRef.current;
    if (!track) return;
    const fill = track.querySelector<HTMLElement>("[data-fill]");
    const nodes = Array.from(
      track.querySelectorAll<HTMLElement>("[data-node]"),
    );
    if (!fill) return;

    if (prefersReducedMotion()) {
      fill.style.transform = "none";
      nodes.forEach((n) => n.classList.add("is-lit"));
      return;
    }

    const st = ScrollTrigger.create({
      trigger: track,
      start: "top 70%",
      end: "bottom 45%",
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(fill, { scaleX: p, scaleY: p });
        nodes.forEach((n, i) => {
          const threshold = nodes.length === 1 ? 0 : i / (nodes.length - 1);
          n.classList.toggle("is-lit", p >= threshold - 0.02);
        });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <Section id={processContent.id} label={processContent.label} tone="panel">
      <h2 className="type-h2 max-w-3xl">{processContent.h2}</h2>

      <ol
        ref={trackRef}
        className="relative mt-20 flex flex-col gap-14 md:flex-row md:justify-between md:gap-4"
      >
        {/* connecting hairline + gradient fill */}
        <div
          aria-hidden
          className="absolute left-[27px] top-0 h-full w-px bg-line md:left-0 md:top-[27px] md:h-px md:w-full"
        >
          <div
            data-fill
            className="h-full w-full origin-top scale-y-0 md:origin-left md:scale-x-0 md:scale-y-100"
            style={{
              background:
                "linear-gradient(var(--pipeline-angle, 180deg), var(--teal-500), var(--blue-500), var(--copper-500))",
            }}
          />
        </div>

        {processContent.steps.map((step, i) => (
          <li
            key={step.label}
            data-node
            className="group relative flex items-center gap-5 md:w-36 md:flex-col md:gap-4 md:text-center"
          >
            <span
              className="z-10 flex size-14 shrink-0 items-center justify-center rounded-full border border-line bg-navy-900 text-secondary transition-[transform,border-color,color,box-shadow] duration-500 group-[.is-lit]:scale-[1.06] group-[.is-lit]:border-line-accent group-[.is-lit]:text-teal-300 group-[.is-lit]:shadow-glow-teal"
            >
              {ICONS[step.icon]}
            </span>
            <span className="flex flex-col gap-1 md:items-center">
              <span className="type-label text-tertiary">
                0{i + 1}
              </span>
              <span className="text-sm font-medium text-primary">
                {step.label}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
