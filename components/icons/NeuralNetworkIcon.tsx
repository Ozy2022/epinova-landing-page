export interface NeuralNetworkIconProps {
  size?: number;
  className?: string;
}

/**
 * Hairline neural-network node icon, 1.5px stroke matching Phosphor Light.
 * Stands in for the Bioicons `neural-network-1` pick with a consistent
 * interface-icon weight.
 */
export function NeuralNetworkIcon({ size = 32, className }: NeuralNetworkIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle cx="6" cy="16" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="7" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="25" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="16" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.4 14.4 13.7 9.3M8.4 17.6l5.3 5.1M18.4 8.6l5.2 5.2M18.4 23.4l5.2-5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
