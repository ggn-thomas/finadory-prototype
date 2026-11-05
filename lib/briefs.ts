import { getSupabase } from "./supabase";
import type { BriefStatus, CheckedFigure, PublicationRow } from "./types";

type LinkedPublication = Pick<
  PublicationRow,
  "id" | "company_name" | "published_at" | "subtype" | "title" | "url" | "score" | "score_reasons"
>;

export type Brief = {
  publication_id: string;
  title: string;
  chapo: string;
  body: string;
  key_facts: string[];
  figures: CheckedFigure[];
  status: BriefStatus;
  word_count: number;
  model: string;
  prompt_version: string;
  publication: LinkedPublication;
};

const PUBLICATION_FIELDS = "id, company_name, published_at, subtype, title, url, score, score_reasons";
const BRIEF_FIELDS = `publication_id, title, chapo, body, key_facts, figures, status, word_count, model, prompt_version, publication:publications(${PUBLICATION_FIELDS})`;
const UNUSABLE = "(not_analyzable,error)";

// Loads every displayable brief (generated and checked), best scored publication first.
export async function getBriefs(): Promise<Brief[]> {
  const { data, error } = await getSupabase()
    .from("briefs")
    .select(BRIEF_FIELDS)
    .not("status", "in", UNUSABLE)
    .not("title", "is", null);
  if (error) throw new Error(`Failed to load briefs: ${error.message}`);
  const briefs = data as unknown as Brief[];
  return briefs.sort((a, b) => b.publication.score - a.publication.score);
}

// Loads one displayable brief by publication id, or null if it does not exist.
export async function getBrief(publicationId: string): Promise<Brief | null> {
  const { data, error } = await getSupabase()
    .from("briefs")
    .select(BRIEF_FIELDS)
    .eq("publication_id", publicationId)
    .not("status", "in", UNUSABLE)
    .maybeSingle();
  if (error) throw new Error(`Failed to load brief: ${error.message}`);
  return data as unknown as Brief | null;
}
