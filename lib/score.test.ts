import { describe, expect, it } from "vitest";
import { score, selectCandidates } from "./score";
import type { PublicationRow } from "./types";

describe("score", () => {
  it("excludes routine subtypes whatever the title or index membership", () => {
    for (const code of ["006000", "013007", "002001", "014000"]) {
      expect(score({ subtype_code: code, title: "Acquisition majeure", cac40: true })).toEqual({
        score: 0,
        reasons: ["Routine (exclu)"],
      });
    }
  });

  it("adds results, the first keyword in the title and CAC 40", () => {
    const result = score({ subtype_code: "001007", title: "Legrand relève ses objectifs 2026", cac40: true });
    expect(result.score).toBe(7);
    expect(result.reasons).toEqual(["Résultats (+3)", "Mot-clé « relève » (+2)", "CAC 40 (+2)"]);
  });

  it("scores an issuer operation with a keyword", () => {
    const result = score({ subtype_code: "001002", title: "Vusion finalise l'acquisition d'In-Store Media", cac40: null });
    expect(result.score).toBe(5);
  });

  it("gives a single point to other inside information", () => {
    expect(score({ subtype_code: "001006", title: "Lettre aux actionnaires", cac40: false }).score).toBe(1);
  });

  it("scores threshold crossings", () => {
    expect(score({ subtype_code: "023000", title: "Déclaration", cac40: null }).reasons).toEqual([
      "Franchissement de seuil (+2)",
    ]);
  });

  it("returns nothing for unknown codes without keyword", () => {
    expect(score({ subtype_code: "001008", title: "Communiqué", cac40: null })).toEqual({ score: 0, reasons: [] });
    expect(score({ subtype_code: null, title: "Communiqué", cac40: null })).toEqual({ score: 0, reasons: [] });
  });

  it("matches keywords regardless of case and accents, on whole words only", () => {
    expect(score({ subtype_code: null, title: "CESSION D'UNE FILIALE", cac40: null }).score).toBe(2);
    expect(score({ subtype_code: null, title: "DEMISSION du directeur", cac40: null }).score).toBe(2);
    expect(score({ subtype_code: null, title: "Une opacité regrettable", cac40: null }).score).toBe(0);
  });
});

// Builds a publication row with only the fields selectCandidates reads.
function row(id: string, companyKey: string, points: number, fileExt = "pdf", publishedAt = "2026-11-04T08:00:00+00:00") {
  return { id, company_key: companyKey, score: points, file_ext: fileExt, published_at: publishedAt } as PublicationRow;
}

describe("selectCandidates", () => {
  it("keeps one publication per company, the best scored", () => {
    const result = selectCandidates([row("a", "X", 5), row("b", "X", 7), row("c", "Y", 3)]);
    expect(result.map((r) => r.id)).toEqual(["b", "c"]);
  });

  it("excludes non-PDF documents and zero scores", () => {
    const result = selectCandidates([row("zip", "Z", 9, "zip"), row("zero", "W", 0), row("ok", "V", 1)]);
    expect(result.map((r) => r.id)).toEqual(["ok"]);
  });

  it("breaks score ties with the most recent publication", () => {
    const older = row("old", "A", 4, "pdf", "2026-11-01T08:00:00+00:00");
    const newer = row("new", "B", 4, "pdf", "2026-11-03T08:00:00+00:00");
    expect(selectCandidates([older, newer]).map((r) => r.id)).toEqual(["new", "old"]);
  });
});
