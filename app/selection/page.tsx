import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SelectionCard } from "@/components/SelectionCard";
import { stagger } from "@/lib/motion";
import { getCandidates, TOP_SIZE } from "@/lib/selection";

const CRITERIA = [
  "La routine est écartée : droits de vote, rachats d'actions, mises à disposition de documents.",
  "Le reste est noté : opération ou résultats +3, franchissement de seuil +2, autre information privilégiée +1, mot-clé fort dans le titre +2, société du CAC 40 +2.",
  "On garde les 5 meilleurs scores (PDF uniquement), une publication par société, les plus récentes en cas d'égalité.",
];

// Explains the selection rule in three lines, as Clardot shows why a signal is displayed.
function Criteria() {
  return (
    <section style={stagger(5)} className="animate-fade-up mt-8 border border-line p-5">
      <h2 className="font-serif text-xl">Le signal, pas le bruit</h2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
        {CRITERIA.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </section>
  );
}

// Request-time list of the top candidates.
async function TopCandidates() {
  const top = (await getCandidates()).slice(0, TOP_SIZE);
  if (top.length === 0) return <p className="mt-8 text-muted">Aucune publication retenue.</p>;
  return (
    <div className="mt-6 flex flex-col gap-4">
      {top.map((candidate, index) => (
        <SelectionCard key={candidate.id} candidate={candidate} rank={index + 1} style={stagger(index, 360, 60)} />
      ))}
    </div>
  );
}

// Selection page: the rule, then the publications that stand out.
export default function SelectionPage() {
  return (
    <>
      <PageHeader active="selection" />
      <Criteria />
      <Suspense fallback={<p className="mt-8 text-muted">Chargement de la sélection…</p>}>
        <TopCandidates />
      </Suspense>
    </>
  );
}
