export interface ContainerProps {
  children: React.ReactNode;
  /** 1440px wide variant for wide sections; default 1200px */
  wide?: boolean;
  className?: string;
}

export function Container({ children, wide = false, className }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full ${wide ? "max-w-360" : "max-w-300"} px-6 md:px-10 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
