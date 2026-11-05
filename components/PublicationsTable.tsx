import { formatParis } from "@/lib/dates";
import type { ListedPublication } from "@/lib/publications";

const HIGH_SCORE = 5;

// Score badge: the accent color is reserved for publications that clearly stand out.
function ScoreBadge({ score }: { score: number }) {
  const tone = score >= HIGH_SCORE ? "bg-accent text-bg" : score > 0 ? "bg-secondary text-text" : "text-muted";
  return <span className={`inline-block min-w-7 rounded-full px-2 py-0.5 text-center text-xs ${tone}`}>{score}</span>;
}

// Publications table: date in Paris time, company, title, subtype, score and source link.
export function PublicationsTable({ rows }: { rows: ListedPublication[] }) {
  if (rows.length === 0) {
    return <p className="mt-10 rounded-lg border border-line bg-card p-8 text-center text-muted">Aucune publication</p>;
  }
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-card">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-normal">Date</th>
            <th className="px-4 py-3 font-normal">Société</th>
            <th className="px-4 py-3 font-normal">Titre</th>
            <th className="px-4 py-3 font-normal">Sous-type</th>
            <th className="px-4 py-3 text-center font-normal">Score</th>
            <th className="px-4 py-3 font-normal">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line last:border-0 hover:bg-secondary/40">
              <td className="px-4 py-3 whitespace-nowrap text-muted">{formatParis(row.published_at)}</td>
              <td className="px-4 py-3 font-medium">{row.company_name}</td>
              <td className="max-w-md px-4 py-3">{row.title}</td>
              <td className="px-4 py-3">
                <span className="inline-block rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                  {row.subtype}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <ScoreBadge score={row.score} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <a href={row.url} target="_blank" rel="noreferrer" className="text-muted hover:text-text">
                  {(row.file_ext ?? "doc").toUpperCase()} ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
