import { getBriefs } from "@/lib/briefs";
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

// "Brief" section: generated briefs loaded on the server, handed as plain items to the carousel.
export async function Featured() {
  const items: FeaturedItem[] = (await getBriefs()).map((brief) => ({
    id: brief.publication_id,
    companyName: brief.publication.company_name,
    title: brief.title,
  }));
  return (
    <>
      <FeaturedCarousel items={items} />
      <Criteria />
    </>
  );
}
