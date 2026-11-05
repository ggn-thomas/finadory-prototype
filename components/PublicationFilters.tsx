import Link from "next/link";
import { stagger } from "@/lib/motion";
import type { FilterOptions, PublicationFilters as Filters } from "@/lib/publications";

const field =
  "h-9 shrink-0 appearance-none rounded-none border border-line bg-transparent px-3 text-sm text-text outline-none hover:border-muted focus-within:border-accent";
const action = "h-9 shrink-0 rounded-full px-4 text-sm";
const flexible = "min-w-0 flex-1 basis-40";

type SelectProps = { name: string; label: string; value?: string; options: string[] };

// Dropdown field (native look disabled, custom chevron); its first option clears the filter.
function Select({ name, label, value, options }: SelectProps) {
  return (
    <div className={`relative ${flexible}`}>
      <select
        name={name}
        defaultValue={value ?? ""}
        aria-label={label}
        className={`${field} w-full truncate pr-8`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="pointer-events-none absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 text-muted"
      >
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Free-text company search with native suggestions (datalist), no client JavaScript.
function CompanySearch({ value, companies }: { value?: string; companies: string[] }) {
  return (
    <>
      <input
        type="search"
        name="company"
        list="companies"
        defaultValue={value}
        placeholder="Rechercher une société"
        aria-label="Société"
        className={`${field} ${flexible} placeholder:text-muted`}
      />
      <datalist id="companies">
        {companies.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </>
  );
}

type DateFieldProps = { name: string; label: string; value?: string; min?: string; max?: string };

// Date field with a visible label ("Début" / "Fin"), bounded to the imported period.
function DateField({ name, label, value, min, max }: DateFieldProps) {
  return (
    <label className={`${field} flex items-center gap-2`}>
      <span className="text-muted">{label}</span>
      <input type="date" name={name} defaultValue={value} min={min} max={max} className="bg-transparent outline-none" />
    </label>
  );
}

// Plain GET form on a single row: filters live in the URL and are applied server-side.
export function PublicationFilters({ options, filters }: { options: FilterOptions; filters: Filters }) {
  const { period } = options;
  return (
    <form method="get" style={stagger(7)} className="animate-fade-up flex flex-wrap items-center gap-2 lg:flex-nowrap">
      <CompanySearch value={filters.company} companies={options.companies} />
      <Select name="type" label="Tous les types" value={filters.type} options={options.types} />
      <Select name="subtype" label="Tous les sous-types" value={filters.subtype} options={options.subtypes} />
      <DateField name="from" label="Début" value={filters.from ?? period?.from} min={period?.from} max={period?.to} />
      <DateField name="to" label="Fin" value={filters.to ?? period?.to} min={period?.from} max={period?.to} />
      <button type="submit" className={`${action} bg-text font-medium text-bg hover:bg-white`}>
        Filtrer
      </button>
      <Link href="/" className={`${action} bg-secondary leading-9 text-text hover:bg-line`}>
        Réinitialiser
      </Link>
    </form>
  );
}
