// Function to calculate taxes based on tax brackets
export function calculateTaxes(totalIncome: number, filingStatus: "single" | "married"): number {
  let tax = 0;
  let taxableIncome = totalIncome;
  
  // Tax brackets for "single" and "married" filing statuses
  let taxRates = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
  let taxBracketsSingle = [11600, 47150, 100525, 191950, 243725, 609350];
  let taxBracketsMarried = [23200, 94200, 201050, 383900, 470700, 628300];

  // Use the correct tax brackets based on filing status
  let taxBrackets = filingStatus === "single" ? taxBracketsSingle : taxBracketsMarried;

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