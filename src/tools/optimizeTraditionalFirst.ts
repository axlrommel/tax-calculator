import { calculateTraditionalWithdrawals } from "./calculateTraditionalWithdrawals";

export function optimizeTraditionalFirst(
  rothBalance: number,
  tradBalance: number,
  spendingGoal: number,
  ssIncome: number,
  provisionalIncome: number,
  filingStatus: "single" | "married"
) {
  let withdrawals = { 
    fromRoth: 0, 
    fromTrad: 0, 
    taxesPaid: 0, 
    ssIncome, 
    spendingGoal: spendingGoal };

  // Step 1: Calculate remaining spending needed after Social Security
  let remainingSpending = spendingGoal - ssIncome;

  if (tradBalance > 0) {
    let tradWithdrawals = calculateTraditionalWithdrawals(remainingSpending, tradBalance, provisionalIncome, ssIncome, filingStatus);
    withdrawals.fromTrad = tradWithdrawals.amount;
    withdrawals.taxesPaid = tradWithdrawals.taxes;
    remainingSpending -= withdrawals.fromTrad;
  }

  if (remainingSpending > 0) {
    withdrawals.fromRoth = Math.min(remainingSpending, rothBalance);
  }

  return withdrawals;
}
