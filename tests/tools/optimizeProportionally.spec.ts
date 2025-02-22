import { describe, expect, it } from "vitest";
import { optimizeProportionally } from "../../src/tools/optimizeProportionally";
import { vi } from "vitest";

vi.mock("../../src/tools/calculateTaxes", () => ({
  calculateTaxes: vi.fn((income, status) => {
    return income * 0.1; // Assume flat 10% tax rate for simplicity
  }),
}));

vi.mock("../../src/tools/optimization", () => ({
  getThresholds: vi.fn((status) => ({
    ssBase1: status === "single" ? 25000 : 32000,
    ssBase2: status === "single" ? 34000 : 44000,
  })),
}));

describe("optimizeProportionally", () => {
  it("should withdraw proportionally when balances are sufficient", () => {
    const result = optimizeProportionally(50000, 50000, 40000, 20000, "single");
    
    // Proportionally withdraw from Roth and Traditional
    expect(result.fromTrad).toBeCloseTo(11000, 0);
    expect(result.fromRoth).toBeCloseTo(10000, 0);
    expect(result.taxesPaid).toBeCloseTo(1000, 0); // 10% of Traditional withdrawal
  });

  it("should withdraw all available funds if total balance is insufficient", () => {
    const result = optimizeProportionally(5000, 5000, 40000, 20000, "single");

    expect(result.fromTrad).toBe(5000);
    expect(result.fromRoth).toBe(5000);
    expect(result.taxesPaid).toBeCloseTo(500, 0); // 10% of Traditional withdrawal
  });

  it("should correctly handle edge case where only Roth is available", () => {
    const result = optimizeProportionally(50000, 0, 40000, 20000, "single");

    expect(result.fromTrad).toBe(0);
    expect(result.fromRoth).toBe(20000);
    expect(result.taxesPaid).toBe(0);
  });

  it("should correctly handle edge case where only Traditional is available", () => {
    const result = optimizeProportionally(0, 50000, 40000, 20000, "single");

    expect(result.fromTrad).toBeCloseTo(22250, 0); // Additional tax included
    expect(result.fromRoth).toBe(0);
    expect(result.taxesPaid).toBeCloseTo(2250, 0);
  });

  it("should correctly adjust for Social Security taxation when withdrawals push income above thresholds", () => {
    const result = optimizeProportionally(20000, 40000, 50000, 35000, "married");

    expect(result.fromTrad).toBeGreaterThan(0);
    expect(result.fromRoth).toBeGreaterThan(0);
    expect(result.taxesPaid).toBeGreaterThan(0);
  });

  it("should not withdraw if Social Security alone covers the spending goal", () => {
    const result = optimizeProportionally(50000, 50000, 20000, 25000, "single");

    expect(result.fromTrad).toBe(0);
    expect(result.fromRoth).toBe(0);
    expect(result.taxesPaid).toBe(0);
  });
});
