import { getThresholds } from "./getTaxableSS";

export function optimizeRothFirst(
  rothBalance: number, 
  tradBalance: number, 
  spendingGoal: number,
  ssIncome: number, 
  provisionalIncome: number, 
  filingStatus: "single" | "married") {

  let taxableIncome = 0;
  let withdrawals = {
    fromRoth: 0,
    fromTrad: 0,
    taxesPaid: 0,
    ssIncome: ssIncome,
    spendingGoal
  };

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
      ssTaxable = ssIncome * 0.85;
    } else if (totalProvisionalIncome > threshold.ssBase1) {
      ssTaxable = ssIncome * 0.5;
    }

    // Calculate total taxable income
    taxableIncome = ssTaxable + estimatedTradWithdrawal;

    // Calculate taxes
    let tax = 0;
    let taxRates = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
    let taxBrackets = filingStatus === "married" ?
      [23200, 94200, 201050, 383900, 470700, 628300]
      : [11600, 47150, 100525, 191950, 243725, 609350];

    let prevBracket = 0;
    for (let i = 0; i < taxBrackets.length; i++) {
      if (taxableIncome > prevBracket) {
        let taxableAtRate = Math.min(taxableIncome, taxBrackets[i]) - prevBracket;
        tax += taxableAtRate * taxRates[i];
        prevBracket = taxBrackets[i];
      } else {
        break;
      }
    }

    // Total needed from Traditional IRA is remaining spending plus taxes
    let totalTradNeeded = remainingSpending + tax;
    withdrawals.fromTrad = Math.min(totalTradNeeded, tradBalance);
    withdrawals.taxesPaid = tax;
  }

  // Calculate final numbers
  let totalWithdrawn = ssIncome + withdrawals.fromRoth + withdrawals.fromTrad - withdrawals.taxesPaid;

  // Verify we meet spending goal (within rounding error)
  if (Math.abs(totalWithdrawn - spendingGoal) > 0.01) {
    console.warn(`Warning: Unable to meet spending goal. Short by ${spendingGoal - totalWithdrawn}`);
  }

  return withdrawals;
}