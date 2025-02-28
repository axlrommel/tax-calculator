import { calculateTaxes } from "./calculateTaxes";
import { getThresholds } from "./constants";

export function optimizeRothFirst(
  rothBalance: number, 
  tradBalance: number, 
  spendingGoal: number,
  ssIncome: number,  
  filingStatus: "single" | "married") {

  let taxableIncome = 0;
  let withdrawals = {
    fromRoth: 0,
    fromTrad: 0,
    taxesPaid: 0,
    ssIncome,
    spendingGoal
  };

  let provisionalIncome = ssIncome * 0.5; // Half of ss income is counted for provisional income

  // Step 1: Calculate remaining spending needed after Social Security
  let remainingSpending = spendingGoal - ssIncome;

  // If remaining spending is negative or zero, no withdrawals needed
  if (remainingSpending <= 0) {
    return withdrawals;
  }

  // Step 2: Use Roth IRA first since it doesn't affect provisional income
  if (remainingSpending > 0 && rothBalance > 0) {
    withdrawals.fromRoth = Math.min(remainingSpending, rothBalance);
    remainingSpending -= withdrawals.fromRoth;
  }

  // Step 3: If still more needed, calculate Traditional IRA withdrawal
  if (remainingSpending > 0) {
    // Calculate taxes on potential Traditional IRA withdrawal
    let estimatedTradWithdrawal = remainingSpending;

    // Update provisional income with Traditional IRA withdrawal
    let totalProvisionalIncome = provisionalIncome + estimatedTradWithdrawal;

    // Calculate taxable portion of Social Security
    const threshold = getThresholds(filingStatus);
    let ssTaxable = 0;
    if (totalProvisionalIncome > threshold.ssBase2) {
      ssTaxable = 0.85 * (totalProvisionalIncome - threshold.ssBase2) + 0.5 * (threshold.ssBase2 - threshold.ssBase1);
    } else if (totalProvisionalIncome > threshold.ssBase1) {
      ssTaxable = 0.5 * (totalProvisionalIncome - threshold.ssBase1);
    }

    // Calculate total taxable income
    taxableIncome = ssTaxable + estimatedTradWithdrawal;

    // Calculate taxes
    let tax = calculateTaxes(taxableIncome, filingStatus);

    // Total needed from Traditional IRA is remaining spending
    withdrawals.fromTrad = Math.min(remainingSpending, tradBalance);
    withdrawals.taxesPaid = tax;
  }

  return withdrawals;
}