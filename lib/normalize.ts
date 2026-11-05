import type { PublicationRow, RawRecord } from "./types";

export type NormalizedPublication = Omit<PublicationRow, "score" | "score_reasons" | "imported_at">;

const UNCLASSIFIED = "Non classé";

// Treats the API's 9999… placeholders (debt issuers without a listed share) as missing.
function realCode(value: string | null): string | null {
  if (!value || /^9+$/.test(value)) return null;
  return value;
}

// Extracts the lowercase file extension from a document URL.
function fileExtension(url: string): string | null {
  const match = url.split("?")[0].match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : null;
}

// Reads the API's "1" / "0" / null flag without turning unknown into false.
function cac40Flag(value: string | null): boolean | null {
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}

// Maps a raw API record to the cleaned publication row stored in Supabase.
export function normalize(raw: RawRecord): NormalizedPublication {
  const companyName = raw.identificationsociete_iso_nom_soc.trim();
  const lei = raw.identificationsociete_iso_cd_lei || null;
  return {
    id: raw.uin_idt_uin,
    published_at: raw.uin_dat_amf,
    company_name: companyName,
    company_key: lei ?? companyName.toUpperCase(),
    lei,
    isin: realCode(raw.identificationsociete_iso_cd_isi),
    title: raw.informationdeposee_inf_tit_inf,
    type: raw.type_d_information ?? UNCLASSIFIED,
    subtype: raw.sous_type_d_information ?? UNCLASSIFIED,
    subtype_code: raw.informationdeposee_inf_stp_pri || null,
    url: raw.url_de_recuperation,
    file_ext: fileExtension(raw.url_de_recuperation),
    cac40: cac40Flag(raw.cac40),
    raw,
  };
}
