import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ParticleIntro } from "@/components/story/ParticleIntro";
import { Fusion } from "@/components/story/Fusion";
import { DataFlow } from "@/components/story/DataFlow";
import { SaudiVision } from "@/components/story/SaudiVision";
import { Roadmap } from "@/components/story/Roadmap";
import { Contact } from "@/components/sections/Contact";
import { MotionDebug } from "@/components/dev/MotionDebug";

/**
 * One page, one story (v2 brief): the logo disassembles → scroll
 * convergence → Biology × Intelligence fusion → the data flow →
 * Saudi biotechnology (light) → the road ahead → closing + contact.
 * Page arc: deep navy → deep teal → off-white → deep navy.
 */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />

      <main>
        <ParticleIntro />
        <Fusion />
        <DataFlow />
        <SaudiVision />
        <Roadmap />
        <Contact />
      </main>

      <Footer />
      <MotionDebug />
    </>
  );
}
