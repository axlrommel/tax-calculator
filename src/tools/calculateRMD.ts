export function calculateRMD (currentAge: number, currentTradBalance: number) {
  if(currentAge < 73) {
    return 0;
  }
    const lifeExpectancyFactor = 27.4 - (currentAge - 73);
    return currentTradBalance / Math.max(lifeExpectancyFactor, 1);
}