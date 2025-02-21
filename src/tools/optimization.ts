import { calculateMedicareCosts } from "./calculateMedicare"
import { calculateRMD } from "./calculateRMD"
import { calculateYearlySocialSecurity } from "./calculateSocSec";
import { IAges, ICalculations, IResults } from "./types";

export function optimizeAndSimulateRetirement(
  optimizationStrategy: any,
  ages: IAges[],
  rothBalance: number,
  tradBalance: number,
  spendingGoal: number,
  filingStatus: "married" | "single",
  returnRate = 0.05,
  inflationRate = 0.01
): IResults {
  let currentRothBalance = rothBalance;
  let currentTradBalance = tradBalance;
  let currentSpendingGoal = spendingGoal;
  let years = 0;
  let annualDetails = [] as ICalculations[];
  let medicareCost = 0;

  while (currentRothBalance + currentTradBalance > 0) {
    let currentAge = ages[0].retirementAge + years;

    let ssIncome = ages.reduce(
      (accumulator: number, age: IAges) => accumulator + calculateYearlySocialSecurity(
        age, currentAge, years, inflationRate), 0);

    let provisionalIncome = ssIncome * 0.5; // Half of Social Security is counted for provisional income
    
    // Optimize withdrawals
    let withdrawals = optimizationStrategy(
      currentRothBalance,
      currentTradBalance,
      currentSpendingGoal,
      ssIncome,
      provisionalIncome,
      filingStatus
    );

    const rmd = calculateRMD(currentAge, currentTradBalance);

    // Handle RMD if necessary
    if (withdrawals.fromTrad < rmd) {
      let additionalTrad = Math.min(rmd - withdrawals.fromTrad, currentTradBalance);
      withdrawals.fromTrad += additionalTrad;
    }

    // Update **Medicare costs** based on taxable income
    if (currentAge >= 65) {
      medicareCost = calculateMedicareCosts(withdrawals.fromTrad, filingStatus, years);
      if (filingStatus === 'married') {
        medicareCost *= 2; //if married then we need to account for both spouses
      }
    }

    // Ensure spending goal is met
    let totalAvailable = currentRothBalance + currentTradBalance;
    let basicWithdrawalNeeds = Math.max(withdrawals.fromRoth + withdrawals.fromTrad, 0);

    if (totalAvailable < basicWithdrawalNeeds) {
      return {
        moneyLastYears: years,
        details: annualDetails
      };
    }

    // Update balances after withdrawals
    currentRothBalance -= withdrawals.fromRoth;
    currentTradBalance -= withdrawals.fromTrad;

    // Apply investment growth
    currentRothBalance *= (1 + returnRate);
    currentTradBalance *= (1 + returnRate);

    // Apply **inflation adjustments** to spending and Medicare costs
    currentSpendingGoal *= (1 + inflationRate);
    medicareCost *= (1 + inflationRate);

    const extraFromRMD = rmd - currentSpendingGoal - ssIncome

    // Store annual data
    annualDetails.push({
      year: years,
      age: currentAge,
      rothBalance: Math.round(currentRothBalance),
      tradBalance: Math.round(currentTradBalance),
      withdrawalsFromRoth: Math.round(withdrawals.fromRoth),
      withdrawalsFromTrad: Math.round(withdrawals.fromTrad),
      totalAmountWithdrawn: Math.round(withdrawals.fromRoth + withdrawals.fromTrad),
      ssIncome: Math.round(ssIncome),
      currentSpendingGoal: Math.round(currentSpendingGoal),
      taxesPaid: Math.round(withdrawals.taxesPaid),
      medicareCosts: Math.round(medicareCost),
      requiredMinimumDistributions: Math.round(rmd),
      extraFromRMD: Math.round(extraFromRMD > 0 ? extraFromRMD : 0)
    });

    years++;

    if (years > 40) {
      return {
        moneyLastYears: "more than 40",
        details: annualDetails
      };
    }
  }

  return {
    moneyLastYears: years,
    details: annualDetails
  };
}

// // Example Usage:
// let claimingAge = [65, 62];    // Age at which person claims benefits
// let filingStatus = claimingAge.length === 1 ? "single" : "married";
// let ssIncome = claimingAge.reduce((prev, curr) => prev + calculateYearlySocialSecurity(curr),0);

// let rothBalance = 200000; // Roth IRA Balance
// let tradBalance = 2200000; // Traditional IRA Balance
// let spendingGoal = 150000; // Annual Spending Needs

// let strategy = optimizeAndSimulateRetirement(ssIncome, rothBalance, tradBalance, spendingGoal, filingStatus);
// console.log(strategy);
