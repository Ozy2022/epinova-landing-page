"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

export interface VideoBackdropProps {
  src: string;
  poster: string;
  /** extra classes on the wrapper (opacity, blend, etc.) */
  className?: string;
}

/**
 * Dimmed ambient video texture (founder-generated DNA loop). Muted, looped,
 * playsInline; playback runs only while the section is on screen and the
 * tab is visible. Reduced motion (or a playback failure) renders the still
 * poster instead. Decorative only — always aria-hidden.
 */
export function VideoBackdrop({ src, poster, className }: VideoBackdropProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    let visible = false;
    const sync = () => {
      if (visible && !document.hidden) {
        video.play().catch(() => setReduced(true));
      } else {
        video.pause();
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative full-bleed still; next/image adds nothing here
        <img
          src={poster}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      )}
      {/* keep the scene edges dark so the texture never competes with copy */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-transparent to-navy-950" />
    </div>
  );
}
