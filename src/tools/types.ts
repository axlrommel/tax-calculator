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
  requiredMinimumDistributions: number;
  extraFromRMD: number;
}

export interface IResults {
  moneyLastYears: number | "more than 40";
  details: ICalculations[];
}

export interface IAges {
  retirementAge: number;
  ssClaimingAge: number;
}