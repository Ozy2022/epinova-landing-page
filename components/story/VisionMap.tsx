"use client";

import { useEffect, useRef } from "react";
import { gsap, initMotion, prefersReducedMotion } from "@/lib/motion";
import { vision } from "@/lib/content";

/* ------------------------------------------------------------------ */
/* Design space — equirectangular projection of the real KSA border    */
/* (x = (lon−34.5)·17 · y = (32.2−lat)·20), simplified to 22 vertices  */
/* ------------------------------------------------------------------ */

const VIEW = { x: -70, y: -40, w: 520, h: 420 };
const ORIGIN = { x: 207, y: 150 };

const KSA_POLY: ReadonlyArray<readonly [number, number]> = [
  [7, 56], [43, 14], [60, 2], [129, 22], [204, 62], [221, 74], [236, 73],
  [250, 92], [267, 118], [291, 153], [352, 190], [349, 244], [298, 264],
  [243, 284], [219, 298], [185, 298], [141, 316], [136, 306], [114, 272],
  [77, 214], [60, 164], [20, 97],
];

type Reach = "saudi" | "mena" | "global";

/** network arcs: Riyadh → Saudi cities → MENA → the edges of the frame */
const ARCS: ReadonlyArray<{
  c: readonly [number, number];
  e: readonly [number, number];
  reach: Reach;
  dur: number;
}> = [
  { c: [140, 200], e: [77, 214], reach: "saudi", dur: 2.4 }, // Jeddah
  { c: [240, 130], e: [263, 118], reach: "saudi", dur: 2.1 }, // Dammam
  { c: [110, 90], e: [32, 82], reach: "saudi", dur: 2.6 }, // NEOM
  { c: [80, 40], e: [-30, 48], reach: "mena", dur: 3.2 }, // Levant / Egypt
  { c: [330, 120], e: [428, 118], reach: "mena", dur: 3.4 }, // Gulf / Asia
  { c: [90, 290], e: [-40, 326], reach: "global", dur: 4.0 }, // Africa
  { c: [340, 40], e: [428, -8], reach: "global", dur: 4.2 }, // far east
];

/** dashed reach rings around Riyadh — Saudi, MENA, Global */
const RINGS = [60, 130, 200] as const;

const WAVE_MAX = 250;
const WAVE_PERIOD = 3.6; // seconds per pulse; two pulses run half a period apart

/* ------------------------------------------------------------------ */
/* Geometry helpers (all deterministic — safe to run at module scope)  */
/* ------------------------------------------------------------------ */

function inKsa(x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = KSA_POLY.length - 1; i < KSA_POLY.length; j = i++) {
    const [xi, yi] = KSA_POLY[i];
    const [xj, yj] = KSA_POLY[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** halftone fill: dot grid, base brightness falling off with distance */
const DOTS: ReadonlyArray<{ x: number; y: number; dist: number; base: number }> =
  (() => {
    const dots: Array<{ x: number; y: number; dist: number; base: number }> = [];
    for (let y = 6; y <= 316; y += 11) {
      for (let x = 6; x <= 354; x += 11) {
        if (!inKsa(x, y)) continue;
        const dist = Math.hypot(x - ORIGIN.x, y - ORIGIN.y);
        dots.push({ x, y, dist, base: Math.max(0.08, 0.34 - dist / 900) });
      }
    }
    return dots;
  })();

function qPoint(
  c: readonly [number, number],
  e: readonly [number, number],
  t: number,
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * ORIGIN.x + 2 * u * t * c[0] + t * t * e[0],
    y: u * u * ORIGIN.y + 2 * u * t * c[1] + t * t * e[1],
  };
}

/** cumulative outline segment lengths, for the partial border draw */
const OUTLINE_SEGS: ReadonlyArray<number> = (() => {
  const segs: number[] = [];
  for (let i = 0; i < KSA_POLY.length; i++) {
    const [x1, y1] = KSA_POLY[i];
    const [x2, y2] = KSA_POLY[(i + 1) % KSA_POLY.length];
    segs.push(Math.hypot(x2 - x1, y2 - y1));
  }
  return segs;
})();
const OUTLINE_LEN = OUTLINE_SEGS.reduce((a, b) => a + b, 0);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const backOut = (t: number) => {
  const c1 = 1.70158;
  const u = t - 1;
  return 1 + (c1 + 1) * u * u * u + c1 * u * u;
};

type Rgb = readonly [number, number, number];

/**
 * The Vision map as a live signal instrument, drawn on a 2D canvas:
 * pulse waves expand from Riyadh and ignite the halftone country as they
 * pass, reach rings sweep in radar-style, and data beads with comet
 * trails carry the signal along the network arcs, flashing each
 * destination node on arrival. Scroll builds the scene once; reduced
 * motion renders a single finished frame.
 */
export function VisionMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initMotion();
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // token colours, parsed once — no hexes live in this file
    const css = (token: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    const rgb = (token: string): Rgb => {
      const h = css(token);
      return [
        parseInt(h.slice(1, 3), 16),
        parseInt(h.slice(3, 5), 16),
        parseInt(h.slice(5, 7), 16),
      ];
    };
    const col = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const TEAL_600 = rgb("--teal-600");
    const TEAL_500 = rgb("--teal-500");
    const TEAL_400 = rgb("--teal-400");
    const COPPER_500 = rgb("--copper-500");
    const COPPER_400 = rgb("--copper-400");
    const INK = rgb("--light-text");

    const state = { intro: reduced ? 1 : 0 };
    let scale = 1;

    const resize = () => {
      const w = wrap.clientWidth;
      const h = (w * VIEW.h) / VIEW.w;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      scale = (w * dpr) / VIEW.w;
      if (reduced) draw(0.75); // waves parked mid-expansion
    };

    /** progress through an intro phase [a, b] */
    const ph = (a: number, b: number) => clamp01((state.intro - a) / (b - a));

    const partialOutline = (progress: number) => {
      g.beginPath();
      g.moveTo(KSA_POLY[0][0], KSA_POLY[0][1]);
      let remaining = OUTLINE_LEN * progress;
      for (let i = 0; i < KSA_POLY.length && remaining > 0; i++) {
        const [x1, y1] = KSA_POLY[i];
        const [x2, y2] = KSA_POLY[(i + 1) % KSA_POLY.length];
        const seg = OUTLINE_SEGS[i];
        if (remaining >= seg) {
          g.lineTo(x2, y2);
          remaining -= seg;
        } else {
          const t = remaining / seg;
          g.lineTo(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
          remaining = 0;
        }
      }
      g.stroke();
    };

    const draw = (t: number) => {
      g.setTransform(scale, 0, 0, scale, -VIEW.x * scale, -VIEW.y * scale);
      g.clearRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
      g.lineCap = "round";

      // two pulse waves expanding from Riyadh, half a period apart
      const waves: number[] = [];
      const waveOn = ph(0.55, 0.7);
      for (const off of [0, WAVE_PERIOD / 2]) {
        const p = ((t + off) % WAVE_PERIOD) / WAVE_PERIOD;
        waves.push(p * WAVE_MAX);
      }

      // halftone country — dots ignite as a wavefront crosses them
      for (const dot of DOTS) {
        const vis = ph(0.12 + (dot.dist / 260) * 0.3, 0.22 + (dot.dist / 260) * 0.3);
        if (vis <= 0) continue;
        let boost = 0;
        if (waveOn > 0) {
          for (const r of waves) {
            const d = Math.abs(dot.dist - r);
            if (d < 30) {
              boost = Math.max(
                boost,
                Math.exp(-(d * d) / 220) * (1 - r / (WAVE_MAX + 40)) * waveOn,
              );
            }
          }
        }
        const a = (dot.base + boost * 0.55) * vis;
        const rr = 1.5 + boost * 1.1;
        g.beginPath();
        g.arc(dot.x, dot.y, rr, 0, Math.PI * 2);
        g.fillStyle = boost > 0.05 ? col(TEAL_400, a) : col(TEAL_600, a);
        g.fill();
      }

      // country border draws itself in
      const op = ph(0, 0.3);
      if (op > 0) {
        g.strokeStyle = col(INK, 0.25);
        g.lineWidth = 1.5;
        partialOutline(op);
      }

      // reach rings sweep in radar-style, then breathe with the waves
      RINGS.forEach((r, i) => {
        const rp = ph(0.4 + i * 0.07, 0.62 + i * 0.07);
        if (rp <= 0) return;
        g.beginPath();
        g.setLineDash([2, 6]);
        g.arc(ORIGIN.x, ORIGIN.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rp);
        g.strokeStyle = col(INK, 0.12);
        g.lineWidth = 1;
        g.stroke();
        g.setLineDash([]);
      });

      // the expanding wavefronts themselves
      if (waveOn > 0) {
        for (const r of waves) {
          const a = 0.3 * (1 - r / WAVE_MAX) * waveOn;
          if (a <= 0.01 || r < 6) continue;
          g.beginPath();
          g.arc(ORIGIN.x, ORIGIN.y, r, 0, Math.PI * 2);
          g.strokeStyle = col(TEAL_500, a);
          g.lineWidth = 1.5;
          g.stroke();
        }
      }

      // network arcs draw out from Riyadh
      ARCS.forEach((arc, i) => {
        const ap = ph(0.45 + i * 0.04, 0.7 + i * 0.04);
        if (ap <= 0) return;
        g.beginPath();
        g.moveTo(ORIGIN.x, ORIGIN.y);
        if (ap >= 1) {
          if (arc.reach === "global") g.setLineDash([3, 5]);
          g.quadraticCurveTo(arc.c[0], arc.c[1], arc.e[0], arc.e[1]);
        } else {
          // draw the partial curve by sampling
          for (let s = 1; s <= 24; s++) {
            const p = qPoint(arc.c, arc.e, (s / 24) * ap);
            g.lineTo(p.x, p.y);
          }
        }
        g.strokeStyle =
          arc.reach === "saudi" ? col(TEAL_600, 0.8) : col(TEAL_500, 0.55);
        g.lineWidth = arc.reach === "saudi" ? 1.5 : arc.reach === "mena" ? 1.2 : 1;
        g.stroke();
        g.setLineDash([]);
      });

      // data beads with comet trails; destinations flash on arrival
      const beadsOn = ph(0.82, 1);
      ARCS.forEach((arc, i) => {
        const nodeCol = arc.reach === "global" ? COPPER_500 : TEAL_500;
        const beadCol = arc.reach === "global" ? COPPER_400 : TEAL_500;
        const np = ph(0.66 + i * 0.03, 0.8 + i * 0.03);
        let arrive = 0;

        if (beadsOn > 0 && !reduced) {
          const bt = ((t + i * 0.9) % arc.dur) / arc.dur;
          const eased = bt * bt * (3 - 2 * bt); // smoothstep pacing
          for (let k = 0; k < 6; k++) {
            const tt = eased - k * 0.022;
            if (tt <= 0 || tt > 1) continue;
            const p = qPoint(arc.c, arc.e, tt);
            const a = beadsOn * (0.85 - k * 0.13) * Math.min(1, eased * 8);
            g.beginPath();
            g.arc(p.x, p.y, Math.max(0.6, 2 - k * 0.25), 0, Math.PI * 2);
            g.fillStyle = col(beadCol, a);
            g.fill();
          }
          arrive = clamp01((eased - 0.88) / 0.12);
        }

        // endpoint node — pop in, then halo on each bead arrival
        if (np > 0) {
          const pop = backOut(np);
          if (arc.reach !== "saudi") {
            g.beginPath();
            g.arc(arc.e[0], arc.e[1], 6.5 * pop, 0, Math.PI * 2);
            g.strokeStyle = col(nodeCol, 0.4 * np);
            g.lineWidth = 1;
            g.stroke();
          }
          if (arrive > 0) {
            g.beginPath();
            g.arc(arc.e[0], arc.e[1], 6 + 7 * arrive, 0, Math.PI * 2);
            g.strokeStyle = col(nodeCol, 0.5 * (1 - arrive));
            g.lineWidth = 1.5;
            g.stroke();
          }
          g.beginPath();
          g.arc(arc.e[0], arc.e[1], 3 * pop + arrive, 0, Math.PI * 2);
          g.fillStyle = col(arc.reach === "saudi" ? TEAL_600 : nodeCol, np);
          g.fill();
        }
      });

      // Riyadh — breathing glow + core
      const rp = ph(0.3, 0.45);
      if (rp > 0) {
        const breathe = reduced ? 0 : Math.sin(t * 1.6) * 3;
        const glowR = (30 + breathe) * rp;
        const grad = g.createRadialGradient(
          ORIGIN.x, ORIGIN.y, 0,
          ORIGIN.x, ORIGIN.y, glowR,
        );
        grad.addColorStop(0, col(TEAL_400, 0.32 * rp));
        grad.addColorStop(1, col(TEAL_400, 0));
        g.beginPath();
        g.arc(ORIGIN.x, ORIGIN.y, glowR, 0, Math.PI * 2);
        g.fillStyle = grad;
        g.fill();

        g.beginPath();
        g.arc(ORIGIN.x, ORIGIN.y, 5 * backOut(rp), 0, Math.PI * 2);
        g.fillStyle = col(TEAL_600, 1);
        g.fill();
        g.beginPath();
        g.arc(ORIGIN.x, ORIGIN.y, 9, 0, Math.PI * 2);
        g.strokeStyle = col(TEAL_500, 0.5 * rp);
        g.lineWidth = 1.5;
        g.stroke();
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    if (reduced) {
      return () => ro.disconnect();
    }

    // scroll builds the scene once, then the instrument runs on its own
    const ctx = gsap.context(() => {
      gsap.to(state, {
        intro: 1,
        duration: 3,
        ease: "power2.out",
        scrollTrigger: { trigger: wrap, start: "top 72%", once: true },
      });
    }, wrap);

    // rAF loop with rect-poll visibility gating (IO misreports in some
    // WebKit scroll states — same approach as the other canvases here)
    let raf = 0;
    let visible = true;
    let lastVis = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastVis > 300) {
        lastVis = now;
        const r = wrap.getBoundingClientRect();
        visible = r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
      }
      if (!visible) return;
      draw(now / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl">
      <canvas
        ref={canvasRef}
        className="block aspect-[520/420] h-auto w-full"
        role="img"
        aria-label="Signal pulses spreading from Riyadh across Saudi Arabia, the MENA region and the world"
      />
      {/* Riyadh label — DOM text stays crisp at every canvas scale */}
      <span
        aria-hidden
        className="type-label pointer-events-none absolute left-[55.5%] top-[48.5%] text-light-text/55"
      >
        {vision.mapOrigin}
      </span>
    </div>
  );
}
