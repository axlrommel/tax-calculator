import { calculateYearlySocialSecurity } from "./calculateSocSec";
import { calculateProvisionalIncome, calculateTaxableSocialSecurity, calculateTaxableIncome, calculateTax } from "./tools";

//assume no adjustments: ie. no IRA contributions, student loan interest, etc.
let claimingAge = [65, 65];    // Age at which person claims benefits
let filingStatus = claimingAge.length === 1 ? "single" : "married";
let deductions = 14000; //fixed deduction

let totalIncome = 60000;  // investment income, etc.
let taxExemptInterest = 1000;

let socialSecurity = claimingAge.reduce((prev, curr) => prev + calculateYearlySocialSecurity(curr),0);
let provisionalIncome = calculateProvisionalIncome(totalIncome, socialSecurity, taxExemptInterest);
let taxableSS = calculateTaxableSocialSecurity(provisionalIncome, socialSecurity, filingStatus);
let taxableIncome = calculateTaxableIncome(totalIncome, taxableSS, deductions);
let taxOwed = calculateTax(taxableIncome, filingStatus);

console.log(`Total Income: $${totalIncome.toFixed(2)}`);
console.log(`Estimated Yearly Social Security Benefit: $${socialSecurity.toFixed(2)}`);
console.log(`Filing status is ${filingStatus}`)
console.log(`Tax Owed: $${taxOwed.toFixed(2)}`);
