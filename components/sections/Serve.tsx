import {
  Buildings,
  Flask,
  Pulse,
  Bank,
} from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { serve, type ServeTile } from "@/lib/content";

const ICONS: Record<ServeTile["icon"], React.ReactNode> = {
  hospital: <Buildings size={30} weight="light" />,
  research: <Flask size={30} weight="light" />,
  system: <Pulse size={30} weight="light" />,
  government: <Bank size={30} weight="light" />,
};

/** 07 — WHO WE SERVE: four icon tiles in a bordered grid, one line each. */
export function Serve() {
  return (
    <Section id={serve.id} label={serve.label}>
      <Reveal>
        <h2 className="type-h2 max-w-3xl">{serve.h2}</h2>
      </Reveal>

      <Reveal className="mt-14 grid grid-cols-1 border border-line sm:grid-cols-2 lg:grid-cols-4">
        {serve.tiles.map((tile) => (
          <div
            key={tile.title}
            className="border-t border-line p-8 first:border-t-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(even)]:border-l lg:border-t-0 lg:border-l lg:first:border-l-0"
          >
            <span className="text-teal-400">{ICONS[tile.icon]}</span>
            <h3 className="mt-5 font-display text-lg font-medium text-primary">
              {tile.title}
            </h3>
            <p className="mt-2 text-sm text-secondary">{tile.body}</p>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
