import { lifeExpectancyTable } from "./constants";

export function calculateRMD(currentAge: number, currentTradBalance: number): number {
  if (currentAge < 73) {
    return 0;
  }

  // default to 5.6 if age > 102
  const lifeExpectancyFactor = lifeExpectancyTable[currentAge] || 5.6;

  return currentTradBalance / lifeExpectancyFactor;
}