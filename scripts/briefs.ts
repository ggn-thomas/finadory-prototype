import { generateBrief, MODEL } from "@/lib/generate";
import { fetchSourcePdf } from "@/lib/pdf";
import { PROMPT_VERSION } from "@/lib/prompts";
import { getCandidates, TOP_SIZE, type Candidate } from "@/lib/selection";
import { getSupabase } from "@/lib/supabase";
import type { BriefStatus } from "@/lib/types";
import { verify } from "@/lib/verify";

const MIN_TEXT_CHARS = 200;

type BriefRow = { publication_id: string; status: BriefStatus | null; reason?: string | null; [field: string]: unknown };

// Stores (insert or replace) the brief of one publication.
async function saveBrief(row: BriefRow): Promise<void> {
  const { error } = await getSupabase().from("briefs").upsert(row, { onConflict: "publication_id" });
  if (error) throw new Error(`Failed to save brief: ${error.message}`);
}

// Downloads the PDF, asks Claude for a cited brief and returns the row to store (never throws).
async function buildBrief(candidate: Candidate): Promise<BriefRow> {
  const base = { publication_id: candidate.id, model: MODEL, prompt_version: PROMPT_VERSION };
  try {
    const pdf = await fetchSourcePdf(candidate.url);
    if (pdf.text.trim().length < MIN_TEXT_CHARS) {
      return { ...base, status: "not_analyzable", reason: "Texte non extractible (PDF scanné ?)" };
    }
    const { brief, segments } = await generateBrief(candidate, pdf.base64);
    if (brief.insufficient) {
      return { ...base, status: "not_analyzable", reason: brief.reason, source_text: pdf.text, segments };
    }
    const { title, chapo, body, key_facts } = brief;
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    const { figures, status } = verify(segments, pdf.text);
    return { ...base, title, chapo, body, key_facts, segments, figures, status, word_count: wordCount, source_text: pdf.text };
  } catch (error) {
    return { ...base, status: "error", reason: error instanceof Error ? error.message : String(error) };
  }
}

// Returns the statuses of briefs already stored, keyed by publication id.
async function existingStatuses(): Promise<Map<string, BriefStatus | null>> {
  const { data, error } = await getSupabase().from("briefs").select("publication_id, status");
  if (error) throw new Error(`Failed to load briefs: ${error.message}`);
  return new Map(data.map((row) => [row.publication_id as string, row.status as BriefStatus | null]));
}

const isUsable = (status: BriefStatus | null | undefined) => status !== "not_analyzable" && status !== "error";

// Walks candidates by score until TOP_SIZE usable briefs exist; `--reset` regenerates everything.
async function main() {
  if (process.argv.includes("--reset")) await getSupabase().from("briefs").delete().neq("publication_id", "");
  const existing = await existingStatuses();
  let usable = 0;
  for (const candidate of await getCandidates()) {
    if (usable >= TOP_SIZE) break;
    if (existing.has(candidate.id) && isUsable(existing.get(candidate.id))) {
      usable += 1;
      console.log(`= ${candidate.company_name}: already generated`);
      continue;
    }
    const row = await buildBrief(candidate);
    await saveBrief(row);
    if (isUsable(row.status)) usable += 1;
    console.log(`${isUsable(row.status) ? "+" : "-"} ${candidate.company_name}: ${row.status ?? "generated"} ${row.reason ?? ""}`);
  }
  console.log({ usable });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
