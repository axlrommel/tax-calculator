import { IAges } from "./types";

const MONTHS_IN_A_YEAR = 12;
const BASE_BENEFIT = 2000;  // Monthly benefit at full retirement age
const FULL_RETIREMENT_AGE = 67; // Default FRA

export function calculateYearlySocialSecurity(
    age: IAges, 
    currentAge: number, 
    yearsInRetirement: number,
    inflationRate: number
  ) {
    let reductionFactor = 0, increaseFactor = 0;
    
    if (currentAge < 62) {
      return 0; // Cannot claim before 62
    }
  
    let baseBenefit;
  
    if (age.ssClaimingAge < FULL_RETIREMENT_AGE) {
      // Early Retirement: Reduces benefits (~6% per year before FRA)
      reductionFactor = (FULL_RETIREMENT_AGE - age.ssClaimingAge) * 0.06;
      baseBenefit = BASE_BENEFIT * (1 - reductionFactor) * MONTHS_IN_A_YEAR;
    } else if (age.ssClaimingAge > FULL_RETIREMENT_AGE && age.ssClaimingAge <= 70) {
      // Delayed Retirement: Increases benefits (~8% per year after FRA)
      increaseFactor = (age.ssClaimingAge - FULL_RETIREMENT_AGE) * 0.08;
      baseBenefit = BASE_BENEFIT * (1 + increaseFactor) * MONTHS_IN_A_YEAR;
    } else {
      baseBenefit = BASE_BENEFIT * MONTHS_IN_A_YEAR; // FRA benefits at normal rate
    }
  
    // Apply Inflation Adjustment
    let adjustedBenefit = baseBenefit * Math.pow(1 + inflationRate, yearsInRetirement);
  
    return adjustedBenefit;
  }
  

