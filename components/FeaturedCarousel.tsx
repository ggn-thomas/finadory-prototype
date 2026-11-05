"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { stagger } from "@/lib/motion";
import { SectionTitle } from "./SectionTitle";

export type FeaturedItem = {
  id: string;
  companyName: string;
  title: string;
};

const INTERVAL_MS = 6000;
const arrow = "flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-text hover:bg-line";

// One brief: company panel on the left, the brief title on the right, linking to the full brief.
function Slide({ item }: { item: FeaturedItem }) {
  return (
    <Link
      href={`/briefs/${encodeURIComponent(item.id)}`}
      className="animate-fade-up group grid min-h-56 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      <div className="flex items-center justify-center bg-[#f7f7f5] px-8 py-10">
        <span className="line-clamp-3 text-center font-serif text-3xl font-semibold text-[#141414]">
          {item.companyName}
        </span>
      </div>
      <div className="flex items-center p-6 sm:p-10">
        <h3 className="line-clamp-4 font-serif text-2xl leading-snug group-hover:underline sm:text-3xl">{item.title}</h3>
      </div>
    </Link>
  );
}

// Auto-advancing "Brief" carousel; pauses on hover/focus and when reduced motion is requested.
export function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (step: number) => setIndex((current) => (current + step + items.length) % items.length);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reducedMotion || items.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, items.length]);

  if (items.length === 0) return null;
  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Brief"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <SectionTitle
        title="Brief"
        subtitle="Les brèves des publications qui sortent du lot, chiffres vérifiés dans le document source."
        style={stagger(4)}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {index + 1} / {items.length}
            </span>
            <button type="button" aria-label="Précédente" className={arrow} onClick={() => go(-1)}>
              ←
            </button>
            <button type="button" aria-label="Suivante" className={arrow} onClick={() => go(1)}>
              →
            </button>
          </div>
        }
      />
      <div style={stagger(5)} className="animate-fade-up border border-line">
        <Slide key={items[index].id} item={items[index]} />
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Afficher la brève ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-1.5 bg-line"}`}
          />
        ))}
      </div>
    </section>
  );
}
