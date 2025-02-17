export function calculateAGI(totalIncome, adjustments) {
  return Math.max(0, totalIncome - adjustments);
}

