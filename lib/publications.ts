import { nextDay, parisDayStartUtc } from "./dates";
import { getSupabase } from "./supabase";
import type { PublicationRow } from "./types";

export const PAGE_SIZE = 50;

export type PublicationFilters = {
  company?: string;
  type?: string;
  subtype?: string;
  from?: string;
  to?: string;
  page: number;
};

export type ListedPublication = Pick<
  PublicationRow,
  "id" | "published_at" | "company_name" | "title" | "subtype" | "score" | "url" | "file_ext"
>;

export type FilterOptions = {
  companies: { key: string; name: string }[];
  types: string[];
  subtypes: string[];
};

// Builds the dropdown options from the distinct values present in the table.
export async function getFilterOptions(): Promise<FilterOptions> {
  const { data, error } = await getSupabase()
    .from("publications")
    .select("company_key, company_name, type, subtype")
    .limit(5000);
  if (error) throw new Error(`Failed to load filter options: ${error.message}`);
  const companies = new Map(data.map((row) => [row.company_key, row.company_name]));
  return {
    companies: [...companies].map(([key, name]) => ({ key, name })).sort((a, b) => a.name.localeCompare(b.name, "fr")),
    types: [...new Set(data.map((row) => row.type))].sort((a, b) => a.localeCompare(b, "fr")),
    subtypes: [...new Set(data.map((row) => row.subtype))].sort((a, b) => a.localeCompare(b, "fr")),
  };
}

// Returns one page of publications matching the filters, newest first, with the total count.
export async function getPublications(filters: PublicationFilters) {
  let query = getSupabase()
    .from("publications")
    .select("id, published_at, company_name, title, subtype, score, url, file_ext", { count: "exact" });
  if (filters.company) query = query.eq("company_key", filters.company);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.subtype) query = query.eq("subtype", filters.subtype);
  if (filters.from) query = query.gte("published_at", parisDayStartUtc(filters.from));
  if (filters.to) query = query.lt("published_at", parisDayStartUtc(nextDay(filters.to)));
  const start = (filters.page - 1) * PAGE_SIZE;
  const { data, count, error } = await query
    .order("published_at", { ascending: false })
    .order("id", { ascending: true })
    .range(start, start + PAGE_SIZE - 1);
  if (error) throw new Error(`Failed to load publications: ${error.message}`);
  return { rows: (data ?? []) as ListedPublication[], total: count ?? 0 };
}

// Returns the oldest and newest publication dates, i.e. the period covered by the import.
export async function getCoveredPeriod(): Promise<{ from: string; to: string } | null> {
  const table = () => getSupabase().from("publications").select("published_at").limit(1);
  const [oldest, newest] = await Promise.all([
    table().order("published_at", { ascending: true }),
    table().order("published_at", { ascending: false }),
  ]);
  if (!oldest.data?.[0] || !newest.data?.[0]) return null;
  return { from: oldest.data[0].published_at, to: newest.data[0].published_at };
}
