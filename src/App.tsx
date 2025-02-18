import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import './App.css'
import { calculateYearlySocialSecurity } from "./tools/calculateSocSec";
import { ICalculations, optimizeAndSimulateRetirement } from "./tools/optimization";

let USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 7
});

function App() {
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");
  const [ssClaimAge, setSsClaimAge] = useState<number>(65);
  const [afterTax, setAfterTax] = useState(0);
  const [beforeTax, setBeforeTax] = useState(0);
  const [spendingGoal, setSpendingGoal] = useState(0)
  const [results, setResults] = useState<ICalculations[]>([]);
  const [yearsLast, setYearsLast] = useState<number | string>(0);

  const calculateRetirement = () => {
    const claimingAge = filingStatus === 'single' ? [ssClaimAge] : [ssClaimAge, ssClaimAge];
    let ssIncome = claimingAge.reduce((prev, curr) => prev + calculateYearlySocialSecurity(curr), 0);
    let strategy = optimizeAndSimulateRetirement(ssIncome, afterTax, beforeTax, spendingGoal, filingStatus, ssClaimAge);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-center mb-4">Retirement Calculator</h2>
      <div>
        <label className="block text-sm font-medium">Filing Status</label>
        <Select onValueChange={(value) => setFilingStatus(value as "single" | "married")}>
          <SelectTrigger>
            <SelectValue placeholder="Select your status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married">Married</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium">Social Security Claim Age</label>
        <Select onValueChange={(value) => setSsClaimAge(Number(value))}>
          <SelectTrigger>
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
      <div>
        <label className="block text-sm font-medium">Roth Balance ($)</label>
        <Input type="number" value={afterTax} onChange={(e) => setAfterTax(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium">Traditional IRA Balance ($)</label>
        <Input type="number" value={beforeTax} onChange={(e) => setBeforeTax(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium">Annual Spending Goal ($)</label>
        <Input type="number" value={spendingGoal} onChange={(e) => setSpendingGoal(Number(e.target.value))} />
      </div>
      <Button onClick={calculateRetirement} className="mt-4 w-full">
        Calculate
      </Button>
      {yearsLast !== null && (
        <p className="mt-4 text-lg font-semibold">
          Money will last for {yearsLast} years in retirement.
        </p>
      )}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Year</th>
              <th className="border p-2">Age</th>
              <th className="border p-2">Roth Balance</th>
              <th className="border p-2">IRA Balance</th>
              <th className="border p-2">Roth Withdrawal</th>
              <th className="border p-2">IRA Withdrawal</th>
              <th className="border p-2">Spending Goal</th>
              <th className="border p-2">Total Withdrawn</th>
              <th className="border p-2">SS Income</th>
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
                <td className="border p-2">{USDollar.format(row.currentSpendingGoal)}</td>
                <td className="border p-2">{USDollar.format(row.totalAmountWithdrawn)}</td>
                <td className="border p-2">{USDollar.format(row.ssIncome)}</td>
                <td className="border p-2">{USDollar.format(row.taxesPaid)}</td>
                <td className="border p-2">{USDollar.format(row.medicareCosts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App
