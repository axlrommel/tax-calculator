import { medicareBaseBrackets, medicareBaseCosts } from "./constants";

export function calculateMedicareCosts(
  taxableIncome: number, 
  filingStatus: "married" | "single", 
  year: number = 0,
  inflationRate: number
): number {
  
  // Apply Inflation
  const inflationFactor = Math.pow(1 + inflationRate, year);
  const brackets = medicareBaseBrackets[filingStatus].map(b => Math.round(b * inflationFactor));  
  const costs = medicareBaseCosts.map(c => Math.round(c * inflationFactor));

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
