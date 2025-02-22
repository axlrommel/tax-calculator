import { describe, it, expect } from 'vitest';
import { calculateEffectiveTaxRate } from '../../src/tools/calculateEffectiveTaxRate';

describe('calculateEffectiveTaxRate', () => {
  // Test basic calculations
  describe('basic calculations', () => {
    it('should calculate correct rate for income in first bracket (single)', () => {
      const rate = calculateEffectiveTaxRate(10000, "single");
      expect(rate).toBeCloseTo(0.10, 4);
    });

    it('should calculate correct rate for income in first bracket (married)', () => {
      const rate = calculateEffectiveTaxRate(20000, "married");
      expect(rate).toBeCloseTo(0.10, 4);
    });

    it('should calculate correct effective rate for higher income (single)', () => {
      // $50,000 income spans first two brackets
      const rate = calculateEffectiveTaxRate(50000, "single");
      const expectedTax = (11000 * 0.10) + ((50000 - 11000) * 0.12);
      expect(rate).toBeCloseTo(expectedTax / 50000, 1);
    });
  });

  // Test bracket transitions
  describe('bracket transitions', () => {
    it('should handle single filer bracket transitions correctly', () => {
      // Test exact bracket boundaries
      const rate11k = calculateEffectiveTaxRate(11000, "single");
      const rate11001 = calculateEffectiveTaxRate(11001, "single");
      expect(rate11001).toBeGreaterThan(rate11k);
      
      const rate44725 = calculateEffectiveTaxRate(44725, "single");
      const rate44726 = calculateEffectiveTaxRate(44726, "single");
      expect(rate44726).toBeGreaterThan(rate44725);
    });

    it('should handle married filer bracket transitions correctly', () => {
      const rate22k = calculateEffectiveTaxRate(22000, "married");
      const rate22001 = calculateEffectiveTaxRate(22001, "married");
      expect(rate22001).toBeGreaterThan(rate22k);
      
      const rate89450 = calculateEffectiveTaxRate(89450, "married");
      const rate89451 = calculateEffectiveTaxRate(89451, "married");
      expect(rate89451).toBeGreaterThan(rate89450);
    });
  });

  // Test specific income levels
  describe('specific income levels', () => {
    it('should calculate correct rate for $100,000 (single)', () => {
      const rate = calculateEffectiveTaxRate(100000, "single");
      const expectedTax = 
        (11000 * 0.10) +
        ((44725 - 11000) * 0.12) +
        ((95375 - 44725) * 0.22) +
        ((100000 - 95375) * 0.24);
      expect(rate).toBeCloseTo(expectedTax / 100000, 4);
    });

    it('should calculate correct rate for $200,000 (married)', () => {
      const rate = calculateEffectiveTaxRate(200000, "married");
      const expectedTax = 
        (22000 * 0.10) +
        ((89450 - 22000) * 0.12) +
        ((190750 - 89450) * 0.22) +
        ((200000 - 190750) * 0.24);
      expect(rate).toBeCloseTo(expectedTax / 200000, 4);
    });
  });

  // Test edge cases
  describe('edge cases', () => {
    it('should handle zero income', () => {
      expect(calculateEffectiveTaxRate(0, "single")).toBe(0);
      expect(calculateEffectiveTaxRate(0, "married")).toBe(0);
    });

    it('should handle negative income', () => {
      expect(calculateEffectiveTaxRate(-1000, "single")).toBe(0);
    });

    it('should handle very high incomes', () => {
      const rate = calculateEffectiveTaxRate(1000000, "single");
      expect(rate).toBeGreaterThan(0.30); // Should be relatively high but less than top marginal rate
      expect(rate).toBeLessThan(0.37); // Should never exceed top marginal rate
    });
  });

  // Test for reasonable outputs
  describe('reasonable outputs', () => {
    it('should never return a rate higher than the maximum marginal rate', () => {
      const incomes = [10000, 50000, 100000, 500000, 1000000];
      incomes.forEach(income => {
        const rate = calculateEffectiveTaxRate(income, "single");
        expect(rate).toBeLessThanOrEqual(0.37);
      });
    });

    it('should return increasing rates for increasing incomes', () => {
      const incomes = [20000, 50000, 100000, 200000];
      let previousRate = 0;
      incomes.forEach(income => {
        const rate = calculateEffectiveTaxRate(income, "single");
        expect(rate).toBeGreaterThan(previousRate);
        previousRate = rate;
      });
    });
  });
});