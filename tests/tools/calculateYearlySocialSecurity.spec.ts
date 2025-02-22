import { describe, expect, it } from "vitest";
import { calculateYearlySocialSecurity } from "../../src/tools/calculateSocSec";

describe("calculateYearlySocialSecurity", () => {
  it("should return 0 if current age is below 62", () => {
    expect(calculateYearlySocialSecurity(65, 60, 0, 0.02)).toBe(0);
  });

  it("should return the correct benefit for claiming at FRA (67)", () => {
    expect(calculateYearlySocialSecurity(67, 67, 0, 0)).toBe(24000); // 2000 * 12
  });

  it("should reduce benefit for early claiming at 62", () => {
    expect(calculateYearlySocialSecurity(62, 62, 0, 0)).toBeCloseTo(16477, 0);
  });

  it("should increase benefit for delayed claiming at 70", () => {
    expect(calculateYearlySocialSecurity(70, 70, 0, 0)).toBeCloseTo(29760, 0);
  });

  it("should apply inflation adjustment correctly", () => {
    expect(calculateYearlySocialSecurity(67, 67, 5, 0.02)).toBeCloseTo(26498, 0);
  });
});
