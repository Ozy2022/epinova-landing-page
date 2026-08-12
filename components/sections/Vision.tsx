import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { vision } from "@/lib/content";

/**
 * 06 — SAUDI BIOTECH VISION ⭐ — the one light-theme inversion. Numbered
 * items with hairline dividers, the word ladder revealing in sequence, and
 * the quiet "Aligned with" footnote. No government logos (CLAUDE.md §11).
 */
export function Vision() {
  return (
    <Section id={vision.id} label={vision.label} tone="light">
      <Reveal>
        <h2 className="type-h2 max-w-2xl">{vision.h2}</h2>
        <p className="type-body-lg mt-6 max-w-2xl text-light-text/70">
          {vision.intro}
        </p>
      </Reveal>

      <Reveal className="mt-16 border-t border-light-text/10">
        {vision.items.map((item) => (
          <div
            key={item.index}
            className="grid grid-cols-1 gap-2 border-b border-light-text/10 py-8 md:grid-cols-12 md:gap-8"
          >
            <span className="type-label text-teal-600 md:col-span-2">
              {item.index}
            </span>
            <h3 className="type-h3 md:col-span-4">{item.title}</h3>
            <p className="text-sm text-light-text/70 md:col-span-6 md:self-center">
              {item.body}
            </p>
          </div>
        ))}
      </Reveal>

      {/* word ladder */}
      <Reveal
        stagger={0.14}
        className="mt-20 flex flex-wrap items-center gap-x-4 gap-y-3"
      >
        {vision.ladder.map((word, i) => (
          <span key={word} className="flex items-center gap-4">
            <span className="type-h3 font-display font-bold text-light-text">
              {word}
            </span>
            {i < vision.ladder.length - 1 && (
              <span aria-hidden className="text-teal-600">
                →
              </span>
            )}
          </span>
        ))}
      </Reveal>

      <Reveal>
        <p className="type-body-lg mt-12 max-w-2xl text-light-text/80">
          {vision.close}
        </p>
        <p className="type-label mt-10 text-light-text/45">{vision.footnote}</p>
      </Reveal>
    </Section>
  );
}
