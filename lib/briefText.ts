export type ParsedBrief = {
  insufficient: boolean;
  reason: string;
  title: string;
  chapo: string;
  body: string;
  key_facts: string[];
};

const SECTION = /^(TITRE|CHAP[OÔ]|CORPS|FAITS CL[EÉ]S|INSUFFISANT)\s*:\s*/i;

// Maps a marker as written by the model ("CHAPO", "Faits clés"…) to its canonical key.
function sectionKey(marker: string): string {
  const folded = marker.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
  return folded.startsWith("FAITS") ? "FAITS" : folded;
}

// Groups the model's lines under the section marker that precedes them.
function splitSections(text: string): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let current: string[] | null = null;
  for (const line of text.split("\n")) {
    const match = line.match(SECTION);
    if (match) {
      const rest = line.slice(match[0].length).trim();
      current = rest ? [rest] : [];
      sections.set(sectionKey(match[1]), current);
    } else if (current && line.trim()) {
      current.push(line.trim());
    }
  }
  return sections;
}

// Parses the tagged brief (TITRE / CHAPÔ / CORPS / FAITS CLÉS, or INSUFFISANT) returned by the model.
export function parseBriefText(text: string): ParsedBrief {
  const sections = splitSections(text);
  const get = (key: string) => (sections.get(key) ?? []).join("\n");
  const empty = { title: "", chapo: "", body: "", key_facts: [] };
  if (sections.has("INSUFFISANT")) return { insufficient: true, reason: get("INSUFFISANT"), ...empty };
  if (!sections.has("TITRE") || !sections.has("CORPS")) {
    return { insufficient: true, reason: "Réponse du modèle sans les sections attendues", ...empty };
  }
  return {
    insufficient: false,
    reason: "",
    title: get("TITRE"),
    chapo: get("CHAPO"),
    body: get("CORPS"),
    key_facts: (sections.get("FAITS") ?? []).map((line) => line.replace(/^[-•]\s*/, "")),
  };
}
