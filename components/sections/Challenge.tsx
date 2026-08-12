import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { challenge } from "@/lib/content";

/** 02 — THE CHALLENGE: hairline grid cells + count-up stats + citation. */
export function Challenge() {
  return (
    <Section id={challenge.id} label={challenge.label}>
      <Reveal>
        <h2 className="type-h2 max-w-3xl">{challenge.h2}</h2>
      </Reveal>

      {/* three grid cells — bordered grid, not floating cards */}
      <Reveal className="mt-14 grid grid-cols-1 divide-y divide-line border border-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {challenge.cells.map((cell) => (
          <div key={cell.title} className="p-8">
            <h3 className="type-h3">{cell.title}</h3>
            <p className="mt-3 text-sm text-secondary">{cell.body}</p>
          </div>
        ))}
      </Reveal>

      {/* count-up stats, tabular mono */}
      <Reveal className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        {challenge.stats.map((stat) => (
          <div key={stat.caption}>
            <CountUp
              value={stat.number}
              suffix={stat.suffix}
              decimals={Number.isInteger(stat.number) ? 0 : 1}
              className="type-stat text-teal-400"
            />
            <p className="mt-3 max-w-[16ch] text-sm text-secondary">
              {stat.caption}
            </p>
          </div>
        ))}
      </Reveal>

      {/* citation — the credibility multiplier */}
      <p className="type-label mt-16 max-w-3xl normal-case tracking-normal text-tertiary">
        {challenge.citation.text}{" "}
        <a
          href={challenge.citation.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line-strong underline-offset-2 transition-colors duration-200 hover:text-secondary"
        >
          doi:{challenge.citation.doi}
        </a>
      </p>
    </Section>
  );
}
