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
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-center mb-4">Retirement Calculator</h2>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-64">
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
        <div className="w-64">
          <label className="block text-sm font-medium">Retirement Age</label>
          <Select onValueChange={(value) => setRetirementAgePrimary(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select retirement age" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => 55 + i).map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filingStatus === "married" && (<div className="w-64">
          <label className="block text-sm font-medium">Spouse Retirement Age</label>
          <Select onValueChange={(value) => setRetirementAgeSecondary(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select spouse's retirement age" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => 55 + i).map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>)}
        <div className="w-64">
          <label className="block text-sm font-medium">
            {filingStatus === "married" ? "Primary Person's" : "Your"} Social Security Claim Age
          </label>
          <Select onValueChange={(value) => setSsClaimAgePrimary(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select age" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => 62 + i).map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filingStatus === "married" && (
          <div className="w-64">
            <label className="block text-sm font-medium">Spouse's Social Security Claim Age</label>
            <Select onValueChange={(value) => setSsClaimAgeSpouse(Number(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select age" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => 62 + i).map((age) => (
                  <SelectItem key={age} value={age.toString()}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="w-64">
          <label className="block text-sm font-medium">After Tax Investments (e.g. Roth) ($)</label>
          <Input type="number" value={afterTax > 0 ? afterTax : ''} onChange={(e) => setAfterTax(Number(e.target.value))} />
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium">Before Tax Investments (e.g. Traditional IRA) ($)</label>
          <Input type="number" value={beforeTax > 0 ? beforeTax : ''} onChange={(e) => setBeforeTax(Number(e.target.value))} />
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium">Annual Spending Goal ($)</label>
          <Input type="number" value={spendingGoal > 0 ? spendingGoal : ''} onChange={(e) => setSpendingGoal(Number(e.target.value))} />
        </div>
        <Button onClick={useRothFirst} className="w-64" disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}>
          Optimize Roth First
        </Button>
        <Button onClick={useTraditionalFirst} className="w-64" disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}>
          Optimize Trad First
        </Button>
        <Button onClick={useProportionally} className="w-64" disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}>
          Optimize Proportional
        </Button>
        {yearsLast && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">Results</h3>
            <p>Money will last for: <strong>{yearsLast} years</strong></p>
            <p>Total Taxes Paid: <strong>{USDollar.format(totalTaxesPaid(results))}</strong></p>
            <p>Roth + IRA Balance at 40 years: <strong>{USDollar.format(finalBalance(results))}</strong></p>
            <p>Total Forced Required Distributions: <strong>{USDollar.format(sumRequiredDistributions(results))}</strong></p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border mt-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Year</th>
                    <th className="border p-2">Age</th>
                    <th className="border p-2">Roth Balance</th>
                    <th className="border p-2">IRA Balance</th>
                    <th className="border p-2">Roth Withdrawal</th>
                    <th className="border p-2">IRA Withdrawal</th>
                    <th className="border p-2">Req Min Distrib</th>
                    <th className="border p-2">Spending Goal</th>
                    <th className="border p-2">Total Withdrawn</th>
                    <th className="border p-2">SS Income</th>
                    <th className="border p-2">Extra from Req Min Distrib</th>
                    <th className="border p-2">Taxes Paid</th>
                    <th className="border p-2">Medicare Costs</th>
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
                      <td className="border p-2">{USDollar.format(row.requiredMinimumDistributions)}</td>
                      <td className="border p-2">{USDollar.format(row.currentSpendingGoal)}</td>
                      <td className="border p-2">{USDollar.format(row.totalAmountWithdrawn)}</td>
                      <td className="border p-2">{USDollar.format(row.ssIncome)}</td>
                      <td className="border p-2">{USDollar.format(row.extraFromRMD)}</td>
                      <td className="border p-2">{USDollar.format(row.taxesPaid)}</td>
                      <td className="border p-2">{USDollar.format(row.medicareCosts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
