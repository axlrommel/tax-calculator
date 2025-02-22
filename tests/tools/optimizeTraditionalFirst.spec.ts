import { describe, expect, it } from "vitest";
import { optimizeTraditionalFirst } from "../../src/tools/optimizeTraditionalFirst";
import { vi } from "vitest";

vi.mock("../../src/tools/calculateTaxes", () => ({
  calculateTaxes: vi.fn((income, _status) => {
    return income * 0.1; // Assume a flat 10% tax for simplicity
  }),
}));

vi.mock("../../src/tools/optimization", () => ({
  getThresholds: vi.fn((status) => ({
    ssBase1: status === "single" ? 25000 : 32000,
    ssBase2: status === "single" ? 34000 : 44000,
  })),
}));

describe("optimizeTraditionalFirst", () => {
  it("should withdraw from Traditional IRA first if balance is sufficient", () => {
    const result = optimizeTraditionalFirst(50000, 100000, 40000, 20000, "single");
    expect(result.fromTrad).toBe(22250); //taxes + spending goal
    expect(result.fromRoth).toBe(0);
    expect(result.taxesPaid).toBe(2250); // 10% tax on $20000 (ira withdrawl) + 2500 (ss taxable)
  });

  it("should withdraw from Roth only if Traditional IRA is insufficient", () => {
    const result = optimizeTraditionalFirst(50000, 10000, 40000, 20000, "single");
    expect(result.fromTrad).toBe(10000);
    expect(result.fromRoth).toBe(11000); // Remaining amount: 40K - 20K - 10K + 1K for tax
    expect(result.taxesPaid).toBe(1000); // 1K tax on $10k from ira
  });

  it("should withdraw from Roth if spending goal is not met with Traditional IRA", () => {
    const result = optimizeTraditionalFirst(5000, 5000, 40000, 20000, "single");
    expect(result.fromTrad).toBe(5000);
    expect(result.fromRoth).toBe(5000);
    expect(result.taxesPaid).toBe(500);// 10% tax on $500 (ira withdrawl) + 2500 (ss taxable)
  });

  it("should handle cases where both Roth and Traditional are insufficient", () => {
    const result = optimizeTraditionalFirst(1000, 1000, 40000, 20000, "single");
    expect(result.fromTrad).toBe(1000);
    expect(result.fromRoth).toBe(1000);
    expect(result.taxesPaid).toBe(100);
    expect(result.spendingGoal - (result.ssIncome + result.fromTrad + result.fromRoth - result.taxesPaid)).toBeCloseTo(18100, 0);
  });

  it("should correctly handle Social Security taxation when withdrawals push income over thresholds", () => {
    const result = optimizeTraditionalFirst(10000, 50000, 60000, 35000, "married");
    expect(result.fromTrad).toBeGreaterThan(0);
    expect(result.taxesPaid).toBeGreaterThan(0);
  });

  it("should not withdraw if Social Security alone meets the spending goal", () => {
    const result = optimizeTraditionalFirst(50000, 50000, 20000, 25000, "single");
    expect(result.fromTrad).toBe(0);
    expect(result.fromRoth).toBe(0);
    expect(result.taxesPaid).toBe(0);
  });
});
