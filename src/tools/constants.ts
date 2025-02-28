export const MONTHS_IN_A_YEAR = 12;
export const SOCIAL_SECURITY_BASE_BENEFIT = 2000;  // Monthly benefit at full retirement age
export const SOCIAL_SECURITY_FULL_RETIREMENT_AGE = 67; // Default FRA

// Tax brackets for "single" and "married" filing statuses 2024
export const taxRates = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
export const taxBracketsSingle = [11600, 47150, 100525, 191950, 243725, 609350];
export const taxBracketsMarried = [23200, 94300, 201050, 383900, 487450, 731200];

// taxable portion of Social Security
export const getThresholds = (filingStatus: "single" | "married") => filingStatus === "married" ?
  { ssBase1: 32000, ssBase2: 44000, taxBrackets: [23200, 94200] }
  : { ssBase1: 25000, ssBase2: 34000, taxBrackets: [11600, 47150] };

// 2024 Medicare IRMAA Brackets
export const medicareBaseBrackets = {
  single: [0, 103000, 129000, 161000, 193000, 500000],
  married: [0, 206000, 258000, 322000, 386000, 750000]
};

// 2024 Medicare Monthly Premiums
export const medicareBaseCosts = [174, 244, 349, 419, 495, 565];

// IRS Uniform Lifetime Table (simplified for common ages)
export const lifeExpectancyTable: { [age: number]: number } = {
  73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9,
  78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5,
  83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
  88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8,
  98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0, 102: 5.6,
};