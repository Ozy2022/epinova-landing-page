"use client";

import { useEffect, useState } from "react";

/**
 * Remote-diagnosis overlay. Renders nothing unless the URL contains
 * `?motion-debug`. Reports the exact conditions that decide whether the
 * particle story animates on THIS device — including the OS-level
 * reduced-motion setting, which silently switches the site to its static
 * variant by design.
 */
export function MotionDebug() {
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!window.location.search.includes("motion-debug")) return;

    const canvasHash = (): number | null => {
      const c = document.querySelector<HTMLCanvasElement>("#hero canvas");
      if (!c) return null;
      try {
        const g = c.getContext("2d");
        if (!g || c.width === 0) return -1;
        const w = Math.min(c.width, 240);
        const h = Math.min(c.height, 240);
        const d = g.getImageData(0, 0, w, h).data;
        let hash = 0;
        for (let i = 3; i < d.length; i += 4 * 17) hash = (hash * 31 + d[i]) | 0;
        return hash;
      } catch {
        return -2;
      }
    };

    let last = canvasHash();
    let changes = 0;
    let ticks = 0;
    const iv = setInterval(() => {
      const h = canvasHash();
      ticks += 1;
      if (h !== last) changes += 1;
      last = h;

      const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = matchMedia("(pointer: coarse)").matches;
      const canvas = document.querySelector("#hero canvas");
      setInfo(
        [
          `reduced-motion: ${rm ? "ON — site renders STATIC by design" : "off"}`,
          `pointer: ${coarse ? "coarse (phone/tablet)" : "fine (mouse)"}`,
          `viewport: ${innerWidth}x${innerHeight} @${devicePixelRatio}x`,
          `hero canvas: ${canvas ? "mounted" : "NOT MOUNTED"}`,
          `canvas repainting: ${changes}/${ticks} checks`,
          `videos mounted: ${document.querySelectorAll("video").length}`,
          `build: v-motion-3`,
        ].join("\n"),
      );
    }, 700);

    return () => clearInterval(iv);
  }, []);

  if (!info) return null;
  return (
    <pre className="fixed bottom-2 left-2 z-[999] max-w-[92vw] whitespace-pre-wrap rounded border border-teal-500 bg-navy-950/95 p-3 font-mono text-[11px] leading-relaxed text-teal-300">
      {info}
    </pre>
  );
}
