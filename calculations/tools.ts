// Step 1: Calculate Provisional Income (PI)
export function calculateProvisionalIncome(agi, socialSecurity, taxExemptInterest = 0) {
  return agi + 0.5 * socialSecurity + taxExemptInterest;
}

// Step 2: Determine Taxable Social Security Benefits (TSSB)
export function calculateTaxableSocialSecurity(provisionalIncome, socialSecurity, filingStatus) {
  let base1 = filingStatus === "married" ? 32000 : 25000;
  let base2 = filingStatus === "married" ? 44000 : 34000;

  if (provisionalIncome <= base1) {
      return 0;
  } else if (provisionalIncome <= base2) {
      return 0.5 * (provisionalIncome - base1);
  } else {
      return Math.min(0.85 * socialSecurity, 0.85 * (provisionalIncome - base2) + 0.5 * (base2 - base1));
  }
}

// Step 3: Calculate Taxable Income (TI)
export function calculateTaxableIncome(agi, taxableSocialSecurity, deductions) {
  return Math.max(0, agi + taxableSocialSecurity - deductions);
}

// Step 4: Calculate Tax Owed Based on Tax Brackets
export function calculateTax(taxableIncome, filingStatus) {
  const brackets = filingStatus === "married" 
      ? [[23200, 0.10], [94200, 0.12], [201050, 0.22]] // Married Filing Jointly
      : [[11600, 0.10], [47150, 0.12], [100525, 0.22]]; // Single
  
  let tax = 0;
  let previousLimit = 0;
  
  for (let [limit, rate] of brackets) {
      if (taxableIncome > previousLimit) {
          let taxableAtRate = Math.min(taxableIncome, limit) - previousLimit;
          tax += taxableAtRate * rate;
          previousLimit = limit;
      } else {
          break;
      }
  }

  return tax;
}
