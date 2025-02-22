import { describe, expect, it } from "vitest";
import { optimizeRothFirst } from "../../src/tools/optimizeRothFirst";
import { vi } from "vitest";

vi.mock("../../src/tools/calculateTaxes", () => ({
  calculateTaxes: vi.fn((income, _status) => {
    return income * 0.1; // Assume 10% flat tax for simplicity
  }),
}));

vi.mock("../../src/tools/optimization", () => ({
  getThresholds: vi.fn((status) => ({
    ssBase1: status === "single" ? 25000 : 32000,
    ssBase2: status === "single" ? 34000 : 44000,
  })),
}));

describe("optimizeRothFirst", () => {
  it("should withdraw from Roth only if balance is sufficient", () => {
    const result = optimizeRothFirst(50000, 100000, 40000, 20000, "single");
    expect(result.fromRoth).toBe(20000);
    expect(result.fromTrad).toBe(0);
    expect(result.taxesPaid).toBe(0);
  });

  it("should withdraw only from Roth if it covers the spending goal", () => {
    const result = optimizeRothFirst(50000, 100000, 30000, 20000, "single");
    expect(result.fromRoth).toBe(10000);
    expect(result.fromTrad).toBe(0);
    expect(result.taxesPaid).toBe(0);
  });

  it("should withdraw from Traditional IRA when Roth is insufficient", () => {
    const result = optimizeRothFirst(5000, 50000, 40000, 20000, "single");
    expect(result.fromRoth).toBe(5000);
    expect(result.fromTrad).toBe(16500); // 15,000 + 10% tax = $16500
    expect(result.taxesPaid).toBe(1500);
  });

  it("should handle case where Traditional IRA balance is insufficient", () => {
    const result = optimizeRothFirst(5000, 10000, 40000, 20000, "single");
    expect(result.fromRoth).toBe(5000);
    expect(result.fromTrad).toBe(10000);
    expect(result.taxesPaid).toBe(1500); //10K from IRA + 50% of prov ss income (50% of ssincome) = 10% of 15K
    expect(result.spendingGoal - (result.ssIncome + result.fromRoth + result.fromTrad - result.taxesPaid)).toBeCloseTo(6500, 0);
  });

  it("should correctly handle Social Security taxation thresholds", () => {
    const result = optimizeRothFirst(10000, 50000, 60000, 35000, "married");
    expect(result.fromRoth).toBe(10000);
    expect(result.fromTrad).toBeGreaterThan(0);
    expect(result.taxesPaid).toBeGreaterThan(0);
  });

  it("should not withdraw if Social Security covers the spending goal", () => {
    const result = optimizeRothFirst(50000, 50000, 20000, 25000, "single");
    expect(result.fromRoth).toBe(0);
    expect(result.fromTrad).toBe(0);
    expect(result.taxesPaid).toBe(0);
  });
});
