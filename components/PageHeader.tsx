import Link from "next/link";
import { Suspense } from "react";
import { formatParis } from "@/lib/dates";
import { getCoveredPeriod } from "@/lib/publications";

const TABS = [
  { key: "publications", label: "Publications", href: "/" },
  { key: "selection", label: "Sélection & brèves", href: "/selection" },
] as const;

const pill = "inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-muted";

// Shows the date range covered by the frozen import.
async function CoveredPeriod() {
  const period = await getCoveredPeriod();
  if (!period) return null;
  return <span className={pill}>Du {formatParis(period.from)} au {formatParis(period.to)}</span>;
}

// Page title, source chips and tab navigation shared by both pages.
export function PageHeader({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <header className="pt-8">
      <p className="text-sm text-muted">Information réglementée / AMF</p>
      <h1 className="mt-8 font-serif text-4xl sm:text-5xl">Brèves AMF</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Les publications réglementées déposées auprès de l&apos;AMF sur les 7 derniers jours, les publications qui
        sortent du lot, et des brèves dont chaque chiffre est vérifié dans le document source.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <a className={`${pill} hover:text-text`} href="https://www.info-financiere.gouv.fr" target="_blank" rel="noreferrer">
          info-financiere.gouv.fr ↗
        </a>
        <span className={pill}>Français uniquement</span>
        <Suspense fallback={null}>
          <CoveredPeriod />
        </Suspense>
      </div>
      <nav className="mt-8 flex gap-6 overflow-x-auto border-y border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`-mb-px border-b py-3 text-[15px] whitespace-nowrap ${
              tab.key === active ? "border-text text-text" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
