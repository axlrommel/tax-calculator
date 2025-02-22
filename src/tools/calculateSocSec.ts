const MONTHS_IN_A_YEAR = 12;
const BASE_BENEFIT = 2000;  // Monthly benefit at full retirement age
const FULL_RETIREMENT_AGE = 67; // Default FRA

export function calculateYearlySocialSecurity(
  ssClaimingAge: number, 
  currentAge: number, 
  yearsInRetirement: number,
  inflationRate: number
) {
  if (currentAge < 62) return 0; // Cannot claim before 62

  let baseBenefit = BASE_BENEFIT;
  const claimingAge = ssClaimingAge;
  
  if (claimingAge < FULL_RETIREMENT_AGE) {
    // Early claiming: Reduction applied per SSA rules
    let monthsEarly = (FULL_RETIREMENT_AGE - claimingAge) * MONTHS_IN_A_YEAR;
    if (monthsEarly <= 36) {
      baseBenefit *= (1 - monthsEarly * 0.005); // 5% per year (0.005 per month)
    } else {
      let first36MonthsReduction = 36 * 0.005;
      let additionalMonths = monthsEarly - 36;
      let additionalReduction = additionalMonths * 0.00556; // 6.67% per year
      baseBenefit *= (1 - (first36MonthsReduction + additionalReduction));
    }
  } else if (claimingAge > FULL_RETIREMENT_AGE && claimingAge <= 70) {
    // Delayed claiming: 8% increase per year
    let delayedYears = claimingAge - FULL_RETIREMENT_AGE;
    baseBenefit *= (1 + delayedYears * 0.08);
  }

  // Convert monthly to yearly
  let yearlyBenefit = Math.round(baseBenefit * MONTHS_IN_A_YEAR);

  // Apply inflation adjustment with rounding
  let adjustedBenefit = Math.round(yearlyBenefit * Math.pow(1 + inflationRate, yearsInRetirement));

  return adjustedBenefit;
}
