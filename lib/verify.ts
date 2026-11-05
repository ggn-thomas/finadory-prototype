import type { CheckedFigure, FigureStatus, Segment } from "./types";

const SEVERITY: Record<FigureStatus, number> = { verified: 0, to_check: 1, unverified: 2 };

// Normalizes French number formatting and typography so the brief and the PDF compare equal.
export function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[«»“”]/g, '"')
    .replace(/−/g, "-")
    .replace(/\s+/g, " ")
    .replace(/(\d) (?=\d{3}\b)/g, "$1")
    .replace(/(\d),(\d)/g, "$1.$2")
    .toLowerCase()
    .trim();
}

// Extracts the numbers worth checking, skipping numeric dates, years and periods such as "t3" or "s1".
export function extractNumbers(normalized: string): string[] {
  const withoutDates = normalized.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, " ");
  const numbers = withoutDates.match(/(?<![a-z\d.])\d+(?:\.\d+)?/g) ?? [];
  return numbers.filter((n) => !(/^\d{4}$/.test(n) && +n >= 1990 && +n <= 2039));
}

const MIN_GLUED_DIGITS = 3;

// True if the number appears in the text, as a token or (3+ digits) glued to a neighbouring table cell.
function appearsIn(number: string, text: string, tokens: Set<string>): boolean {
  if (tokens.has(number)) return true;
  return number.replace(".", "").length >= MIN_GLUED_DIGITS && text.includes(number);
}

// Status of one number: in the passage cited for its sentence, elsewhere in the PDF, or nowhere.
function checkNumber(number: string, cited: string, source: string, tokens: { cited: Set<string>; source: Set<string> }) {
  if (appearsIn(number, cited, tokens.cited)) return "verified";
  return appearsIn(number, source, tokens.source) ? "to_check" : "unverified";
}

// Checks every number of every brief segment against its citations, then against the whole PDF text.
export function verify(segments: Segment[], sourceText: string): { figures: CheckedFigure[]; status: FigureStatus } {
  const source = normalizeText(sourceText);
  const sourceTokens = new Set(extractNumbers(source));
  const figures: CheckedFigure[] = [];
  for (const segment of segments) {
    const cited = segment.citations.map((c) => normalizeText(c.cited_text)).join(" ");
    const tokens = { cited: new Set(extractNumbers(cited)), source: sourceTokens };
    const page = segment.citations[0]?.start_page ?? null;
    for (const number of new Set(extractNumbers(normalizeText(segment.text)))) {
      const status = checkNumber(number, cited, source, tokens);
      figures.push({ number, sentence: segment.text.trim(), status, page });
    }
  }
  const worst = figures.reduce<FigureStatus>((acc, f) => (SEVERITY[f.status] > SEVERITY[acc] ? f.status : acc), "verified");
  return { figures, status: worst };
}