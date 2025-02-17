export function calculateMedicareCosts(taxableIncome: number, filingStatus: "married" | "single"): number {
  // 2024 Medicare IRMAA brackets (approximate values)
  const medicareBrackets = filingStatus === "married" 
    ? [0, 206000, 258000, 322000, 386000, 750000] 
    : [0, 103000, 129000, 161000, 193000, 500000];
    
  const medicareCosts = [174, 244, 349, 419, 495, 565]; // Monthly cost per bracket
  let monthlyPremium = medicareCosts[0];

  for (let i = 0; i < medicareBrackets.length; i++) {
    if (taxableIncome > medicareBrackets[i]) {
      monthlyPremium = medicareCosts[i];
    } else {
      break;
    }
  }

  return monthlyPremium * 12; // Return annual Medicare costs
}