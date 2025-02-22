export function calculateEffectiveTaxRate(provisionalIncome: number, filingStatus: "single" | "married"): number {
  // 2024 tax brackets
  const taxBrackets = filingStatus === "single" ? [
    { threshold: 0, rate: 0.10 },
    { threshold: 11000, rate: 0.12 },
    { threshold: 44725, rate: 0.22 },
    { threshold: 95375, rate: 0.24 },
    { threshold: 182100, rate: 0.32 },
    { threshold: 231250, rate: 0.35 },
    { threshold: 578125, rate: 0.37 }
  ] : [
    { threshold: 0, rate: 0.10 },
    { threshold: 22000, rate: 0.12 },
    { threshold: 89450, rate: 0.22 },
    { threshold: 190750, rate: 0.24 },
    { threshold: 364200, rate: 0.32 },
    { threshold: 462500, rate: 0.35 },
    { threshold: 693750, rate: 0.37 }
  ];

  // Handle edge cases
  if (provisionalIncome <= 0) return 0;

  let totalTax = 0;
  let remainingIncome = provisionalIncome;

  // Calculate tax for each bracket
  for (let i = 0; i < taxBrackets.length; i++) {
    const currentBracket = taxBrackets[i];
    const nextBracket = taxBrackets[i + 1];
    
    if (!nextBracket) {
      // Top bracket
      totalTax += remainingIncome * currentBracket.rate;
      break;
    }

    const bracketIncome = Math.min(
      nextBracket.threshold - currentBracket.threshold,
      remainingIncome
    );

    totalTax += bracketIncome * currentBracket.rate;
    remainingIncome -= bracketIncome;

    if (remainingIncome <= 0) break;
  }

  return totalTax / provisionalIncome;
}