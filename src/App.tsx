import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import './App.css'
import { calculateYearlySocialSecurity } from "./tools/calculateSocSec";
import { ICalculations, optimizeAndSimulateRetirement } from "./tools/optimization";

let USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 7
});

function App() {
  const [numPeople, setNumPeople] = useState("1");
  const [ageClaiming, setAgeClaiming] = useState("65");
  const [afterTax, setAfterTax] = useState(0);
  const [beforeTax, setBeforeTax] = useState(0);
  const [spendingGoal, setSpendingGoal] = useState(0)
  const [results, setResults] = useState<ICalculations[]>([]);
  const [yearsLast, setYearsLast] = useState<number | string>(0);

  const calculateRetirement = () => {
    let claimingAge = [65, 62];    // Age at which person claims benefits
    let filingStatus: "single" | "married" = claimingAge.length === 1 ? "single" : "married";
    let ssIncome = claimingAge.reduce((prev, curr) => prev + calculateYearlySocialSecurity(curr), 0);
    let strategy = optimizeAndSimulateRetirement(ssIncome, afterTax, beforeTax, spendingGoal, filingStatus);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Retirement Calculator</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* <Select value={numPeople}>
          <SelectItem value="1">1 Person</SelectItem>
          <SelectItem value="2">2 People</SelectItem>
        </Select>
        <Select value={ageClaiming}>
          {[...Array(36).keys()].map((i) => (
            <SelectItem key={i + 62} value={(i + 62).toString()}>
              {i + 62} Years
            </SelectItem>
          ))}
        </Select> */}
      </div>
      <Input
        type="number"
        placeholder="After-Tax Account Balance"
        onChange={(e) => setAfterTax(Number(e.target.value))}
      />
      <Input
        type="number"
        placeholder="Before-Tax Account Balance"
        onChange={(e) => setBeforeTax(Number(e.target.value))}
        className="mt-2"
      />
      <Input
        type="number"
        placeholder="Spending Yearly Goal"
        onChange={(e) => setSpendingGoal(Number(e.target.value))}
        className="mt-2"
      />
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
              <th className="border p-2">Spending Goal</th>
              <th className="border p-2">Roth Balance</th>
              <th className="border p-2">IRA Balance</th>
              <th className="border p-2">SS Income</th>
              <th className="border p-2">Roth Withdrawal</th>
              <th className="border p-2">IRA Withdrawal</th>
              <th className="border p-2">Total Withdrawn</th>
              <th className="border p-2">Taxes Paid</th>
              <th className="border p-2">Medicare Costs</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{row.year}</td>
                <td className="border p-2">{row.age}</td>
                <td className="border p-2">{USDollar.format(row.currentSpendingGoal)}</td>
                <td className="border p-2">{USDollar.format(row.rothBalance)}</td>
                <td className="border p-2">{USDollar.format(row.tradBalance)}</td>
                <td className="border p-2">{USDollar.format(row.ssIncome)}</td>
                <td className="border p-2">{USDollar.format(row.withdrawalsFromRoth)}</td>
                <td className="border p-2">{USDollar.format(row.withdrawalsFromTrad)}</td>
                <td className="border p-2">{USDollar.format(row.totalAmountWithdrawn)}</td>
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
