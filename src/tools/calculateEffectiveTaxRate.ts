export function calculateEffectiveTaxRate(provisionalIncome: number, filingStatus: "single" | "married"): number {
  let taxBrackets;

  if (filingStatus === "single") {
    taxBrackets = [
      { threshold: 11000, rate: 0.10 },
      { threshold: 44725, rate: 0.12 },
      { threshold: 95375, rate: 0.22 },
      { threshold: 182100, rate: 0.24 },
      { threshold: 231250, rate: 0.32 },
      { threshold: 578125, rate: 0.35 },
      { threshold: Infinity, rate: 0.37 }
    ];
  } else {
    taxBrackets = [
      { threshold: 22000, rate: 0.10 },
      { threshold: 89450, rate: 0.12 },
      { threshold: 190750, rate: 0.22 },
      { threshold: 364200, rate: 0.24 },
      { threshold: 462500, rate: 0.32 },
      { threshold: 693750, rate: 0.35 },
      { threshold: Infinity, rate: 0.37 }
    ];
  }

  let taxableIncome = provisionalIncome; // Approximation of taxable amount
  let totalTax = 0;
  let previousThreshold = 0;

  for (let bracket of taxBrackets) {
    if (taxableIncome > bracket.threshold) {
      totalTax += (bracket.threshold - previousThreshold) * bracket.rate;
      previousThreshold = bracket.threshold;
    } else {
      totalTax += (taxableIncome - previousThreshold) * bracket.rate;
      break;
    }
  }

  let effectiveTaxRate = totalTax / taxableIncome;
  return isNaN(effectiveTaxRate) ? 0 : effectiveTaxRate;
}
