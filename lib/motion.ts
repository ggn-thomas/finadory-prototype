import type { CSSProperties } from "react";

const MAX_STAGGERED = 12;

// Inline delay for the fade-up entrance; items past MAX_STAGGERED share the last delay.
export function stagger(index: number, baseMs = 0, stepMs = 60): CSSProperties {
  return { animationDelay: `${baseMs + Math.min(index, MAX_STAGGERED) * stepMs}ms` };
}
