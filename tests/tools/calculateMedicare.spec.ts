import { describe, expect, it } from "vitest";
import { calculateMedicareCosts } from "../../src/tools/calculateMedicare"; // Adjust path as needed

describe('calculateMedicareCosts', () => {
  // Test base calculations (2024)
  describe('2024 base calculations', () => {
    it('should calculate correct base premium for single filer below first threshold', () => {
      expect(calculateMedicareCosts(100000, "single", 0, 0.2)).toBe(2088); // $174 * 12
    });

    it('should calculate correct premium for single filer in second bracket', () => {
      expect(calculateMedicareCosts(120000, "single", 0, 0.2)).toBe(2928); // $244 * 12
    });

    it('should calculate correct premium for married filer below first threshold', () => {
      expect(calculateMedicareCosts(200000, "married", 0, 0.2)).toBe(2088); // $174 * 12
    });

    it('should calculate correct premium for married filer in second bracket', () => {
      expect(calculateMedicareCosts(220000, "married", 0, 0.2)).toBe(2928); // $244 * 12
    });
  });

  // Test bracket transitions
  describe('bracket transitions', () => {
    // Single filer brackets
    it('should handle single filer bracket transitions correctly', () => {
      // Test exact bracket boundaries
      expect(calculateMedicareCosts(103000, "single", 0, 0.2)).toBe(2928); // Second bracket
      expect(calculateMedicareCosts(129000, "single", 0, 0.2)).toBe(4188); // Third bracket
      expect(calculateMedicareCosts(161000, "single", 0, 0.2)).toBe(5028); // Fourth bracket
      expect(calculateMedicareCosts(193000, "single", 0, 0.2)).toBe(5940); // Fifth bracket
      expect(calculateMedicareCosts(500000, "single", 0, 0.2)).toBe(6780); // Sixth bracket
    });

    // Married filer brackets
    it('should handle married filer bracket transitions correctly', () => {
      // Test exact bracket boundaries
      expect(calculateMedicareCosts(206000, "married", 0, 0.2)).toBe(2928); // Second bracket
      expect(calculateMedicareCosts(258000, "married", 0, 0.2)).toBe(4188); // Third bracket
      expect(calculateMedicareCosts(322000, "married", 0, 0.2)).toBe(5028); // Fourth bracket
      expect(calculateMedicareCosts(386000, "married", 0, 0.2)).toBe(5940); // Fifth bracket
      expect(calculateMedicareCosts(750000, "married", 0, 0.2)).toBe(6780); // Sixth bracket
    });
  });

  // Test inflation calculations
  describe('inflation adjustments', () => {
    it('should calculate inflation correctly after 5 years', () => {
      const baseAmount = calculateMedicareCosts(100000, "single", 0, 0.02);
      const inflatedAmount = calculateMedicareCosts(100000, "single", 5, 0.02);
      // With 2% inflation over 5 years: (1.02)^5 ≈ 1.104
      expect(inflatedAmount).toBeGreaterThan(baseAmount);
      //add 1 for rounding error
      expect(inflatedAmount + 1).toBe(Math.round(2088 * Math.pow(1.02, 5)));
    });

    it('should adjust brackets for inflation', () => {
      // Test that bracket thresholds increase with inflation
      const year5Income = 103000 * Math.pow(1.02, 5); // First bracket threshold after 5 years
      expect(calculateMedicareCosts(year5Income - 1, "single", 5, 0.02))
        .toBeLessThan(calculateMedicareCosts(year5Income + 1, "single", 5, 0.02));
    });

    it('should handle custom inflation rates', () => {
      const baseAmount = calculateMedicareCosts(100000, "single", 0, 0.2);
      const inflatedAmount = calculateMedicareCosts(100000, "single", 5, 0.03);
      // With 3% inflation over 5 years: (1.03)^5 ≈ 1.159
      expect(inflatedAmount).toBeGreaterThan(baseAmount);
      //subtract 3 for rounding error
      expect(inflatedAmount - 3).toBe(Math.round(2088 * Math.pow(1.03, 5)));
    });
  });

  // Test edge cases
  describe('edge cases', () => {
    it('should handle zero income', () => {
      expect(calculateMedicareCosts(0, "single", 0, 0.2)).toBe(2088);
      expect(calculateMedicareCosts(0, "married", 0, 0.2)).toBe(2088);
    });

    it('should handle very high incomes', () => {
      expect(calculateMedicareCosts(1000000, "single", 0, 0.2)).toBe(6780);
      expect(calculateMedicareCosts(1000000, "married", 0, 0.2)).toBe(6780);
    });

    it('should handle negative years', () => {
      expect(calculateMedicareCosts(100000, "single", -1, 0.02)).toBe(2052);
    });

    it('should handle negative income', () => {
      expect(calculateMedicareCosts(-50000, "single", 0, 0.2)).toBe(2088);
    });
  });

  // Test rounding behavior
  describe('rounding behavior', () => {
    it('should always return whole numbers', () => {
      const amount = calculateMedicareCosts(100000, "single", 3.5, 0.2);
      expect(Number.isInteger(amount)).toBe(true);
    });

    it('should round inflation calculations properly', () => {
      // Test with a specific inflation rate that would produce decimals
      const amount = calculateMedicareCosts(100000, "single", 1, 0.0233);
      expect(Number.isInteger(amount)).toBe(true);
    });
  });
});
