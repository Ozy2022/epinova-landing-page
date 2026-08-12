import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollStrand } from "@/components/layout/ScrollStrand";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Helix } from "@/components/brand/Helix";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Button } from "@/components/ui/Button";
import { Aurora } from "@/components/bits/Aurora";
import { Challenge } from "@/components/sections/Challenge";
import { Process } from "@/components/sections/Process";
import { Science } from "@/components/sections/Science";
import { Platform } from "@/components/sections/Platform";
import { Vision } from "@/components/sections/Vision";
import { Serve } from "@/components/sections/Serve";
import { Journey } from "@/components/sections/Journey";
import { Contact } from "@/components/sections/Contact";
import { hero } from "@/lib/content";

/** One page, nine sections — the whole story in a single scroll (CLAUDE.md §1). */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <ScrollStrand />
      <Header />

      <main>
        {/* 01 HERO — centred per the founder's layout, aurora behind */}
        <section
          id="hero"
          data-strand-node
          className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24 text-center"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[62vh] opacity-55"
          >
            <Aurora
              stops={["--teal-500", "--blue-600", "--copper-500"]}
              amplitude={1.0}
              blend={0.55}
            />
          </div>

          <div className="relative flex flex-col items-center">
            <Helix className="w-36 sm:w-44 md:w-52" />
            <MonoLabel text={hero.label} className="mb-6 mt-12" />
            <h1 className="type-display-xl">
              {hero.h1.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="type-body-lg mt-6 max-w-2xl text-secondary">
              {hero.sub}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {hero.ctas.map((cta) => (
                <Button key={cta.label} href={cta.href} variant={cta.variant}>
                  {cta.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <Challenge />
        <Process />
        <Science />
        <Platform />
        <Vision />
        <Serve />
        <Journey />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
