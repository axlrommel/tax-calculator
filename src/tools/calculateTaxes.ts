import { taxBracketsSingle, taxBracketsMarried, taxRates } from "./constants";

// Function to calculate taxes based on tax brackets
export function calculateTaxes(totalIncome: number, filingStatus: "single" | "married"): number {
  let tax = 0;
  let taxableIncome = totalIncome;

  // Use the correct tax brackets based on filing status
  const taxBrackets = filingStatus === "single" ? taxBracketsSingle : taxBracketsMarried;

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
  
  // If income exceeds the last bracket, apply the highest tax rate
  if (taxableIncome > prevBracket) {
    tax += (taxableIncome - prevBracket) * taxRates[taxRates.length - 1];
  }

  return tax;
}