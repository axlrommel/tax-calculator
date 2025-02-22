import { describe, expect, it } from "vitest";
import { calculateRMD } from "../../src/tools/calculateRMD"; // Adjust path as needed

describe("calculateRMD", () => {
  it("should return 0 for ages below 73", () => {
    expect(calculateRMD(72, 100000)).toBe(0);
    expect(calculateRMD(50, 200000)).toBe(0);
  });

  it("should correctly calculate RMD for age 73", () => {
    expect(calculateRMD(73, 100000)).toBeCloseTo(3773.58, 2);
  });

  it("should correctly calculate RMD for age 80", () => {
    expect(calculateRMD(80, 100000)).toBeCloseTo(4950.50, 2);
  });

  it("should correctly calculate RMD for age 90", () => {
    expect(calculateRMD(90, 100000)).toBeCloseTo(8196.72, 2);
  });

  it("should default to life expectancy factor of 5.6 for ages above 102", () => {
    expect(calculateRMD(105, 100000)).toBeCloseTo(17857.14, 2);
  });

  it("should handle very large Traditional IRA balances", () => {
    expect(calculateRMD(85, 1000000)).toBeCloseTo(62500, 2);
  });
});
