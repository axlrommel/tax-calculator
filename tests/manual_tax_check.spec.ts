import { describe, it, expect } from 'vitest';
import { calculateTaxes } from '../src/tools/calculateTaxes';
import { getThresholds } from '../src/tools/constants';

describe('Manual tax calculation verification', () => {
  it('should calculate taxes correctly for $170k withdrawal + $37k SS (married)', () => {
    const tradWithdrawal = 170000;
    const ssIncome = 37000;
    const filingStatus = 'married';

    // Calculate provisional income
    const provisionalIncome = (ssIncome * 0.5) + tradWithdrawal;
    console.log('Provisional Income:', provisionalIncome);

    // Get SS taxation thresholds
    const { ssBase1, ssBase2 } = getThresholds(filingStatus);
    console.log('SS Thresholds - Base1:', ssBase1, 'Base2:', ssBase2);

    // Calculate taxable portion of Social Security
    let ssTaxable = 0;
    if (provisionalIncome > ssBase2) {
      ssTaxable = 0.85 * (provisionalIncome - ssBase2) + 0.5 * (ssBase2 - ssBase1);
    } else if (provisionalIncome > ssBase1) {
      ssTaxable = 0.5 * (provisionalIncome - ssBase1);
    }
    console.log('Taxable SS:', ssTaxable);

    // Calculate total taxable income
    const taxableIncome = ssTaxable + tradWithdrawal;
    console.log('Total Taxable Income:', taxableIncome);

    // Calculate taxes
    const taxes = calculateTaxes(taxableIncome, filingStatus);
    console.log('Federal Taxes:', taxes);
    console.log('Effective Tax Rate:', ((taxes / (tradWithdrawal + ssIncome)) * 100).toFixed(2) + '%');

    expect(taxes).toBeGreaterThan(0);
  });
});
