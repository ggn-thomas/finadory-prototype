import type { RawRecord } from "./types";

const RECORDS_URL =
  "https://www.info-financiere.gouv.fr/api/explore/v2.1/catalog/datasets/flux-amf-new-prod/records";
const PAGE_SIZE = 100;

type RecordsPage = { total_count: number; results: RawRecord[] };

// Fetches one page of French publications from the last `days` days.
async function fetchPage(days: number, offset: number): Promise<RecordsPage> {
  const params = new URLSearchParams({
    where: `uin_dat_amf >= now(days=-${days}) AND informationdeposee_inf_lng_inf = "Français"`,
    order_by: "uin_dat_amf asc, uin_idt_uin asc",
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  const response = await fetch(`${RECORDS_URL}?${params}`);
  if (!response.ok) throw new Error(`info-financiere API ${response.status}: ${await response.text()}`);
  return response.json();
}

// Fetches every French publication of the period, paginating and de-duplicating by id.
export async function fetchFrenchPublications(days = 7): Promise<RawRecord[]> {
  const byId = new Map<string, RawRecord>();
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const page = await fetchPage(days, offset);
    total = page.total_count;
    for (const record of page.results) byId.set(record.uin_idt_uin, record);
    if (page.results.length === 0) break;
    offset += PAGE_SIZE;
  }
  return [...byId.values()];
}
