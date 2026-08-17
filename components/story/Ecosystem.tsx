import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ecosystem } from "@/lib/content";

/**
 * Compact strip after the roadmap (founder): a small "Built for the
 * Healthcare Ecosystem" label and three big words — deliberately not a
 * full section, no explanations.
 */
export function Ecosystem() {
  return (
    <section id={ecosystem.id} className="border-t border-line">
      <Container className="py-20 md:py-28">
        <Reveal className="flex flex-col items-center gap-10 text-center">
          <p className="type-label text-tertiary">
            <span aria-hidden className="text-teal-500">
              •
            </span>{" "}
            {ecosystem.title}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:gap-x-10">
            {ecosystem.items.map((item, i) => (
              <li key={item} className="flex items-center gap-6 md:gap-10">
                {i > 0 ? (
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-teal-500"
                  />
                ) : null}
                <span className="font-display text-[clamp(1.6rem,3.4vw,2.75rem)] font-bold tracking-tight text-primary">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
