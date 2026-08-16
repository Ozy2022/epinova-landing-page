export interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Understated CTA with a small → (CLAUDE.md §4). 44px min touch target,
 * visible focus ring, 200ms transitions on transform/color only.
 */
export function Button({
  href,
  children,
  variant = "solid",
  className,
  onClick,
}: ButtonProps) {
  const base =
    "group inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3 text-sm font-medium " +
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 " +
    "hover:-translate-y-0.5 rounded";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    solid:
      "bg-teal-500 text-navy-950 hover:bg-teal-400 hover:shadow-glow-teal",
    outline:
      "border border-line-strong text-primary hover:border-teal-500 hover:text-teal-300",
  };

  return (
    <a
      href={href}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </a>
  );
}
