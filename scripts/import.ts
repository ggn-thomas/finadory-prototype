import { fetchFrenchPublications } from "@/lib/infofi";
import { normalize } from "@/lib/normalize";
import { getSupabase } from "@/lib/supabase";

const BATCH_SIZE = 100;

// Imports the last 7 days of French publications into Supabase (idempotent upsert on id).
async function main() {
  const records = await fetchFrenchPublications(7);
  const rows = records.map((raw) => ({ ...normalize(raw), score: 0, score_reasons: [] }));
  const supabase = getSupabase();
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("publications").upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
    upserted += batch.length;
  }
  console.log({ fetched: records.length, upserted });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
