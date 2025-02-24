import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import './App.css';
import Disclaimer from "./components/Disclaimer";
import ResultsSection from "./components/ResultsSection";
import { optimizeAndSimulateRetirement } from "./tools/optimization";
import { optimizeProportionally } from "./tools/optimizeProportionally";
import { optimizeRothFirst } from "./tools/optimizeRothFirst";
import { optimizeTraditionalFirst } from "./tools/optimizeTraditionalFirst";
import { IAges, ICalculations } from "./tools/types";

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
    const ages: IAges[] = [{ currentAge, retirementAge: retirementAgePrimary, ssClaimingAge: ssClaimAgePrimary }];
    if (filingStatus === 'married') {
      ages.push({ currentAge: spouseCurrentAge, retirementAge: retirementAgeSecondary, ssClaimingAge: ssClaimAgeSpouse });
    }
    return ages;
  };

  const doCalculations = (fn: any, strategyTxt: string) => {
    let strategy = optimizeAndSimulateRetirement(fn, getAges(), afterTax, beforeTax, spendingGoal, filingStatus);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
    setSelection(strategyTxt)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Retirement Tax Calculator</h2>
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Your Tax Filing Status</label>
          <Select onValueChange={(value) => setFilingStatus(value as "single" | "married")}>
            <SelectTrigger className="w-full max-w-[200px]">
              <SelectValue placeholder="Select your status" />
            </SelectTrigger>
            <SelectContent className="z-50 absolute bg-white shadow-lg">
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
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
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Your Retirement Age</label>
          <Select onValueChange={(value) => setRetirementAgePrimary(Number(value))}>
            <SelectTrigger className="w-full max-w-[200px]">
              <SelectValue placeholder="Select retirement age" />
            </SelectTrigger>
            <SelectContent className="z-50 absolute bg-white shadow-lg">
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
            <SelectContent className="z-50 absolute bg-white shadow-lg">
              {Array.from({ length: 10 }, (_, i) => 62 + i).map((age) => (
                <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {filingStatus === "married" && (
        <div className="flex gap-6 mb-6">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">Spouse Retirement Age</label>
            <Select onValueChange={(value) => setRetirementAgeSecondary(Number(value))}>
              <SelectTrigger className="w-full max-w-[200px]">
                <SelectValue placeholder="Select spouse's retirement age" />
              </SelectTrigger>
              <SelectContent className="z-50 absolute bg-white shadow-lg">
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
              <SelectContent className="z-50 absolute bg-white shadow-lg">
                {Array.from({ length: 10 }, (_, i) => 62 + i).map((age) => (
                  <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">After Tax Investments At Retirement, e.g. Roth ($)</label>
          <Input
            type="number"
            value={afterTax > 0 ? afterTax : ''}
            onChange={(e) => setAfterTax(Number(e.target.value))}
            className="w-full max-w-[200px]"
          />
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Before Tax Investments At Retirement, e.g. Traditional ($)</label>
          <Input
            type="number"
            value={beforeTax > 0 ? beforeTax : ''}
            onChange={(e) => setBeforeTax(Number(e.target.value))}
            className="w-full max-w-[200px]"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Annual Spending Goal AFTER Taxes ($)</label>
        <Input
          type="number"
          value={spendingGoal > 0 ? spendingGoal : ''}
          onChange={(e) => setSpendingGoal(Number(e.target.value))}
          className="w-full max-w-[200px]"
        />
      </div>
      <div className="flex flex-wrap gap-4 mb-8">
  <Button
    onClick={() => doCalculations(optimizeRothFirst, 'Roth First Strategy')}
    className="flex-1 min-w-[150px] basis-full sm:basis-auto"
    disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}
  >
    Optimize Roth First
  </Button>
  <Button
    onClick={() => doCalculations(optimizeTraditionalFirst, 'Traditional First Strategy')}
    className="flex-1 min-w-[150px] basis-full sm:basis-auto"
    disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}
  >
    Optimize Trad First
  </Button>
  <Button
    onClick={() => doCalculations(optimizeProportionally, 'Proportional Strategy')}
    className="flex-1 min-w-[150px] basis-full sm:basis-auto"
    disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}
  >
    Optimize Proportional
  </Button>
</div>
      {yearsLast != 0 && (
        <ResultsSection results={results} selection={selection} yearsLast={yearsLast} />
      )}
      <Disclaimer />
    </div>
  );
}

export default App;
