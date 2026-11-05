import { formatParis } from "@/lib/dates";
import { stagger } from "@/lib/motion";
import type { ListedPublication } from "@/lib/publications";

const chip = "inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-xs text-muted";

// One publication: company "logotype" panel, then date, title and chips on a transparent background.
function PublicationCard({ publication, index }: { publication: ListedPublication; index: number }) {
  return (
    <a
      href={publication.url}
      target="_blank"
      rel="noreferrer"
      style={stagger(index, 360, 40)}
      className="animate-fade-up group flex flex-col border border-line transition-colors hover:border-muted"
    >
      <div className="flex aspect-[16/9] items-center justify-center bg-[#f7f7f5] px-6">
        <span className="line-clamp-2 text-center font-serif text-2xl font-semibold text-[#141414]">
          {publication.company_name}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs text-muted">{formatParis(publication.published_at)}</p>
        <h2 className="line-clamp-2 text-lg leading-snug group-hover:underline">{publication.title}</h2>
        <div className="mt-auto flex flex-wrap gap-1.5">
          <span className={chip}>{publication.subtype}</span>
          <span className={chip}>{(publication.file_ext ?? "doc").toUpperCase()} ↗</span>
        </div>
      </div>
    </a>
  );
}

// Publications laid out as a 1 / 2 / 3 column grid of cards.
export function PublicationsGrid({ rows }: { rows: ListedPublication[] }) {
  if (rows.length === 0) {
    return <p className="mt-10 border border-line p-8 text-center text-muted">Aucune publication</p>;
  }
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row, index) => (
        <PublicationCard key={row.id} publication={row} index={index} />
      ))}
    </div>
  );
}
