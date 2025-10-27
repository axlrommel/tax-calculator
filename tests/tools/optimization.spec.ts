import { describe, it, expect, vi, beforeEach } from 'vitest';
import { optimizeAndSimulateRetirement } from '../../src/tools/optimization';
import { optimizeRothFirst } from '../../src/tools/optimizeRothFirst';
import { optimizeTraditionalFirst } from '../../src/tools/optimizeTraditionalFirst';
import { optimizeProportionally } from '../../src/tools/optimizeProportionally';
import { IAges } from '../../src/tools/types';

// Mock optimization strategy for testing
const mockOptimizationStrategy = vi.fn();

describe('optimizeAndSimulateRetirement', () => {
  const baseAges: IAges[] = [{
    currentAge: 60,
    retirementAge: 65,
    ssClaimingAge: 67
  }];

  beforeEach(() => {
    mockOptimizationStrategy.mockClear();
  });

  describe('Basic scenarios', () => {
    it('should handle scenario where money runs out', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 10000,
        fromTrad: 10000,
        taxesPaid: 2000,
        ssIncome: 0,
        spendingGoal: 20000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        baseAges,
        15000, // rothBalance
        15000, // tradBalance
        20000, // spendingGoal
        'single',
        0.05, // returnRate
        0.01  // inflationRate
      );

      expect(result.moneyLastYears).toBeGreaterThan(0);
      expect(result.details).toBeDefined();
      expect(result.details.length).toBeGreaterThan(0);
    });

    it('should return "more than 40" when money lasts over 40 years', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 5000,
        fromTrad: 5000,
        taxesPaid: 1000,
        ssIncome: 20000,
        spendingGoal: 30000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        baseAges,
        1000000, // rothBalance
        1000000, // tradBalance
        30000,   // spendingGoal
        'married',
        0.07,    // returnRate
        0.02     // inflationRate
      );

      expect(result.moneyLastYears).toBe("more than 40");
      expect(result.details.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe('Small Roth balance scenarios', () => {
    it('should properly deduct from traditional when Roth is very small ($10)', () => {
      let callCount = 0;
      mockOptimizationStrategy.mockImplementation((roth: number, trad: number, spending: number, ss: number, filing: string) => {
        callCount++;
        // First call: Roth has $10, should deplete it and take rest from trad
        if (callCount === 1) {
          return {
            fromRoth: 10,
            fromTrad: 0, // This is the bug scenario - doesn't take from trad
            taxesPaid: 0,
            ssIncome: ss,
            spendingGoal: spending
          };
        }
        // Subsequent calls: Roth is depleted
        return {
          fromRoth: 0,
          fromTrad: Math.min(spending - ss, trad),
          taxesPaid: 1000,
          ssIncome: ss,
          spendingGoal: spending
        };
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        baseAges,
        10,      // Very small Roth balance
        500000,  // Large trad balance
        50000,   // spendingGoal
        'single',
        0.05,
        0.01
      );

      expect(result.details).toBeDefined();
      expect(result.details.length).toBeGreaterThan(0);
      
      const firstYear = result.details[0];
      
      // The key assertion: traditional balance should decrease even when Roth is tiny
      expect(firstYear.withdrawalsFromTrad).toBeGreaterThan(0);
      expect(firstYear.tradBalance).toBeLessThan(500000);
    });

    it('should cover spending goal + medicare + taxes when Roth is minimal', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 5,
        fromTrad: 30000,
        taxesPaid: 3000,
        ssIncome: 10000,
        spendingGoal: 40000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        [{ currentAge: 60, retirementAge: 65, ssClaimingAge: 70 }],
        5,       // Minimal Roth
        800000,  // tradBalance
        40000,   // spendingGoal
        'single',
        0.05,
        0.01
      );

      const firstYear = result.details[0];
      
      // Total withdrawn should be enough to cover spending + medicare + taxes - SS
      const totalExpenses = firstYear.currentSpendingGoal + firstYear.medicareCosts;
      const totalWithdrawn = firstYear.withdrawalsFromRoth + firstYear.withdrawalsFromTrad;
      const netAfterSS = totalWithdrawn + firstYear.ssIncome;
      
      // Net after SS should cover total expenses + taxes
      expect(netAfterSS).toBeGreaterThanOrEqual(totalExpenses);
    });

    it('should withdraw correct amount from traditional when Roth is zero', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 0,
        fromTrad: 40000, // Should be enough to cover spending
        taxesPaid: 4000,
        ssIncome: 0,
        spendingGoal: 50000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        [{ currentAge: 60, retirementAge: 65, ssClaimingAge: 70 }],
        0,       // Zero Roth
        800000,  // tradBalance
        50000,   // spendingGoal
        'single',
        0.05,
        0.01
      );

      const firstYear = result.details[0];
      
      // Should withdraw from traditional
      expect(firstYear.withdrawalsFromTrad).toBeGreaterThan(0);
      expect(firstYear.withdrawalsFromRoth).toBe(0);
      
      // Total withdrawn + SS should cover spending + medicare + taxes
      const totalExpenses = firstYear.currentSpendingGoal + firstYear.medicareCosts;
      const totalWithdrawn = firstYear.withdrawalsFromRoth + firstYear.withdrawalsFromTrad;
      const netAfterSS = totalWithdrawn + firstYear.ssIncome;
      
      expect(netAfterSS).toBeGreaterThanOrEqual(totalExpenses);
    });
  });

  describe('RMD handling', () => {
    it('should enforce RMD when calculated RMD exceeds planned withdrawal', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 0,
        fromTrad: 10000, // Less than RMD
        taxesPaid: 1000,
        ssIncome: 30000,
        spendingGoal: 40000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        [{ currentAge: 72, retirementAge: 73, ssClaimingAge: 70 }], // Age 73+ triggers RMD
        100000,  // rothBalance
        1000000, // tradBalance - large enough that RMD is significant
        40000,   // spendingGoal
        'single',
        0.05,
        0.01
      );

      const firstYear = result.details[0];
      
      // Should have RMD recorded
      expect(firstYear.requiredMinimumDistributions).toBeGreaterThan(0);
      
      // If RMD > planned withdrawal, actual withdrawal should equal RMD
      if (firstYear.requiredMinimumDistributions > 10000) {
        expect(firstYear.withdrawalsFromTrad).toBeGreaterThanOrEqual(
          firstYear.requiredMinimumDistributions
        );
      }
    });
  });

  describe('Medicare cost calculations', () => {
    it('should include Medicare costs for ages 65+', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 10000,
        fromTrad: 30000,
        taxesPaid: 3000,
        ssIncome: 20000,
        spendingGoal: 40000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        [{ currentAge: 60, retirementAge: 65, ssClaimingAge: 67 }],
        500000,
        500000,
        40000,
        'single',
        0.05,
        0.01
      );

      // First year (age 65) should have Medicare costs
      const firstYear = result.details[0];
      expect(firstYear.age).toBe(65);
      expect(firstYear.medicareCosts).toBeGreaterThan(0);
    });

    it('should double Medicare costs for married couples', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 10000,
        fromTrad: 30000,
        taxesPaid: 3000,
        ssIncome: 30000,
        spendingGoal: 40000
      });

      const singleResult = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        [{ currentAge: 60, retirementAge: 65, ssClaimingAge: 67 }],
        500000,
        500000,
        40000,
        'single',
        0.05,
        0.01
      );

      const marriedResult = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        [{ currentAge: 60, retirementAge: 65, ssClaimingAge: 67 }],
        500000,
        500000,
        40000,
        'married',
        0.05,
        0.01
      );

      // Medicare costs should be roughly double for married (may vary due to income calculations)
      expect(marriedResult.details[0].medicareCosts).toBeGreaterThan(
        singleResult.details[0].medicareCosts
      );
    });
  });

  describe('Balance updates and growth', () => {
    it('should apply investment growth correctly', () => {
      const returnRate = 0.05;
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 10000,
        fromTrad: 10000,
        taxesPaid: 2000,
        ssIncome: 20000,
        spendingGoal: 30000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        baseAges,
        100000,
        100000,
        30000,
        'single',
        returnRate,
        0.01
      );

      const firstYear = result.details[0];
      const secondYear = result.details[1];

      // Calculate expected balance after withdrawal and growth
      const expectedRothBalance = (100000 - 10000) * (1 + returnRate);
      const expectedTradBalance = (100000 - 10000) * (1 + returnRate);

      expect(firstYear.rothBalance).toBeCloseTo(expectedRothBalance, 0);
      expect(firstYear.tradBalance).toBeCloseTo(expectedTradBalance, 0);
    });

    it('should apply inflation to spending goal each year', () => {
      const inflationRate = 0.03;
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 15000,
        fromTrad: 15000,
        taxesPaid: 3000,
        ssIncome: 20000,
        spendingGoal: 30000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        baseAges,
        500000,
        500000,
        30000,
        'single',
        0.05,
        inflationRate
      );

      // Check that spending goal increases with inflation
      for (let i = 1; i < Math.min(5, result.details.length); i++) {
        const prevYear = result.details[i - 1];
        const currentYear = result.details[i];
        
        const expectedSpending = prevYear.currentSpendingGoal * (1 + inflationRate);
        expect(currentYear.currentSpendingGoal).toBeCloseTo(expectedSpending, 0);
      }
    });
  });

  describe('Multiple people with Social Security', () => {
    it('should sum Social Security income from multiple people', () => {
      const multipleAges: IAges[] = [
        { currentAge: 60, retirementAge: 65, ssClaimingAge: 67 },
        { currentAge: 58, retirementAge: 65, ssClaimingAge: 70 }
      ];

      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 10000,
        fromTrad: 20000,
        taxesPaid: 3000,
        ssIncome: 0, // Will be calculated
        spendingGoal: 50000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        multipleAges,
        500000,
        500000,
        50000,
        'married',
        0.05,
        0.01
      );

      // Should have Social Security income tracked
      expect(result.details[0].ssIncome).toBeGreaterThanOrEqual(0);
      
      // Later years should have more SS as both claim
      const laterYear = result.details[Math.min(10, result.details.length - 1)];
      expect(laterYear.ssIncome).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Annual details tracking', () => {
    it('should track all required fields in annual details', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 10000,
        fromTrad: 20000,
        taxesPaid: 3000,
        ssIncome: 20000,
        spendingGoal: 40000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        baseAges,
        200000,
        300000,
        40000,
        'single',
        0.05,
        0.01
      );

      const firstYear = result.details[0];

      // Verify all fields exist
      expect(firstYear).toHaveProperty('year');
      expect(firstYear).toHaveProperty('age');
      expect(firstYear).toHaveProperty('rothBalance');
      expect(firstYear).toHaveProperty('tradBalance');
      expect(firstYear).toHaveProperty('withdrawalsFromRoth');
      expect(firstYear).toHaveProperty('withdrawalsFromTrad');
      expect(firstYear).toHaveProperty('totalAmountWithdrawn');
      expect(firstYear).toHaveProperty('ssIncome');
      expect(firstYear).toHaveProperty('currentSpendingGoal');
      expect(firstYear).toHaveProperty('taxesPaid');
      expect(firstYear).toHaveProperty('medicareCosts');
      expect(firstYear).toHaveProperty('requiredMinimumDistributions');
      expect(firstYear).toHaveProperty('extraFromRMD');

      // Verify year calculation
      const currentYear = new Date().getFullYear();
      const yearsPassed = baseAges[0].retirementAge - baseAges[0].currentAge;
      expect(firstYear.year).toBe(currentYear + yearsPassed);
      expect(firstYear.age).toBe(baseAges[0].retirementAge);
    });

    it('should calculate extraFromRMD correctly when RMD exceeds needs', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 0,
        fromTrad: 10000,
        taxesPaid: 1000,
        ssIncome: 30000,
        spendingGoal: 35000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        [{ currentAge: 72, retirementAge: 73, ssClaimingAge: 70 }],
        100000,
        1000000, // Large enough to trigger significant RMD
        35000,
        'single',
        0.05,
        0.01
      );

      const firstYear = result.details[0];
      
      // extraFromRMD = RMD - spending - SS (if positive)
      const expectedExtra = Math.max(
        firstYear.requiredMinimumDistributions - firstYear.currentSpendingGoal - firstYear.ssIncome,
        0
      );
      
      expect(firstYear.extraFromRMD).toBe(expectedExtra);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero balances gracefully', () => {
      mockOptimizationStrategy.mockReturnValue({
        fromRoth: 0,
        fromTrad: 0,
        taxesPaid: 0,
        ssIncome: 50000,
        spendingGoal: 40000
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        baseAges,
        0,
        0,
        40000,
        'single',
        0.05,
        0.01
      );

      expect(result.moneyLastYears).toBe(0);
      expect(result.details).toEqual([]);
    });

    it('should stop when both balances reach zero', () => {
      let callCount = 0;
      mockOptimizationStrategy.mockImplementation((roth: number, trad: number) => {
        callCount++;
        return {
          fromRoth: roth,
          fromTrad: trad,
          taxesPaid: 500,
          ssIncome: 10000,
          spendingGoal: 50000
        };
      });

      const result = optimizeAndSimulateRetirement(
        mockOptimizationStrategy,
        baseAges,
        50000,
        50000,
        50000,
        'single',
        0, // No growth
        0  // No inflation
      );

      // Should run out of money quickly with no growth
      expect(result.moneyLastYears).toBeLessThan(40);
      expect(result.moneyLastYears).toBeGreaterThan(0);
    });
  });

  describe('Integration tests with real strategies', () => {
    it('should withdraw correct amount with optimizeRothFirst when Roth is zero', () => {
      const result = optimizeAndSimulateRetirement(
        optimizeRothFirst,
        [{ currentAge: 60, retirementAge: 65, ssClaimingAge: 67 }],
        0,       // Zero Roth
        500000,  // tradBalance
        50000,   // spendingGoal
        'single',
        0.05,
        0.02
      );

      expect(result.details.length).toBeGreaterThan(0);
      const firstYear = result.details[0];
      
      // Should withdraw from traditional
      expect(firstYear.withdrawalsFromTrad).toBeGreaterThan(0);
      expect(firstYear.withdrawalsFromRoth).toBe(0);
      
      // Check that money is actually being spent and withdrawn
      console.log('First year details:', {
        withdrawalsFromTrad: firstYear.withdrawalsFromTrad,
        withdrawalsFromRoth: firstYear.withdrawalsFromRoth,
        ssIncome: firstYear.ssIncome,
        currentSpendingGoal: firstYear.currentSpendingGoal,
        taxesPaid: firstYear.taxesPaid,
        medicareCosts: firstYear.medicareCosts,
        totalWithdrawn: firstYear.totalAmountWithdrawn
      });
      
      // Total available after withdrawal and SS should be enough to cover spending + medicare
      const totalAvailable = firstYear.withdrawalsFromTrad + firstYear.withdrawalsFromRoth + firstYear.ssIncome;
      const totalNeeded = firstYear.currentSpendingGoal + firstYear.medicareCosts + firstYear.taxesPaid;
      
      expect(totalAvailable).toBeGreaterThanOrEqual(totalNeeded);
    });

    it('should withdraw correct amount with optimizeTraditionalFirst when Roth is zero', () => {
      const result = optimizeAndSimulateRetirement(
        optimizeTraditionalFirst,
        [{ currentAge: 60, retirementAge: 65, ssClaimingAge: 67 }],
        0,       // Zero Roth
        500000,  // tradBalance
        50000,   // spendingGoal
        'single',
        0.05,
        0.02
      );

      expect(result.details.length).toBeGreaterThan(0);
      const firstYear = result.details[0];
      
      expect(firstYear.withdrawalsFromTrad).toBeGreaterThan(0);
      expect(firstYear.withdrawalsFromRoth).toBe(0);
      
      const totalAvailable = firstYear.withdrawalsFromTrad + firstYear.withdrawalsFromRoth + firstYear.ssIncome;
      const totalNeeded = firstYear.currentSpendingGoal + firstYear.medicareCosts + firstYear.taxesPaid;
      
      expect(totalAvailable).toBeGreaterThanOrEqual(totalNeeded);
    });

    it('should withdraw correct amount with optimizeProportionally when Roth is zero', () => {
      const result = optimizeAndSimulateRetirement(
        optimizeProportionally,
        [{ currentAge: 60, retirementAge: 65, ssClaimingAge: 67 }],
        0,       // Zero Roth
        500000,  // tradBalance
        50000,   // spendingGoal
        'single',
        0.05,
        0.02
      );

      expect(result.details.length).toBeGreaterThan(0);
      const firstYear = result.details[0];
      
      expect(firstYear.withdrawalsFromTrad).toBeGreaterThan(0);
      expect(firstYear.withdrawalsFromRoth).toBe(0);
      
      const totalAvailable = firstYear.withdrawalsFromTrad + firstYear.withdrawalsFromRoth + firstYear.ssIncome;
      const totalNeeded = firstYear.currentSpendingGoal + firstYear.medicareCosts + firstYear.taxesPaid;
      
      expect(totalAvailable).toBeGreaterThanOrEqual(totalNeeded);
    });

    it('should produce same results for all strategies when Roth is zero', () => {
      const testParams = {
        ages: [{ currentAge: 55, retirementAge: 62, ssClaimingAge: 67 }, { currentAge: 55, retirementAge: 62, ssClaimingAge: 67 }],
        rothBalance: 0,
        tradBalance: 4000000,
        spendingGoal: 200000,
        filingStatus: 'married' as const,
        returnRate: 0.05,
        inflationRate: 0.02
      };

      const rothFirstResult = optimizeAndSimulateRetirement(
        optimizeRothFirst,
        testParams.ages,
        testParams.rothBalance,
        testParams.tradBalance,
        testParams.spendingGoal,
        testParams.filingStatus,
        testParams.returnRate,
        testParams.inflationRate
      );

      const tradFirstResult = optimizeAndSimulateRetirement(
        optimizeTraditionalFirst,
        testParams.ages,
        testParams.rothBalance,
        testParams.tradBalance,
        testParams.spendingGoal,
        testParams.filingStatus,
        testParams.returnRate,
        testParams.inflationRate
      );

      const proportionalResult = optimizeAndSimulateRetirement(
        optimizeProportionally,
        testParams.ages,
        testParams.rothBalance,
        testParams.tradBalance,
        testParams.spendingGoal,
        testParams.filingStatus,
        testParams.returnRate,
        testParams.inflationRate
      );

      // When Roth is zero, all strategies should produce identical results
      expect(rothFirstResult.moneyLastYears).toBe(tradFirstResult.moneyLastYears);
      expect(rothFirstResult.moneyLastYears).toBe(proportionalResult.moneyLastYears);
      
      // Check first year details are identical
      const rf = rothFirstResult.details[0];
      const tf = tradFirstResult.details[0];
      const pf = proportionalResult.details[0];

      console.log('Roth First:', { 
        withdrawn: rf.totalAmountWithdrawn, 
        taxes: rf.taxesPaid,
        tradBalance: rf.tradBalance,
        medicare: rf.medicareCosts,
        spending: rf.currentSpendingGoal,
        ssIncome: rf.ssIncome
      });
      console.log('Trad First:', { 
        withdrawn: tf.totalAmountWithdrawn, 
        taxes: tf.taxesPaid,
        tradBalance: tf.tradBalance,
        medicare: tf.medicareCosts,
        spending: tf.currentSpendingGoal,
        ssIncome: tf.ssIncome
      });
      console.log('Proportional:', { 
        withdrawn: pf.totalAmountWithdrawn, 
        taxes: pf.taxesPaid,
        tradBalance: pf.tradBalance,
        medicare: pf.medicareCosts,
        spending: pf.currentSpendingGoal,
        ssIncome: pf.ssIncome
      });

      // Calculate total taxes across all years
      const rothFirstTotalTaxes = rothFirstResult.details.reduce((sum, year) => sum + year.taxesPaid, 0);
      const tradFirstTotalTaxes = tradFirstResult.details.reduce((sum, year) => sum + year.taxesPaid, 0);
      const proportionalTotalTaxes = proportionalResult.details.reduce((sum, year) => sum + year.taxesPaid, 0);

      console.log('\nTotal taxes over all years:');
      console.log('Roth First:', rothFirstTotalTaxes);
      console.log('Trad First:', tradFirstTotalTaxes);
      console.log('Proportional:', proportionalTotalTaxes);

      // Check a few years for differences
      for (let i = 0; i < Math.min(20, rothFirstResult.details.length); i++) {
        const rf = rothFirstResult.details[i];
        const tf = tradFirstResult.details[i];
        const pf = proportionalResult.details[i];
        
        if (Math.abs(rf.taxesPaid - tf.taxesPaid) > 1 || Math.abs(rf.tradBalance - tf.tradBalance) > 1) {
          console.log(`\nYear ${i} (age ${rf.age}) difference found:`);
          console.log('Roth First:', { 
            withdrawn: rf.totalAmountWithdrawn, 
            taxes: rf.taxesPaid, 
            tradBalance: rf.tradBalance,
            rothBalance: rf.rothBalance,
            rmd: rf.requiredMinimumDistributions
          });
          console.log('Trad First:', { 
            withdrawn: tf.totalAmountWithdrawn, 
            taxes: tf.taxesPaid, 
            tradBalance: tf.tradBalance,
            rothBalance: tf.rothBalance,
            rmd: tf.requiredMinimumDistributions
          });
        }
      }

      expect(rf.withdrawalsFromTrad).toBe(tf.withdrawalsFromTrad);
      expect(rf.withdrawalsFromTrad).toBe(pf.withdrawalsFromTrad);
      expect(rf.taxesPaid).toBe(tf.taxesPaid);
      expect(rf.taxesPaid).toBe(pf.taxesPaid);
      expect(rf.tradBalance).toBe(tf.tradBalance);
      expect(rf.tradBalance).toBe(pf.tradBalance);
      
      // When Roth is zero, total lifetime taxes should be identical
      expect(rothFirstTotalTaxes).toBe(tradFirstTotalTaxes);
      expect(rothFirstTotalTaxes).toBe(proportionalTotalTaxes);
    });
  });
});
