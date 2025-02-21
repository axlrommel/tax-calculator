import { calculateTaxes } from "./calculateTaxes";
import { getThresholds } from "./getTaxableSS";

export function calculateTraditionalWithdrawals(
  amountNeeded: number,
  tradBalance: number,
  provisionalIncome: number,
  ssIncome: number,
  filingStatus: "single" | "married"
) {
  let estimatedTradWithdrawal = Math.min(amountNeeded, tradBalance);
  let totalProvisionalIncome = provisionalIncome + estimatedTradWithdrawal;

  const threshold = getThresholds(filingStatus);
  let ssTaxable = totalProvisionalIncome > threshold.ssBase2 ? ssIncome * 0.85 : (totalProvisionalIncome > threshold.ssBase1 ? ssIncome * 0.5 : 0);

  let taxableIncome = ssTaxable + estimatedTradWithdrawal;
  let taxes = calculateTaxes(taxableIncome, filingStatus);

  return { amount: estimatedTradWithdrawal, taxes };
}
