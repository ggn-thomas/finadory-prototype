import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { PublicationFilters } from "@/components/PublicationFilters";
import { PublicationsGrid } from "@/components/PublicationsGrid";
import { getFilterOptions, getPublications, type PublicationFilters as Filters } from "@/lib/publications";

type SearchParams = Record<string, string | string[] | undefined>;

// Keeps a single non-empty string value from a query parameter.
function param(value: string | string[] | undefined): string | undefined {
  const single = Array.isArray(value) ? value[0] : value;
  return single?.trim() || undefined;
}

// Reads and validates the list filters from the URL.
function parseFilters(params: SearchParams): Filters {
  const day = (value?: string) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined);
  const page = Number.parseInt(param(params.page) ?? "1", 10);
  return {
    company: param(params.company),
    type: param(params.type),
    subtype: param(params.subtype),
    from: day(param(params.from)),
    to: day(param(params.to)),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// Request-time part of the page: filters, grid and pagination.
async function PublicationsSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseFilters(await searchParams);
  const [options, { rows, total }] = await Promise.all([getFilterOptions(), getPublications(filters)]);
  return (
    <>
      <PublicationFilters options={options} filters={filters} />
      <PublicationsGrid rows={rows} />
      <Pagination filters={filters} total={total} />
    </>
  );
}

// Publications list page.
export default function Home(props: PageProps<"/">) {
  return (
    <>
      <PageHeader active="publications" />
      <Suspense fallback={<p className="mt-10 text-muted">Chargement des publications…</p>}>
        <PublicationsSection searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
