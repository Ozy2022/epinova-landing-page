import { Container } from "@/components/layout/Container";
import { MonoLabel } from "@/components/ui/MonoLabel";

export interface SectionProps {
  id: string;
  label?: string;
  /** dark = body navy-950 (default) · panel = navy-900 · light = §06 inversion */
  tone?: "dark" | "panel" | "light";
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Owns section padding, max-width, the hairline top border and the strand
 * node hook (data-strand-node) — sections never set their own padding
 * (CLAUDE.md §12).
 */
export function Section({
  id,
  label,
  tone = "dark",
  wide = false,
  className,
  children,
}: SectionProps) {
  const tones: Record<NonNullable<SectionProps["tone"]>, string> = {
    dark: "border-t border-line",
    panel: "border-t border-line bg-navy-900",
    light: "bg-light-bg text-light-text",
  };

  return (
    <section
      id={id}
      data-strand-node
      className={`relative scroll-mt-16 ${tones[tone]} ${className ?? ""}`}
    >
      <Container wide={wide} className="section-pad">
        {label ? (
          <MonoLabel text={label} onLight={tone === "light"} className="mb-6" />
        ) : null}
        {children}
      </Container>
    </section>
  );
}
