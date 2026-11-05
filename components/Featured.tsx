import { formatParis } from "@/lib/dates";
import { getCandidates, TOP_SIZE } from "@/lib/selection";
import { FeaturedCarousel, type FeaturedItem } from "./FeaturedCarousel";

// Loads the top candidates on the server and hands plain, pre-formatted items to the carousel.
export async function Featured() {
  const top = (await getCandidates()).slice(0, TOP_SIZE);
  const items: FeaturedItem[] = top.map((candidate) => ({
    id: candidate.id,
    companyName: candidate.company_name,
    title: candidate.title,
    meta: `${formatParis(candidate.published_at)} · ${candidate.subtype}`,
    reasons: candidate.score_reasons,
    url: candidate.url,
  }));
  return <FeaturedCarousel items={items} />;
}
