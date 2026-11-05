import type { CheckedFigure, FigureStatus } from "@/lib/types";

export const STATUS_LABEL: Record<FigureStatus, { icon: string; label: string }> = {
  verified: { icon: "✓", label: "Vérifié dans le passage cité" },
  to_check: { icon: "⚠", label: "Présent dans le PDF, hors passage cité" },
  unverified: { icon: "✗", label: "Introuvable dans le PDF" },
};

// Every figure of the brief, with its sentence, verification status and cited page.
export function FiguresTable({ figures }: { figures: CheckedFigure[] }) {
  if (figures.length === 0) return <p className="text-sm text-muted">Cette brève ne contient aucun chiffre.</p>;
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            <th className="px-4 py-2 font-normal">Statut</th>
            <th className="px-4 py-2 font-normal">Chiffre</th>
            <th className="px-4 py-2 font-normal">Phrase de la brève</th>
            <th className="px-4 py-2 font-normal">Page citée</th>
          </tr>
        </thead>
        <tbody>
          {figures.map((figure, i) => (
            <tr key={`${figure.number}-${i}`} className="border-b border-line last:border-0 align-top">
              <td className="px-4 py-2 whitespace-nowrap" title={STATUS_LABEL[figure.status].label}>
                {STATUS_LABEL[figure.status].icon}
              </td>
              <td className="px-4 py-2 font-medium whitespace-nowrap">{figure.number.replace(".", ",")}</td>
              <td className="px-4 py-2 text-muted">{figure.sentence}</td>
              <td className="px-4 py-2 whitespace-nowrap text-muted">{figure.page ? `p. ${figure.page}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
