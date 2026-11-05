import { describe, expect, it } from "vitest";
import { parseBriefText } from "./briefText";

const complete = `TITRE: Legrand relève ses objectifs 2026
CHAPÔ: Le chiffre d'affaires atteint 7,1 milliards d'euros sur neuf mois.
CORPS:
Legrand publie ses résultats.
Selon la société, la croissance est solide.
FAITS CLÉS:
- Chiffre d'affaires de 7,1 milliards d'euros
- Objectifs 2026 relevés`;

describe("parseBriefText", () => {
  it("splits a complete brief into its sections", () => {
    expect(parseBriefText(complete)).toEqual({
      insufficient: false,
      reason: "",
      title: "Legrand relève ses objectifs 2026",
      chapo: "Le chiffre d'affaires atteint 7,1 milliards d'euros sur neuf mois.",
      body: "Legrand publie ses résultats.\nSelon la société, la croissance est solide.",
      key_facts: ["Chiffre d'affaires de 7,1 milliards d'euros", "Objectifs 2026 relevés"],
    });
  });

  it("accepts markers without accents and extra spaces", () => {
    const parsed = parseBriefText("TITRE : A\nCHAPO : B\nCORPS :\nC\nFAITS CLES :\n- D");
    expect([parsed.title, parsed.chapo, parsed.body, parsed.key_facts]).toEqual(["A", "B", "C", ["D"]]);
  });

  it("detects the insufficient-material answer", () => {
    expect(parseBriefText("INSUFFISANT: le document annonce seulement une mise à disposition.")).toMatchObject({
      insufficient: true,
      reason: "le document annonce seulement une mise à disposition.",
    });
  });

  it("flags an answer without the expected markers as insufficient", () => {
    expect(parseBriefText("Voici une brève sans balises.").insufficient).toBe(true);
  });
});
