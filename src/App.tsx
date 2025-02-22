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
  const [selection, setSelection] = useState<string>('');
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");
  const [currentAge, setCurrentAge] = useState<number>(55); // New state for current age
  const [spouseCurrentAge, setSpouseCurrentAge] = useState<number>(55); // New state for spouse's current age
  const [retirementAgePrimary, setRetirementAgePrimary] = useState<number>(65);
  const [retirementAgeSecondary, setRetirementAgeSecondary] = useState<number>(65);
  const [ssClaimAgePrimary, setSsClaimAgePrimary] = useState<number>(65);
  const [ssClaimAgeSpouse, setSsClaimAgeSpouse] = useState<number>(65);
  const [afterTax, setAfterTax] = useState(0);
  const [beforeTax, setBeforeTax] = useState(0);
  const [spendingGoal, setSpendingGoal] = useState(0);
  const [results, setResults] = useState<ICalculations[]>([]);
  const [yearsLast, setYearsLast] = useState<number | string>(0);

  const getAges = (): IAges[] => {
    const ages: IAges[] = [{ currentAge , retirementAge: retirementAgePrimary, ssClaimingAge: ssClaimAgePrimary }];
    if (filingStatus === 'married') {
      ages.push({ currentAge: spouseCurrentAge, retirementAge: retirementAgeSecondary, ssClaimingAge: ssClaimAgeSpouse });
    }
    return ages;
  };

  const useRothFirst = () => {
    let strategy = optimizeAndSimulateRetirement(optimizeRothFirst, getAges(), afterTax, beforeTax, spendingGoal, filingStatus);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
    setSelection('Roth First Strategy')
  };

  const useTraditionalFirst = () => {
    let strategy = optimizeAndSimulateRetirement(optimizeTraditionalFirst, getAges(), afterTax, beforeTax, spendingGoal, filingStatus);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
    setSelection('Traditional First Strategy')
  };

  const useProportionally = () => {
    let strategy = optimizeAndSimulateRetirement(optimizeProportionally, getAges(), afterTax, beforeTax, spendingGoal, filingStatus);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
    setSelection('Proportional Strategy')
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Retirement Tax Calculator for the US</h2>

      {/* Filing Status */}
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Your Filing Status</label>
          <Select onValueChange={(value) => setFilingStatus(value as "single" | "married")}>
            <SelectTrigger className="w-full max-w-[200px]">
              <SelectValue placeholder="Select your status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Age */}
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Your Current Age</label>
          <Input
            type="number"
            value={currentAge > 0 ? currentAge : ''}
            onChange={(e) => setCurrentAge(Number(e.target.value))}
            className="w-full max-w-[200px]"
          />
        </div>

        {/* Spouse Current Age (Only if Married) */}
        {filingStatus === "married" && (
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">Spouse's Current Age</label>
            <Input
              type="number"
              value={spouseCurrentAge > 0 ? spouseCurrentAge : ''}
              onChange={(e) => setSpouseCurrentAge(Number(e.target.value))}
              className="w-full max-w-[200px]"
            />
          </div>
        )}
      </div>

      {/* Primary Person: Retirement Age & SS Claim Age */}
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Your Retirement Age</label>
          <Select onValueChange={(value) => setRetirementAgePrimary(Number(value))}>
            <SelectTrigger className="w-full max-w-[200px]">
              <SelectValue placeholder="Select retirement age" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => 55 + i).map((age) => (
                <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Your Social Security Claim Age</label>
          <Select onValueChange={(value) => setSsClaimAgePrimary(Number(value))}>
            <SelectTrigger className="w-full max-w-[200px]">
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
        <div className="flex gap-6 mb-6">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">Spouse Retirement Age</label>
            <Select onValueChange={(value) => setRetirementAgeSecondary(Number(value))}>
              <SelectTrigger className="w-full max-w-[200px]">
                <SelectValue placeholder="Select spouse's retirement age" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => 55 + i).map((age) => (
                  <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">Spouse's Social Security Claim Age</label>
            <Select onValueChange={(value) => setSsClaimAgeSpouse(Number(value))}>
              <SelectTrigger className="w-full max-w-[200px]">
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
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">After Tax Investments, e.g. Roth ($)</label>
          <Input
            type="number"
            value={afterTax > 0 ? afterTax : ''}
            onChange={(e) => setAfterTax(Number(e.target.value))}
            className="w-full max-w-[200px]"
          />
        </div>

        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Before Tax Investments, e.g. Traditional ($)</label>
          <Input
            type="number"
            value={beforeTax > 0 ? beforeTax : ''}
            onChange={(e) => setBeforeTax(Number(e.target.value))}
            className="w-full max-w-[200px]"
          />
        </div>
      </div>

      {/* Spending Goal */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Annual Spending Goal AFTER Taxes ($)</label>
        <Input
          type="number"
          value={spendingGoal > 0 ? spendingGoal : ''}
          onChange={(e) => setSpendingGoal(Number(e.target.value))}
          className="w-full max-w-[200px]"
        />
      </div>

      {/* Optimization Buttons */}
      <div className="flex gap-4 mb-8">
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
      {yearsLast != 0 && (
        <div className="p-6 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-center">{selection}</h3>
          <div className="space-y-2">
            <p className="text-sm">Money will last for: <strong>{yearsLast} years</strong></p>
            <p className="text-sm">Total Taxes Paid: <strong>{USDollar.format(totalTaxesPaid(results))}</strong></p>
            <p className="text-sm">Roth + IRA Balance at 40 years: <strong>{USDollar.format(finalBalance(results))}</strong></p>
            <p className="text-sm">Total Forced Required Distributions: <strong>{USDollar.format(sumRequiredDistributions(results))}</strong></p>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  {["Retirement Year", "Your Age", "Ending Roth Balance", "Ending IRA Balance", "Spending Goal After Tax", "Total Withdrawn", "SS Income", "Taxes Paid"].map(header => (
                    <th key={header} className="border p-2 text-center">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index} className="border">
                    <td className="border p-2 text-center">{row.year}</td>
                    <td className="border p-2 text-center">{row.age}</td>
                    <td className="border p-2 text-center">{USDollar.format(row.rothBalance)}</td>
                    <td className="border p-2 text-center">{USDollar.format(row.tradBalance)}</td>
                    <td className="border p-2 text-center">{USDollar.format(row.currentSpendingGoal)}</td>
                    <td className="border p-2 text-center">{USDollar.format(row.totalAmountWithdrawn)}</td>
                    <td className="border p-2 text-center">{USDollar.format(row.ssIncome)}</td>
                    <td className="border p-2 text-center">{USDollar.format(row.taxesPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer Section */}
      <div className="mt-8 text-sm text-gray-600">
        <p className="mb-2">*This calculator provides estimates based on the inputs provided. It does not guarantee future results or account for all possible variables.</p>
        <p>**Consult a financial advisor for personalized advice.</p>
      </div>
    </div>
  );
}

export default App;
