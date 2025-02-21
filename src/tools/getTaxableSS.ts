export const getThresholds = (filingStatus: "single" | "married") => filingStatus === "married" ?
  { ssBase1: 32000, ssBase2: 44000, taxBrackets: [23200, 94200] }
  : { ssBase1: 25000, ssBase2: 34000, taxBrackets: [11600, 47150] };
  
export function getTaxableSS(ssIncome: number, provisionalIncome: number, filingStatus: "single" | "married") {
  const threshold = getThresholds(filingStatus);
  if (provisionalIncome > threshold.ssBase2) return ssIncome * 0.85;
  if (provisionalIncome > threshold.ssBase1) return ssIncome * 0.5;
  return 0;
}