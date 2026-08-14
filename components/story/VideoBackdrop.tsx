"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

export interface VideoBackdropProps {
  src: string;
  poster: string;
  /** extra classes on the wrapper (opacity, blend, etc.) */
  className?: string;
}

/** seconds of overlap used to dissolve the loop seam away */
const CROSSFADE = 1.1;

/**
 * Dimmed ambient video texture (founder-generated DNA loop). The clip's
 * first and last frames don't match, so a single looping <video> would
 * visibly jump — instead two stacked copies alternate: shortly before one
 * ends, the other restarts from zero and dissolves in over it.
 *
 * Muted, playsInline; playback runs only while the section is on screen
 * and the tab is visible. Reduced motion (or playback failure) renders
 * the still poster. Decorative only — always aria-hidden.
 */
export function VideoBackdrop({ src, poster, className }: VideoBackdropProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }
    const wrap = wrapRef.current;
    const a = aRef.current;
    const b = bRef.current;
    if (!wrap || !a || !b) return;

    let active = a;
    let standby = b;
    let visible = false;
    let swapTimer: ReturnType<typeof setTimeout> | undefined;

    const fail = () => setReduced(true);

    // crossfade: when the active copy nears its end, dissolve in the standby
    const onTime = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      if (v !== active || !visible) return;
      if (!v.duration || v.currentTime < v.duration - CROSSFADE) return;
      if (!standby.paused) return; // swap already in flight

      standby.currentTime = 0;
      standby.play().catch(fail);
      standby.style.opacity = "1";
      active.style.opacity = "0";
      const retiring = active;
      active = standby;
      standby = retiring;
      swapTimer = setTimeout(() => retiring.pause(), CROSSFADE * 1000);
    };

    const sync = () => {
      if (visible && !document.hidden) {
        active.play().catch(fail);
      } else {
        a.pause();
        b.pause();
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });

    a.addEventListener("timeupdate", onTime);
    b.addEventListener("timeupdate", onTime);
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);

    return () => {
      clearTimeout(swapTimer);
      a.removeEventListener("timeupdate", onTime);
      b.removeEventListener("timeupdate", onTime);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      a.pause();
      b.pause();
    };
  }, []);

  const videoClass =
    "absolute inset-0 h-full w-full object-cover transition-opacity ease-linear duration-1000";

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
        <>
          <video
            ref={aRef}
            src={src}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            className={videoClass}
          />
          <video
            ref={bRef}
            src={src}
            muted
            playsInline
            preload="metadata"
            style={{ opacity: 0 }}
            className={videoClass}
          />
        </>
      )}
      {/* keep the scene edges dark so the texture never competes with copy */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-transparent to-navy-950" />
    </div>
  );
}
