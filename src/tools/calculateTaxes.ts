export function calculateTaxes(taxableIncome: number, filingStatus: "single" | "married") {
  let tax = 0;
  let taxRates = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
  let taxBrackets = filingStatus === "married"
    ? [23200, 94200, 201050, 383900, 470700, 628300]
    : [11600, 47150, 100525, 191950, 243725, 609350];

  let prevBracket = 0;
  for (let i = 0; i < taxBrackets.length; i++) {
    if (taxableIncome > prevBracket) {
      let taxableAtRate = Math.min(taxableIncome, taxBrackets[i]) - prevBracket;
      tax += taxableAtRate * taxRates[i];
      prevBracket = taxBrackets[i];
    } else break;
  }

  return tax;
}