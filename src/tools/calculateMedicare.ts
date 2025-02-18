export function calculateMedicareCosts(
  taxableIncome: number, 
  filingStatus: "married" | "single", 
  year: number = 0,
  inflationRate: number = 0.02
): number {
  // Base brackets for 2024
  const baseMedicareBrackets = filingStatus === "married" 
    ? [0, 206000, 258000, 322000, 386000, 750000] 
    : [0, 103000, 129000, 161000, 193000, 500000];
    
  const baseMedicareCosts = [174, 244, 349, 419, 495, 565]; // Monthly base costs for 2024

  // Adjust brackets and costs for inflation
  const inflationFactor = Math.pow(1 + inflationRate, year);
  const medicareBrackets = baseMedicareBrackets.map(bracket => bracket * inflationFactor);
  const medicareCosts = baseMedicareCosts.map(cost => cost * inflationFactor);

  // Find appropriate bracket
  let monthlyPremium = medicareCosts[0];
  for (let i = medicareBrackets.length - 1; i >= 0; i--) {
    if (taxableIncome >= medicareBrackets[i]) {
      monthlyPremium = medicareCosts[i];
      break;
    }
  }

  // Return annual costs (rounded to nearest dollar)
  return Math.round(monthlyPremium * 12);
}