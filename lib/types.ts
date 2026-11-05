export type RawRecord = {
  uin_idt_uin: string;
  uin_dat_amf: string;
  identificationsociete_iso_nom_soc: string;
  identificationsociete_iso_cd_lei: string | null;
  identificationsociete_iso_cd_isi: string | null;
  informationdeposee_inf_tit_inf: string;
  informationdeposee_inf_stp_pri: string | null;
  informationdeposee_inf_lng_inf: string;
  type_d_information: string | null;
  sous_type_d_information: string | null;
  url_de_recuperation: string;
  cac40: string | null;
  [field: string]: unknown;
};

export type PublicationRow = {
  id: string;
  published_at: string;
  company_name: string;
  company_key: string;
  lei: string | null;
  isin: string | null;
  title: string;
  type: string;
  subtype: string;
  subtype_code: string | null;
  url: string;
  file_ext: string | null;
  cac40: boolean | null;
  score: number;
  score_reasons: string[];
  raw: RawRecord;
  imported_at: string;
};

export type FigureStatus = "verified" | "to_check" | "unverified";

export type BriefStatus = FigureStatus | "not_analyzable" | "error";

export type Citation = { cited_text: string; start_page: number; end_page: number };

export type Segment = { text: string; citations: Citation[] };

export type CheckedFigure = { number: string; sentence: string; status: FigureStatus; page: number | null };
