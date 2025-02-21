import { calculateTaxes } from "./calculateTaxes";
import { getThresholds } from "./optimization";

export function optimizeTraditionalFirst(
  rothBalance: number,
  tradBalance: number,
  spendingGoal: number,
  ssIncome: number,
  filingStatus: "single" | "married"
) {
  let withdrawals = { 
    fromRoth: 0, 
    fromTrad: 0, 
    taxesPaid: 0, 
    ssIncome, 
    spendingGoal 
  };

  let provisionalIncome = ssIncome * 0.5; // Half of SS income is counted for provisional income
  let remainingSpending = spendingGoal - ssIncome; // Spending needed beyond SS income

  // Step 1: Withdraw from Traditional IRA first (taxable)
  if (tradBalance > 0 && remainingSpending > 0) {
    let estimatedTradWithdrawal = remainingSpending;
    let totalProvisionalIncome = provisionalIncome + estimatedTradWithdrawal;

    // Step 2: Calculate taxable portion of Social Security
    const { ssBase1, ssBase2 } = getThresholds(filingStatus);
    let ssTaxable = 0;
    
    if (totalProvisionalIncome > ssBase2) {
      ssTaxable = 0.85 * (totalProvisionalIncome - ssBase2) + 0.5 * (ssBase2 - ssBase1);
    } else if (totalProvisionalIncome > ssBase1) {
      ssTaxable = 0.5 * (totalProvisionalIncome - ssBase1);
    }

    // Step 3: Compute total taxable income
    let taxableIncome = ssTaxable + estimatedTradWithdrawal;

    // Step 4: Calculate progressive tax
    let tax = calculateTaxes(taxableIncome, filingStatus);

    // Step 5: Adjust Traditional IRA withdrawal to cover taxes
    let totalTradNeeded = remainingSpending + tax;
    withdrawals.fromTrad = Math.min(totalTradNeeded, tradBalance);
    withdrawals.taxesPaid = tax;

    // Step 6: Update remaining spending after Traditional IRA withdrawal
    remainingSpending -= (withdrawals.fromTrad - tax);
  }

  // Step 7: Use Roth withdrawals to cover any remaining spending (tax-free)
  if (remainingSpending > 0) {
    withdrawals.fromRoth = Math.min(remainingSpending, rothBalance);
  }

  // Step 8: Verify if total withdrawals meet the spending goal
  let totalWithdrawn = ssIncome + withdrawals.fromTrad + withdrawals.fromRoth - withdrawals.taxesPaid;
  if (Math.abs(totalWithdrawn - spendingGoal) > 0.01) {
    console.warn(`Warning: Unable to meet spending goal. Short by ${spendingGoal - totalWithdrawn}`);
  }

  return withdrawals;
}

