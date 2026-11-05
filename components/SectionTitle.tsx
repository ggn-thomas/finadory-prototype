import type { CSSProperties, ReactNode } from "react";

// Serif section heading with an optional muted line underneath and actions on the right.
export function SectionTitle({
  title,
  subtitle,
  actions,
  style,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={style} className="animate-fade-up mt-12 mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
