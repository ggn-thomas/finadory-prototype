import { describe, expect, it } from "vitest";
import type { Segment } from "./types";
import { extractNumbers, normalizeText, verify } from "./verify";

const cite = (cited_text: string, page = 2) => ({ cited_text, start_page: page, end_page: page });

describe("normalizeText", () => {
  it("joins thousands groups (any space) and uses a decimal point", () => {
    expect(normalizeText("1 346 et 2 500 000 ; 9,9 %")).toBe("1346 et 2500000 ; 9.9 %");
  });

  it("collapses line breaks and double spaces", () => {
    expect(normalizeText("à  9,9\nmilliards d’euros")).toBe("à 9.9 milliards d'euros");
  });
});

describe("extractNumbers", () => {
  it("ignores years, letter-prefixed periods (T3, S1) and numeric dates", () => {
    expect(extractNumbers(normalizeText("T3 2026 : 15,3 milliards au 20/10/2026, S1 en hausse"))).toEqual(["15.3"]);
  });
});

describe("verify", () => {
  it("verifies a figure found in the passage cited for its sentence", () => {
    const segments: Segment[] = [
      { text: "Le ROCA ressort à 1 858 millions d'euros.", citations: [cite("ROCA ressort à 1 858 millions d’euros")] },
    ];
    const result = verify(segments, "… ROCA ressort à 1 858 millions d’euros …");
    expect(result.figures).toEqual([
      { number: "1858", sentence: "Le ROCA ressort à 1 858 millions d'euros.", status: "verified", page: 2 },
    ]);
    expect(result.status).toBe("verified");
  });

  it("marks a figure present elsewhere in the PDF but not in the cited passage as to check", () => {
    const segments: Segment[] = [{ text: "La marge atteint 20,8 %.", citations: [cite("La marge progresse.")] }];
    expect(verify(segments, "marge 20,8 % sur neuf mois").figures[0].status).toBe("to_check");
  });

  it("marks a figure absent from the PDF as unverified, which drives the brief status", () => {
    const segments: Segment[] = [
      { text: "Chiffre d'affaires de 9,9 milliards.", citations: [cite("chiffre d'affaires de 9,9 milliards")] },
      { text: "Soit 9 900 millions d'euros.", citations: [] },
    ];
    const result = verify(segments, "chiffre d'affaires de 9,9 milliards");
    expect(result.figures.map((f) => f.status)).toEqual(["verified", "unverified"]);
    expect(result.status).toBe("unverified");
  });

  it("finds figures glued together by PDF table extraction (two cells, no separator)", () => {
    const segments: Segment[] = [
      { text: "Le résultat net atteint 1 067,0 millions d'euros, contre 892,3.", citations: [cite("part du groupe 1 067,0892,3 -")] },
    ];
    expect(verify(segments, "part du groupe 1 067,0892,3 -").figures.map((f) => f.status)).toEqual(["verified", "verified"]);
  });

  it("does not use the glued-number fallback for short numbers", () => {
    const segments: Segment[] = [{ text: "Hausse de 5 %.", citations: [cite("hausse de 45 %")] }];
    expect(verify(segments, "hausse de 45 %").figures[0].status).toBe("unverified");
  });

  it("treats a brief without any figure as verified", () => {
    expect(verify([{ text: "Le groupe confirme ses objectifs 2026.", citations: [] }], "")).toEqual({
      figures: [],
      status: "verified",
    });
  });
});
