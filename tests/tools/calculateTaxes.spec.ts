import { describe, it, expect } from 'vitest';
import { calculateTaxes } from '../../src/tools/calculateTaxes'; // Adjust the import path as needed

describe('calculateTaxes', () => {
  it('should calculate taxes for single filer within the first bracket', () => {
    const income = 10000;
    const filingStatus = 'single';
    const tax = calculateTaxes(income, filingStatus);
    expect(tax).toBe(10000 * 0.1); // 10% of income
  });

  it('should calculate taxes for single filer in the second bracket', () => {
    const income = 50000;
    const filingStatus = 'single';
    const tax = calculateTaxes(income, filingStatus);
    // (11600 * 0.10) + ((47150 - 11600) * 0.12) + ((50000 - 47150) * 0.22)
    expect(tax).toBe(1160 + (35550 * 0.12) + (2850 * 0.22));
    expect(tax).toBe(6053); // Explicit total for clarity
  });

  it('should calculate taxes for married filer within the first bracket', () => {
    const income = 20000;
    const filingStatus = 'married';
    const tax = calculateTaxes(income, filingStatus);
    expect(tax).toBe(20000 * 0.1); // 10% of income
  });

  it('should calculate taxes for married filer in the third bracket', () => {
    const income = 250000;
    const filingStatus = 'married';
    const tax = calculateTaxes(income, filingStatus);
    // Calculation: (23200 * 0.1) + ((94300 - 23200) * 0.12) + ((201050 - 94300) * 0.22) + ((250000 - 201050) * 0.24)
    expect(tax).toBe(2320 + (71100 * 0.12) + (106750 * 0.22) + (48950 * 0.24));
  });

  it('should calculate taxes for single filer exceeding the highest bracket', () => {
    const income = 700000;
    const filingStatus = 'single';
    const tax = calculateTaxes(income, filingStatus);
    // Calculation: (11600 * 0.1) + ((47150 - 11600) * 0.12) + ((100525 - 47150) * 0.22) + ((191950 - 100525) * 0.24) + ((243725 - 191950) * 0.32) + ((609350 - 243725) * 0.35) + ((700000 - 609350) * 0.37)
    expect(tax).toBe(1160 + (35550 * 0.12) + (53375 * 0.22) + (91425 * 0.24) + (51775 * 0.32) + (365625 * 0.35) + (90650 * 0.37));
  });

  it('should calculate taxes for married filer exceeding the highest bracket', () => {
    const income = 800000;
    const filingStatus = 'married';
    const tax = calculateTaxes(income, filingStatus);
    // Calculation: (23200 * 0.1) + ((94300 - 23200) * 0.12) + ((201050 - 94300) * 0.22) + ((383900 - 201050) * 0.24) + ((487450 - 383900) * 0.32) + ((731200 - 487450) * 0.35) + ((800000 - 731200) * 0.37)
    expect(tax).toBe(2320 + (71100 * 0.12) + (106750 * 0.22) + (182850 * 0.24) + (103550 * 0.32) + (243750 * 0.35) + (68800 * 0.37));
  });

  it('should return 0 for zero income', () => {
    const income = 0;
    const filingStatus = 'single';
    const tax = calculateTaxes(income, filingStatus);
    expect(tax).toBe(0);
  });
});