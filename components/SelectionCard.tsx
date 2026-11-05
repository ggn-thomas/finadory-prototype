import type { CSSProperties } from "react";
import { formatParis } from "@/lib/dates";
import type { Candidate } from "@/lib/selection";

const chip = "inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-xs text-muted";

// A selected publication: rank and company panel, then title, source link and the reasons it was kept.
export function SelectionCard({ candidate, rank, style }: { candidate: Candidate; rank: number; style?: CSSProperties }) {
  return (
    <article style={style} className="animate-fade-up grid border border-line sm:grid-cols-[240px_1fr]">
      <div className="relative flex min-h-32 items-center justify-center bg-[#f7f7f5] px-6 py-8">
        <span className="absolute top-3 left-3 font-serif text-sm text-[#858b96]">#{rank}</span>
        <span className="line-clamp-3 text-center font-serif text-xl font-semibold text-[#141414]">
          {candidate.company_name}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <p className="text-xs text-muted">
          {formatParis(candidate.published_at)} · {candidate.subtype}
        </p>
        <h2 className="text-lg leading-snug">{candidate.title}</h2>
        <a href={candidate.url} target="_blank" rel="noreferrer" className="w-fit text-sm text-muted hover:text-text">
          Document source ({(candidate.file_ext ?? "doc").toUpperCase()}) ↗
        </a>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-xs text-muted">Retenue parce que :</span>
          {candidate.score_reasons.map((reason) => (
            <span key={reason} className={chip}>
              {reason}
            </span>
          ))}
          <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-bg">
            Score {candidate.score}
          </span>
        </div>
      </div>
    </article>
  );
}
