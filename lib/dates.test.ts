import { describe, expect, it } from "vitest";
import { formatParis, nextDay, parisDayStartUtc } from "./dates";

describe("parisDayStartUtc", () => {
  it("uses UTC+2 before the October DST change", () => {
    expect(parisDayStartUtc("2026-10-20")).toBe("2026-10-19T22:00:00.000Z");
  });

  it("uses UTC+1 after the October DST change", () => {
    expect(parisDayStartUtc("2026-11-03")).toBe("2026-11-02T23:00:00.000Z");
  });

  it("handles the DST change day itself", () => {
    expect(parisDayStartUtc("2026-10-25")).toBe("2026-10-24T22:00:00.000Z");
  });
});

describe("nextDay", () => {
  it("moves to the following calendar day across month ends", () => {
    expect(nextDay("2026-10-31")).toBe("2026-11-01");
  });
});

describe("formatParis", () => {
  it("displays a UTC timestamp in Paris time", () => {
    expect(formatParis("2026-11-05T06:58:00+00:00")).toContain("07:58");
  });
});
