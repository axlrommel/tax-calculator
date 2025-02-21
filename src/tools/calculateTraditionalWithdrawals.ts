import { calculateTaxes } from "./calculateTaxes";

const getThresholds = (filingStatus: "single" | "married") => filingStatus === "married" ?
  { ssBase1: 32000, ssBase2: 44000, taxBrackets: [23200, 94200] }
  : { ssBase1: 25000, ssBase2: 34000, taxBrackets: [11600, 47150] };

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
