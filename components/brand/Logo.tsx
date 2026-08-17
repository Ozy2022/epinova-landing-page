import Image from "next/image";
import { header } from "@/lib/content";

export interface LogoProps {
  /** mark height in px (header lockup uses 32) */
  size?: number;
  className?: string;
}

/**
 * Header lockup: official helix mark + "EPINOVA" set live in Cabinet Grotesk.
 * The raster wordmark is navy and fails contrast on dark surfaces, so the
 * name is typeset in --text-primary instead (CLAUDE.md §10).
 */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={Math.round(size * (389 / 583))}
        height={size}
        priority
      />
      <span
        className="font-display text-[17px] font-bold tracking-[0.02em] text-primary"
        translate="no"
      >
        {header.brand}
      </span>
    </span>
  );
}
