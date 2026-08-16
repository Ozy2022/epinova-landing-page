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

interface NetworkHint {
  saveData?: boolean;
  effectiveType?: string;
}
interface NavigatorWithHints extends Navigator {
  connection?: NetworkHint;
  deviceMemory?: number;
}

/**
 * The helix clip IS "the DNA" to visitors, so it plays everywhere —
 * phones included (founder decision; the earlier phones-get-a-poster
 * optimisation read as the animation being broken). Muted 720p H.264 is
 * hardware-decoded, so the real cost is bandwidth: only data-saver mode
 * and 2g connections get the still.
 */
function shouldPlayVideo(): boolean {
  if (prefersReducedMotion()) return false; // FORCE_MOTION makes this false
  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return false;
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) {
    return false;
  }
  return true;
}

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
  /** starts true so SSR and phones render the cheap still, never the video */
  const [still, setStill] = useState(true);

  useEffect(() => {
    if (!shouldPlayVideo()) return;
    setStill(false);
  }, []);

  useEffect(() => {
    if (still) return;
    const wrap = wrapRef.current;
    const a = aRef.current;
    const b = bRef.current;
    if (!wrap || !a || !b) return;

    let active = a;
    let standby = b;
    let swapTimer: ReturnType<typeof setTimeout> | undefined;
    let retriedAfterGesture = false;

    // Visibility via rect polling, not IntersectionObserver — WebKit
    // misreports IO for content inside position:sticky (this wrapper lives
    // inside the Fusion sticky scene), which would freeze/never-start the
    // clip in Safari. One rect read every 300ms is negligible.
    const isOnScreen = () => {
      const r = wrap.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    };
    let visible = isOnScreen();

    // iOS Low Power Mode rejects autoplay until the user touches the page.
    // First rejection: arm a one-shot retry on the next gesture. Only a
    // second rejection falls back to the still poster.
    const fail = () => {
      if (retriedAfterGesture) {
        setStill(true);
        return;
      }
      retriedAfterGesture = true;
      const retry = () => {
        window.removeEventListener("touchend", retry);
        window.removeEventListener("pointerdown", retry);
        sync();
      };
      window.addEventListener("touchend", retry, { once: true, passive: true });
      window.addEventListener("pointerdown", retry, { once: true, passive: true });
    };

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
    const poll = setInterval(() => {
      const v = isOnScreen();
      if (v !== visible) {
        visible = v;
        sync();
      }
    }, 300);

    a.addEventListener("timeupdate", onTime);
    b.addEventListener("timeupdate", onTime);
    sync();
    document.addEventListener("visibilitychange", sync);

    return () => {
      clearTimeout(swapTimer);
      clearInterval(poll);
      a.removeEventListener("timeupdate", onTime);
      b.removeEventListener("timeupdate", onTime);
      document.removeEventListener("visibilitychange", sync);
      a.pause();
      b.pause();
    };
  }, [still]);

  const videoClass =
    "absolute inset-0 h-full w-full object-cover transition-opacity ease-linear duration-1000";

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {still ? (
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
