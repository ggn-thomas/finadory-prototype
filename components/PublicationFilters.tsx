import Link from "next/link";
import type { FilterOptions, PublicationFilters as Filters } from "@/lib/publications";

const field =
  "h-9 rounded-full border border-line bg-card px-3 text-sm text-text outline-none focus:border-accent";

type SelectProps = {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
};

// Dropdown pill whose first option clears the filter.
function Select({ name, label, value, options }: SelectProps) {
  return (
    <select name={name} defaultValue={value ?? ""} aria-label={label} className={`${field} max-w-full sm:max-w-56`}>
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Plain GET form: filters live in the URL and are applied server-side, no client JavaScript.
export function PublicationFilters({ options, filters }: { options: FilterOptions; filters: Filters }) {
  const asOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));
  return (
    <form method="get" className="mt-8 flex flex-wrap items-center gap-2">
      <Select
        name="company"
        label="Toutes les sociétés"
        value={filters.company}
        options={options.companies.map((c) => ({ value: c.key, label: c.name }))}
      />
      <Select name="type" label="Tous les types" value={filters.type} options={asOptions(options.types)} />
      <Select name="subtype" label="Tous les sous-types" value={filters.subtype} options={asOptions(options.subtypes)} />
      <input type="date" name="from" defaultValue={filters.from} aria-label="Du" className={field} />
      <input type="date" name="to" defaultValue={filters.to} aria-label="Au" className={field} />
      <button type="submit" className="h-9 rounded-full bg-text px-4 text-sm font-medium text-bg hover:bg-white">
        Filtrer
      </button>
      <Link href="/" className="h-9 rounded-full bg-secondary px-4 text-sm leading-9 text-text hover:bg-line">
        Réinitialiser
      </Link>
    </form>
  );
}
