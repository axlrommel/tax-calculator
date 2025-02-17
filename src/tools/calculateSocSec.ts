const MONTHS_IN_A_YEAR = 12;
const BASE_BENEFIT = 2000;  // Monthly benefit at full retirement age

export function calculateYearlySocialSecurity(claimingAge: number) {
  const fullRetirementAge = 67; // Default FRA
  let reductionFactor, increaseFactor;
  
  if (claimingAge < 62) {
      return 0;
  } else if (claimingAge < fullRetirementAge) {
      // Early Retirement: Reduces benefits (~6% per year before FRA)
      reductionFactor = (fullRetirementAge - claimingAge) * 0.06;
      return BASE_BENEFIT * (1 - reductionFactor) * MONTHS_IN_A_YEAR;
  } else if (claimingAge > fullRetirementAge && claimingAge <= 70) {
      // Delayed Retirement: Increases benefits (~8% per year after FRA)
      increaseFactor = (claimingAge - fullRetirementAge) * 0.08;
      return BASE_BENEFIT * (1 + increaseFactor) * MONTHS_IN_A_YEAR;
  } else {
      return BASE_BENEFIT * MONTHS_IN_A_YEAR; // FRA benefits at normal rate
  }
}

