export function calculateRMD(currentAge: number, currentTradBalance: number): number {
  if (currentAge < 73) {
    return 0;
  }

  // IRS Uniform Lifetime Table (simplified for common ages)
  const lifeExpectancyTable: { [age: number]: number } = {
    73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9,
    78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5,
    83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
    88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
    93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8,
    98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0, 102: 5.6,
  };

  // Use the correct factor, default to 5.6 if age > 102
  const lifeExpectancyFactor = lifeExpectancyTable[currentAge] || 5.6;

  return currentTradBalance / lifeExpectancyFactor;
}