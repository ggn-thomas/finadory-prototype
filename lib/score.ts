import type { PublicationRow } from "./types";

export type ScoreResult = { score: number; reasons: string[] };

const ROUTINE_CODES = new Set(["006000", "013007", "014000"]);
const RESULTS_CODES = new Set(["001007", "005002", "004000", "003000"]);

const SUBTYPE_POINTS: Record<string, { points: number; label: string }> = {
  "001002": { points: 3, label: "Opération de l'émetteur" },
  "023000": { points: 2, label: "Franchissement de seuil" },
  "001006": { points: 1, label: "Information privilégiée" },
};

const KEYWORDS = [
  "acquisition",
  "cession",
  "fusion",
  "OPA",
  "offre publique",
  "objectif",
  "prévision",
  "relève",
  "abaisse",
  "avertissement",
  "nomination",
  "démission",
  "augmentation de capital",
  "contrat",
  "partenariat",
];

const CAC40_POINTS = 2;
const KEYWORD_POINTS = 2;

// Lowercases and strips accents so "Démission" and "DEMISSION" compare equal.
function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Routine filings (voting rights, buybacks, document availability, home member state) never make a story.
function isRoutine(code: string | null): boolean {
  return code !== null && (ROUTINE_CODES.has(code) || code.startsWith("002"));
}

// Points earned by the subtype code alone.
function subtypePoints(code: string | null): { points: number; label: string } | null {
  if (code === null) return null;
  if (RESULTS_CODES.has(code)) return { points: 3, label: "Résultats" };
  return SUBTYPE_POINTS[code] ?? null;
}

// Returns the keyword that appears first in the title (whole word, optional plural), if any.
function firstKeyword(title: string): string | null {
  const folded = fold(title);
  let best: { keyword: string; index: number } | null = null;
  for (const keyword of KEYWORDS) {
    const index = folded.search(new RegExp(`\\b${fold(keyword)}s?\\b`));
    if (index >= 0 && (!best || index < best.index)) best = { keyword, index };
  }
  return best?.keyword ?? null;
}

// Scores a publication with the hand-tuned grid: routine excluded, then subtype + keyword + CAC 40.
export function score(row: Pick<PublicationRow, "subtype_code" | "title" | "cac40">): ScoreResult {
  if (isRoutine(row.subtype_code)) return { score: 0, reasons: ["Routine (exclu)"] };
  const parts: { points: number; label: string }[] = [];
  const subtype = subtypePoints(row.subtype_code);
  if (subtype) parts.push(subtype);
  const keyword = firstKeyword(row.title);
  if (keyword) parts.push({ points: KEYWORD_POINTS, label: `Mot-clé « ${keyword} »` });
  if (row.cac40) parts.push({ points: CAC40_POINTS, label: "CAC 40" });
  return {
    score: parts.reduce((sum, part) => sum + part.points, 0),
    reasons: parts.map((part) => `${part.label} (+${part.points})`),
  };
}

// Orders brief candidates: scored PDFs only, best score then most recent, one per company.
export function selectCandidates<T extends Pick<PublicationRow, "company_key" | "score" | "file_ext" | "published_at">>(
  rows: T[],
): T[] {
  const sorted = rows
    .filter((row) => row.score > 0 && row.file_ext === "pdf")
    .sort((a, b) => b.score - a.score || b.published_at.localeCompare(a.published_at));
  const seen = new Set<string>();
  return sorted.filter((row) => !seen.has(row.company_key) && seen.add(row.company_key));
}
