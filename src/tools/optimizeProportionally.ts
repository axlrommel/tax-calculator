import { calculateTraditionalWithdrawals } from "./calculateTraditionalWithdrawals";

export function optimizeProportionally(
  rothBalance: number,
  tradBalance: number,
  spendingGoal: number,
  ssIncome: number,
  provisionalIncome: number,
  filingStatus: "single" | "married",
) {
  let withdrawals = { 
    fromRoth: 0, 
    fromTrad: 0, 
    taxesPaid: 0, 
    ssIncome, 
    spendingGoal };

  let remainingSpending = spendingGoal - ssIncome;

  let totalBalance = rothBalance + tradBalance;
  if (totalBalance === 0) return withdrawals;

  let rothPercentage = rothBalance / totalBalance;
  let tradPercentage = tradBalance / totalBalance;

  let rothWithdrawal = remainingSpending * rothPercentage;
  let tradWithdrawal = remainingSpending * tradPercentage;

  let tradWithdrawals = calculateTraditionalWithdrawals(tradWithdrawal, tradBalance, provisionalIncome, ssIncome, filingStatus);
  withdrawals.fromTrad = tradWithdrawals.amount;
  withdrawals.taxesPaid = tradWithdrawals.taxes;

  withdrawals.fromRoth = Math.min(rothWithdrawal, rothBalance);

  return withdrawals;
}
