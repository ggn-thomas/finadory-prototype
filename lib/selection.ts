import { selectCandidates } from "./score";
import { getSupabase } from "./supabase";
import type { PublicationRow } from "./types";

export const TOP_SIZE = 5;

export type Candidate = Pick<
  PublicationRow,
  | "id"
  | "published_at"
  | "company_name"
  | "company_key"
  | "title"
  | "subtype"
  | "score"
  | "score_reasons"
  | "url"
  | "file_ext"
>;

// Loads every scored publication, ordered as brief candidates (one per company).
export async function getCandidates(): Promise<Candidate[]> {
  const { data, error } = await getSupabase()
    .from("publications")
    .select("id, published_at, company_name, company_key, title, subtype, score, score_reasons, url, file_ext")
    .gt("score", 0)
    .limit(5000);
  if (error) throw new Error(`Failed to load candidates: ${error.message}`);
  return selectCandidates(data as Candidate[]);
}
