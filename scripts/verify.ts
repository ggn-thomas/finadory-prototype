import { getSupabase } from "@/lib/supabase";
import type { Segment } from "@/lib/types";
import { verify } from "@/lib/verify";

// Re-checks every stored brief from its segments and PDF text, without calling the model again.
async function main() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("briefs")
    .select("publication_id, title, segments, source_text")
    .not("title", "is", null);
  if (error) throw new Error(`Failed to load briefs: ${error.message}`);
  for (const brief of data) {
    const result = verify((brief.segments ?? []) as Segment[], brief.source_text ?? "");
    const update = await supabase
      .from("briefs")
      .update({ figures: result.figures, status: result.status })
      .eq("publication_id", brief.publication_id);
    if (update.error) throw new Error(`Failed to save verification: ${update.error.message}`);
    const counts = result.figures.reduce<Record<string, number>>((acc, f) => ({ ...acc, [f.status]: (acc[f.status] ?? 0) + 1 }), {});
    console.log(`${result.status.padEnd(10)} ${brief.title} ${JSON.stringify(counts)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
