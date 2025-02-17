import { calculateMedicareCosts } from "./calculateMedicare"

export interface ICalculations {
  year: number
  age: number
  rothBalance: number
  tradBalance: number
  withdrawalsFromRoth: number
  withdrawalsFromTrad: number
  totalAmountWithdrawn: number
  ssIncome: number
  currentSpendingGoal: number
  taxesPaid: number
  medicareCosts: number
}

export interface IResults {
  moneyLastYears: number | "more than 40";
  details: ICalculations[];
}

function optimizeRetirementWithdrawals(ssIncome: number, rothBalance: number, tradBalance: number, spendingGoal: number, filingStatus: "single" | "married") {
  const thresholds = filingStatus === "married" ? 
      { ssBase1: 32000, ssBase2: 44000, taxBrackets: [23200, 94200] } 
      : { ssBase1: 25000, ssBase2: 34000, taxBrackets: [11600, 47150] };

  let provisionalIncome = ssIncome * 0.5; // Half of Social Security is counted for provisional income
  let taxableIncome = 0;
  let withdrawals = { 
    fromRoth: 0, 
    fromTrad: 0, 
    taxesPaid: 0, 
    ssIncome: ssIncome, 
    spendingGoal: spendingGoal 
  };

  // Step 1: Calculate remaining spending needed after Social Security
  let remainingSpending = spendingGoal - ssIncome;

  // If remaining spending is negative or zero, no withdrawals needed
  if (remainingSpending <= 0) {
    return withdrawals;
  }

  // Step 2: Use Roth IRA first since it doesn't affect provisional income
  if (remainingSpending > 0 && rothBalance > 0) {
    withdrawals.fromRoth = Math.min(remainingSpending, rothBalance);
    remainingSpending -= withdrawals.fromRoth;
  }

  // Step 3: If still more needed, calculate Traditional IRA withdrawal
  if (remainingSpending > 0) {
    // Calculate taxes on potential Traditional IRA withdrawal
    let estimatedTradWithdrawal = remainingSpending;
    
    // Update provisional income with Traditional IRA withdrawal
    let totalProvisionalIncome = provisionalIncome + estimatedTradWithdrawal;
    
    // Calculate taxable portion of Social Security
    let ssTaxable = 0;
    if (totalProvisionalIncome > thresholds.ssBase2) {
      ssTaxable = ssIncome * 0.85;
    } else if (totalProvisionalIncome > thresholds.ssBase1) {
      ssTaxable = ssIncome * 0.5;
    }
    
    // Calculate total taxable income
    taxableIncome = ssTaxable + estimatedTradWithdrawal;
    
    // Calculate taxes
    let tax = 0;
    let taxRates = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
    let taxBrackets = filingStatus === "married" ? 
        [23200, 94200, 201050, 383900, 470700, 628300] 
        : [11600, 47150, 100525, 191950, 243725, 609350];
    
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
    
    // Total needed from Traditional IRA is remaining spending plus taxes
    let totalTradNeeded = remainingSpending + tax;
    withdrawals.fromTrad = Math.min(totalTradNeeded, tradBalance);
    withdrawals.taxesPaid = tax;
  }

  // Calculate final numbers
  let totalWithdrawn = ssIncome + withdrawals.fromRoth + withdrawals.fromTrad - withdrawals.taxesPaid;
  
  // Verify we meet spending goal (within rounding error)
  if (Math.abs(totalWithdrawn - spendingGoal) > 0.01) {
    console.warn(`Warning: Unable to meet spending goal. Short by ${spendingGoal - totalWithdrawn}`);
  }

  return withdrawals;
}

export function optimizeAndSimulateRetirement(
  ssIncome: number, 
  rothBalance: number, 
  tradBalance: number, 
  spendingGoal: number, 
  filingStatus: "married" | "single", 
  age = 65, 
  returnRate = 0.05, 
  inflationRate = 0.01
): IResults {
  let currentRothBalance = rothBalance;
  let currentTradBalance = tradBalance;
  let currentSpendingGoal = spendingGoal;
  let years = 0;
  let annualDetails = [] as ICalculations[];
  let medicareCost = calculateMedicareCosts(ssIncome, filingStatus); // Initial Medicare cost

  while (currentRothBalance + currentTradBalance > 0) {
    let currentAge = age + years;

    // Calculate RMD if applicable
    let rmd = 0;
    if (currentAge >= 73) {
      let lifeExpectancyFactor = 27.4 - (currentAge - 73);
      rmd = currentTradBalance / Math.max(lifeExpectancyFactor, 1);
    }

    // Optimize withdrawals
    let withdrawals = optimizeRetirementWithdrawals(
      ssIncome, 
      currentRothBalance, 
      currentTradBalance, 
      currentSpendingGoal, 
      filingStatus
    );

    // Handle RMD if necessary
    if (withdrawals.fromTrad < rmd) {
      let additionalTrad = Math.min(rmd - withdrawals.fromTrad, currentTradBalance);
      withdrawals.fromTrad += additionalTrad;
    }

    // Update **Medicare costs** based on taxable income
    medicareCost = calculateMedicareCosts(withdrawals.fromTrad, filingStatus);

    // Deduct Medicare from Social Security
    let netSSIncome = Math.max(ssIncome - medicareCost, 0); 

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
    
    // Adjust **Social Security for COLA**
    ssIncome *= (1 + inflationRate);

    years++;

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
      netSSIncome: Math.round(netSSIncome), // Net after Medicare
      currentSpendingGoal: Math.round(currentSpendingGoal),
      taxesPaid: Math.round(withdrawals.taxesPaid),
      medicareCosts: Math.round(medicareCost)
    });

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
