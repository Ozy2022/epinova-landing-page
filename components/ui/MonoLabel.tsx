export interface MonoLabelProps {
  text: string;
  className?: string;
  /** light sections need the dark text colour */
  onLight?: boolean;
}

/** Tiny uppercase mono label with bullet marker: `• 01 — THE CHALLENGE`. */
export function MonoLabel({ text, className, onLight = false }: MonoLabelProps) {
  return (
    <p
      className={`type-label ${onLight ? "text-light-text/60" : "text-tertiary"} ${className ?? ""}`}
    >
      <span aria-hidden className={onLight ? "text-teal-600" : "text-teal-500"}>
        •
      </span>{" "}
      {text}
    </p>
  );
}
