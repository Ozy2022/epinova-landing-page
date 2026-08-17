import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { VisionMap } from "@/components/story/VisionMap";
import { vision } from "@/lib/content";

/**
 * Act 5 — Building Saudi Biotechnology. The one light section: the
 * signal-instrument map (canvas) beside three text-only pillars.
 */
export function SaudiVision() {
  return (
    <Section id={vision.id} label={vision.label} tone="light">
      <Reveal>
        <h2 className="type-h2 max-w-3xl">{vision.h2}</h2>
        <p className="type-body-lg mt-4 text-light-text/65">{vision.sub}</p>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
        {/* the map — 7 columns, off-balance split */}
        <div className="lg:col-span-7">
          <VisionMap />
          <p className="type-label mt-6 text-light-text/50">
            {vision.mapCaption}
          </p>
        </div>

        {/* pillars — 5 columns, text only, hairline dividers */}
        <Reveal className="lg:col-span-5 lg:self-center">
          {vision.pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className={`py-8 ${i > 0 ? "border-t border-light-text/10" : ""}`}
            >
              <h3 className="font-display text-xl font-bold tracking-tight">
                {pillar.title}
              </h3>
              <p className="mt-2 text-light-text/70">{pillar.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
