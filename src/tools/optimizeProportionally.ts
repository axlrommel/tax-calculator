import { calculateTaxes } from "./calculateTaxes";
import { getThresholds } from "./constants";

const getTaxes = (filingStatus: "single" | "married", totalProvisionalIncome: number, tradWithdrawal: number): number => {
  // Step 1: Calculate taxable portion of Social Security
  const { ssBase1, ssBase2 } = getThresholds(filingStatus);
  let ssTaxable = 0;

  if (totalProvisionalIncome > ssBase2) {
    ssTaxable = 0.85 * (totalProvisionalIncome - ssBase2) + 0.5 * (ssBase2 - ssBase1);
  } else if (totalProvisionalIncome > ssBase1) {
    ssTaxable = 0.5 * (totalProvisionalIncome - ssBase1);
  }

  // Step 2: Compute taxable income
  let taxableIncome = ssTaxable + tradWithdrawal;

  // Step 3: Calculate actual taxes using progressive tax brackets
  return calculateTaxes(taxableIncome, filingStatus);
}

export function optimizeProportionally(
  rothBalance: number,
  tradBalance: number,
  spendingGoal: number,
  ssIncome: number,
  filingStatus: "single" | "married",
) {
  let withdrawals = { 
    fromRoth: 0, 
    fromTrad: 0, 
    taxesPaid: 0, 
    ssIncome, 
    spendingGoal 
  };

  let provisionalIncome = ssIncome * 0.5; // Half of SS income is counted for provisional income
  let remainingSpending = spendingGoal - ssIncome;
  let totalBalance = rothBalance + tradBalance;

  if (totalBalance === 0) return withdrawals;

  if(remainingSpending < 0) {
    withdrawals.taxesPaid = getTaxes(filingStatus, provisionalIncome, 0);
    return withdrawals;
  }

  if(totalBalance < remainingSpending) {
    withdrawals.fromTrad = tradBalance;
    withdrawals.fromRoth = rothBalance;
    withdrawals.taxesPaid = getTaxes(filingStatus, provisionalIncome + tradBalance, tradBalance);
    return withdrawals;
  }

  // Determine proportional withdrawals
  let rothPercentage = rothBalance / totalBalance;
  let tradPercentage = tradBalance / totalBalance;

  let rothWithdrawal = remainingSpending * rothPercentage;
  let tradWithdrawal = remainingSpending * tradPercentage;

  // Compute total provisional income
  let totalProvisionalIncome = provisionalIncome + tradWithdrawal;

  const taxesPaid = getTaxes(filingStatus, totalProvisionalIncome, tradWithdrawal)

  // Adjust Traditional IRA withdrawal to cover taxes
  let totalTradNeeded = tradWithdrawal + taxesPaid;
  withdrawals.fromTrad = Math.min(totalTradNeeded, tradBalance);
  withdrawals.taxesPaid = taxesPaid;

  // Ensure Roth withdrawals do not exceed balance
  withdrawals.fromRoth = Math.min(rothWithdrawal, rothBalance);

  return withdrawals;
}



