import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BriefView } from "@/components/BriefView";
import { getBrief } from "@/lib/briefs";

// Request-time part: reads the id, loads the brief, 404 if it does not exist.
async function BriefContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brief = await getBrief(decodeURIComponent(id));
  if (!brief) notFound();
  return <BriefView brief={brief} />;
}

// Brief page, reached by clicking a title in the "Brief" carousel.
export default function BriefPage(props: PageProps<"/briefs/[id]">) {
  return (
    <Suspense fallback={<p className="mt-10 text-muted">Chargement de la brève…</p>}>
      <BriefContent params={props.params} />
    </Suspense>
  );
}
