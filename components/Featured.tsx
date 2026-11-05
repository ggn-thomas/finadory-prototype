import { formatParis } from "@/lib/dates";
import { getCandidates, TOP_SIZE } from "@/lib/selection";
import { FeaturedCarousel, type FeaturedItem } from "./FeaturedCarousel";

const CRITERIA = [
  "La routine est écartée : droits de vote, rachats d'actions, mises à disposition de documents.",
  "Le reste est noté : opération ou résultats +3, franchissement de seuil +2, autre information privilégiée +1, mot-clé fort dans le titre +2, société du CAC 40 +2.",
  "On garde les 5 meilleurs scores (PDF uniquement), une publication par société, les plus récentes en cas d'égalité.",
];

// Collapsible explanation of the selection rule ("Le signal, pas le bruit").
function Criteria() {
  return (
    <details className="group mt-3 text-sm text-muted">
      <summary className="cursor-pointer list-none hover:text-text">
        <span className="mr-1 inline-block transition-transform group-open:rotate-90">›</span>
        Comment sont choisies ces publications ?
      </summary>
      <ol className="mt-2 list-decimal space-y-1 pl-8">
        {CRITERIA.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </details>
  );
}

// "À la une": top candidates loaded on the server, handed as plain items to the carousel.
export async function Featured() {
  const top = (await getCandidates()).slice(0, TOP_SIZE);
  const items: FeaturedItem[] = top.map((candidate) => ({
    id: candidate.id,
    companyName: candidate.company_name,
    title: candidate.title,
    meta: `${formatParis(candidate.published_at)} · ${candidate.subtype}`,
    reasons: candidate.score_reasons,
    url: candidate.url,
  }));
  return (
    <>
      <FeaturedCarousel items={items} />
      <Criteria />
    </>
  );
}
