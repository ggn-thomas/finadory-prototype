import { describe, expect, it } from "vitest";
import { normalize } from "./normalize";
import type { RawRecord } from "./types";

const airFrance: RawRecord = {
  uin_idt_uin: "131924_20261105",
  uin_dat_amf: "2026-11-05T06:58:00+00:00",
  identificationsociete_iso_nom_soc: "AIR FRANCE-KLM",
  identificationsociete_iso_cd_lei: "969500AQW31GYO8JZD66",
  identificationsociete_iso_cd_isi: "FR001400J770",
  informationdeposee_inf_tit_inf: "Résultats T3 2026 d'Air France-KLM",
  informationdeposee_inf_stp_pri: "005002",
  informationdeposee_inf_lng_inf: "Français",
  type_d_information:
    "Informations réglementées supplémentaires devant être rendues publiques en vertu de la législation d'un état membre",
  sous_type_d_information: "Information financière trimestrielle",
  url_de_recuperation:
    "https://fr.ftp.opendatasoft.com/datadila/INFOFI/MKW/2026/11/FCMKW131924_20261105.pdf",
  cac40: null,
};

const debtIssuer: RawRecord = {
  ...airFrance,
  uin_idt_uin: "999_20261104",
  identificationsociete_iso_nom_soc: " bpce ",
  identificationsociete_iso_cd_lei: null,
  identificationsociete_iso_cd_isi: "999999999999",
  type_d_information: null,
  sous_type_d_information: null,
  informationdeposee_inf_stp_pri: null,
  url_de_recuperation: "https://fr.ftp.opendatasoft.com/datadila/INFOFI/ACT/2026/11/FCACT0001.ZIP",
};

describe("normalize", () => {
  it("maps a complete record to a publication row", () => {
    const row = normalize(airFrance);
    expect(row.id).toBe("131924_20261105");
    expect(row.published_at).toBe("2026-11-05T06:58:00+00:00");
    expect(row.company_name).toBe("AIR FRANCE-KLM");
    expect(row.company_key).toBe("969500AQW31GYO8JZD66");
    expect(row.lei).toBe("969500AQW31GYO8JZD66");
    expect(row.isin).toBe("FR001400J770");
    expect(row.subtype).toBe("Information financière trimestrielle");
    expect(row.subtype_code).toBe("005002");
    expect(row.file_ext).toBe("pdf");
    expect(row.cac40).toBeNull();
    expect(row.raw).toEqual(airFrance);
  });

  it("applies fallbacks for missing or placeholder values", () => {
    const row = normalize(debtIssuer);
    expect(row.isin).toBeNull();
    expect(row.lei).toBeNull();
    expect(row.company_key).toBe("BPCE");
    expect(row.type).toBe("Non classé");
    expect(row.subtype).toBe("Non classé");
    expect(row.subtype_code).toBeNull();
    expect(row.file_ext).toBe("zip");
  });

  it("reads cac40 as a three-state boolean", () => {
    expect(normalize({ ...airFrance, cac40: "1" }).cac40).toBe(true);
    expect(normalize({ ...airFrance, cac40: "0" }).cac40).toBe(false);
    expect(normalize({ ...airFrance, cac40: null }).cac40).toBeNull();
  });
});
