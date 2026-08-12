export interface MethylationIconProps {
  size?: number;
  className?: string;
}

/**
 * Custom hairline methylation icon (CLAUDE.md §10 — Bioicons has none):
 * a cytosine ring with a CH₃ group docking onto it. 1.5px stroke to match
 * Phosphor Light. Proprietary brand asset.
 */
export function MethylationIcon({ size = 32, className }: MethylationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* pyrimidine ring */}
      <path
        d="M10 9.5 16 6l6 3.5v7L16 20l-6-3.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* methyl group docking */}
      <circle cx="24.5" cy="24.5" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20.5 20.5 22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* backbone tick */}
      <path d="M6 26.5 10 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="13" r="1.25" fill="currentColor" />
    </svg>
  );
}
