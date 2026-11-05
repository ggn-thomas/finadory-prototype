const PARIS = "Europe/Paris";

const parisParts = new Intl.DateTimeFormat("en-US", {
  timeZone: PARIS,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const displayFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// Returns Paris' offset from UTC (in ms) at the given instant, DST included.
function parisOffsetMs(instant: number): number {
  const parts = Object.fromEntries(parisParts.formatToParts(instant).map((p) => [p.type, p.value]));
  const wallClock = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return wallClock - instant;
}

// Returns the UTC instant (ISO) at which a Paris calendar day (YYYY-MM-DD) starts.
export function parisDayStartUtc(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  const utcMidnight = Date.UTC(year, month - 1, date);
  return new Date(utcMidnight - parisOffsetMs(utcMidnight)).toISOString();
}

// Returns the calendar day (YYYY-MM-DD) following the given one.
export function nextDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// Formats a UTC timestamp as a short French date and time in Paris time.
export function formatParis(iso: string): string {
  return displayFormat.format(new Date(iso));
}
