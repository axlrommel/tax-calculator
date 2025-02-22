export function calculateMedicareCosts(
  taxableIncome: number, 
  filingStatus: "married" | "single", 
  year: number = 0,
  inflationRate: number = 0.02
): number {
  // 2024 Medicare IRMAA Brackets
  const baseBrackets = {
    single: [0, 103000, 129000, 161000, 193000, 500000],
    married: [0, 206000, 258000, 322000, 386000, 750000]
  };

  // 2024 Monthly Premiums
  const baseCosts = [174, 244, 349, 419, 495, 565];

  // Apply Inflation
  const inflationFactor = Math.pow(1 + inflationRate, year);
  const brackets = baseBrackets[filingStatus].map(b => Math.round(b * inflationFactor));  
  const costs = baseCosts.map(c => Math.round(c * inflationFactor));

  // Find the correct premium level
  let monthlyPremium = costs[0]; // Default to base premium
  for (let i = 1; i < brackets.length; i++) {
    if (taxableIncome < brackets[i]) {
      break;
    }
    monthlyPremium = costs[i]; // Upgrade to the next premium bracket
  }

  // Return the annual premium (rounded)
  return Math.round(monthlyPremium * 12);
}
