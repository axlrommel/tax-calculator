import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import './App.css'
import { optimizeAndSimulateRetirement } from "./tools/optimization";
import { IAges, ICalculations } from "./tools/types";
import { optimizeRothFirst } from "./tools/optimizeRothFirst";
import { optimizeTraditionalFirst } from "./tools/optimizeTraditionalFirst";
import { optimizeProportionally } from "./tools/optimizeProportionally";
import { finalBalance, sumRequiredDistributions, totalTaxesPaid } from "./tools/utils";

let USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 7
});

function App() {
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");
  const [retirementAgePrimary, setRetirementAgePrimary] = useState<number>(65);
  const [retirementAgeSecondary, setRetirementAgeSecondary] = useState<number>(65);
  const [ssClaimAgePrimary, setSsClaimAgePrimary] = useState<number>(65);
  const [ssClaimAgeSpouse, setSsClaimAgeSpouse] = useState<number>(65);
  const [afterTax, setAfterTax] = useState(0);
  const [beforeTax, setBeforeTax] = useState(0);
  const [spendingGoal, setSpendingGoal] = useState(0)
  const [results, setResults] = useState<ICalculations[]>([]);
  const [yearsLast, setYearsLast] = useState<number | string>(0);

  const getAges = (): IAges[] => {
    const ages: IAges[] = [{ retirementAge: retirementAgePrimary, ssClaimingAge: ssClaimAgePrimary }];
    if (filingStatus === 'married') {
      ages.push({ retirementAge: retirementAgeSecondary, ssClaimingAge: ssClaimAgeSpouse })
    }
    return ages;
  }
  const useRothFirst = () => {
    let strategy = optimizeAndSimulateRetirement(optimizeRothFirst, getAges(), afterTax, beforeTax, spendingGoal, filingStatus);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
  }

  const useTraditionalFirst = () => {
    let strategy = optimizeAndSimulateRetirement(optimizeTraditionalFirst, getAges(), afterTax, beforeTax, spendingGoal, filingStatus);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
  }

  const useProportionally = () => {
    let strategy = optimizeAndSimulateRetirement(optimizeProportionally, getAges(), afterTax, beforeTax, spendingGoal, filingStatus);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
  }

    return (
<div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg m-4">
  <h2 className="text-2xl font-bold mb-6">Retirement Calculator</h2>

  {/* Filing Status */}
  <div className="flex gap-6 mb-4">
    <div className="flex-1">
      <label className="block text-sm font-medium">Filing Status</label>
      <Select onValueChange={(value) => setFilingStatus(value as "single" | "married")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Single</SelectItem>
          <SelectItem value="married">Married</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Primary Person: Retirement Age & SS Claim Age */}
  <div className="flex gap-6 mb-4">
    <div className="flex-1">
      <label className="block text-sm font-medium">Retirement Age</label>
      <Select onValueChange={(value) => setRetirementAgePrimary(Number(value))}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select retirement age" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 20 }, (_, i) => 55 + i).map((age) => (
            <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex-1">
      <label className="block text-sm font-medium">Social Security Claim Age</label>
      <Select onValueChange={(value) => setSsClaimAgePrimary(Number(value))}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select age" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 10 }, (_, i) => 62 + i).map((age) => (
            <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Spouse: Retirement Age & SS Claim Age (Only if Married) */}
  {filingStatus === "married" && (
    <div className="flex gap-6 mb-4">
      <div className="flex-1">
        <label className="block text-sm font-medium">Spouse Retirement Age</label>
        <Select onValueChange={(value) => setRetirementAgeSecondary(Number(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select spouse's retirement age" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 20 }, (_, i) => 55 + i).map((age) => (
              <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium">Spouse's Social Security Claim Age</label>
        <Select onValueChange={(value) => setSsClaimAgeSpouse(Number(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select age" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => 62 + i).map((age) => (
              <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )}

  {/* Investment Inputs */}
  <div className="flex gap-6 mb-4">
    <div className="flex-1">
      <label className="block text-sm font-medium">After Tax Investments ($)</label>
      <Input type="number" value={afterTax > 0 ? afterTax : ''} onChange={(e) => setAfterTax(Number(e.target.value))} />
    </div>

    <div className="flex-1">
      <label className="block text-sm font-medium">Before Tax Investments ($)</label>
      <Input type="number" value={beforeTax > 0 ? beforeTax : ''} onChange={(e) => setBeforeTax(Number(e.target.value))} />
    </div>
  </div>

  {/* Spending Goal */}
  <div className="mb-4">
    <label className="block text-sm font-medium">Annual Spending Goal ($)</label>
    <Input type="number" value={spendingGoal > 0 ? spendingGoal : ''} onChange={(e) => setSpendingGoal(Number(e.target.value))} />
  </div>

  {/* Optimization Buttons */}
  <div className="flex gap-4 mb-6">
    <Button onClick={useRothFirst} className="flex-1" disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}>
      Optimize Roth First
    </Button>
    <Button onClick={useTraditionalFirst} className="flex-1" disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}>
      Optimize Trad First
    </Button>
    <Button onClick={useProportionally} className="flex-1" disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}>
      Optimize Proportional
    </Button>
  </div>

  {/* Results Section */}
  {yearsLast && (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Results</h3>
      <p>Money will last for: <strong>{yearsLast} years</strong></p>
      <p>Total Taxes Paid: <strong>{USDollar.format(totalTaxesPaid(results))}</strong></p>
      <p>Roth + IRA Balance at 40 years: <strong>{USDollar.format(finalBalance(results))}</strong></p>
      <p>Total Forced Required Distributions: <strong>{USDollar.format(sumRequiredDistributions(results))}</strong></p>

      {/* Results Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              {["Year", "Age", "Roth Balance", "IRA Balance", "Roth Withdrawal", "IRA Withdrawal", 
                
                // "Req Min Distrib", 
                "Spending Goal", "Total Withdrawn", "SS Income", 
                "Extra from Req Min Distrib", "Taxes Paid", 
                // "Medicare Costs",
              ].map(header => (
                <th key={header} className="border p-2">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{row.year}</td>
                <td className="border p-2">{row.age}</td>
                <td className="border p-2">{USDollar.format(row.rothBalance)}</td>
                <td className="border p-2">{USDollar.format(row.tradBalance)}</td>
                <td className="border p-2">{USDollar.format(row.withdrawalsFromRoth)}</td>
                <td className="border p-2">{USDollar.format(row.withdrawalsFromTrad)}</td>
                {/* <td className="border p-2">{USDollar.format(row.requiredMinimumDistributions)}</td> */}
                <td className="border p-2">{USDollar.format(row.currentSpendingGoal)}</td>
                <td className="border p-2">{USDollar.format(row.totalAmountWithdrawn)}</td>
                <td className="border p-2">{USDollar.format(row.ssIncome)}</td>
                <td className="border p-2">{USDollar.format(row.extraFromRMD)}</td>
                <td className="border p-2">{USDollar.format(row.taxesPaid)}</td>
                {/* <td className="border p-2">{USDollar.format(row.medicareCosts)}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}
</div>

    );
  
}

export default App;
