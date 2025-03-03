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
import FormFieldWithTooltip from "./components/FormFieldWithTooltip";

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
  const [inflationRate, setInflationRate] = useState<number>(2);
  const [investmentReturn, setInvestmentReturn] = useState<number>(5);
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
    let strategy = optimizeAndSimulateRetirement(fn, getAges(), afterTax, beforeTax, spendingGoal,
      filingStatus, investmentReturn / 100, inflationRate / 100);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
    setSelection(strategyTxt)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Retirement Tax Calculator</h2>
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <FormFieldWithTooltip
            label="Your Tax Filing Status"
            tooltipText="Select 'Single' if you're unmarried or legally separated. Select 'Married' if you're married and filing jointly."
          >
            <Select onValueChange={(value) => setFilingStatus(value as "single" | "married")}>
              <SelectTrigger className="w-full max-w-[200px]">
                <SelectValue placeholder="Select your status" />
              </SelectTrigger>
              <SelectContent className="z-50 absolute bg-white shadow-lg">
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWithTooltip>
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
          <FormFieldWithTooltip
            label="Your Retirement Age"
            tooltipText="The age at which you will start withdrawing from your savings."
          >
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
          </FormFieldWithTooltip>
        </div>
        <div className="w-1/2">
          <FormFieldWithTooltip
            label="Your Social Security Claim Age"
            tooltipText="The age at which you will start claiming social security."
          >
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
          </FormFieldWithTooltip>
        </div>
      </div>
      {filingStatus === "married" && (
        <div className="flex gap-6 mb-6">
          <div className="w-1/2">
            <FormFieldWithTooltip
              label="Spouse's Retirement Age"
              tooltipText="The age at which your spouse will start withdrawing from your combined savings."
            >
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
            </FormFieldWithTooltip>
          </div>
          <div className="w-1/2">
            <FormFieldWithTooltip
              label="Spouse's Social Security Claim Age"
              tooltipText="The age at which your spouse will start claiming social security."
            >
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
            </FormFieldWithTooltip>
          </div>
        </div>
      )}
      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <FormFieldWithTooltip
            label="After Tax investments at retirement"
            tooltipText="Investments such as Roth IRAs"
          >
            <Input
              type="text"
              value={afterTax > 0 ? `$${afterTax.toLocaleString()}` : ''}
              onChange={(e) => setAfterTax(Number(e.target.value.replace(/[^0-9]/g, "")))}
              className="w-full max-w-[200px]"
            />
          </FormFieldWithTooltip>
        </div>
        <div className="w-1/2">
          <FormFieldWithTooltip
            label="Before Tax investments at retirement"
            tooltipText="Investments such as Traditional IRAs"
          >
            <Input
              type="text"
              value={beforeTax > 0 ? `$${beforeTax.toLocaleString()}` : ''}
              onChange={(e) => setBeforeTax(Number(e.target.value.replace(/[^0-9]/g, "")))}
              className="w-full max-w-[200px]"
            />
          </FormFieldWithTooltip>
        </div>
      </div>
      <div className="mb-6">
        <FormFieldWithTooltip
          label="Annual spending goal"
          tooltipText="How much do you think you'll need for retirement per year before taxes"
        >
          <Input
            type="text"
            value={spendingGoal > 0 ? `$${spendingGoal.toLocaleString()}` : ""}
            onChange={(e) => setSpendingGoal(Number(e.target.value.replace(/[^0-9]/g, "")))}
            className="w-full max-w-[200px]"
          />
        </FormFieldWithTooltip>

      </div>
      <div className="mb-6">
        <FormFieldWithTooltip
          label={`Inflation Rate: ${inflationRate}%`}
          tooltipText="Average Price Changes Every Year"
        >
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            className="w-full max-w-[200px]"
          />
        </FormFieldWithTooltip>
      </div>
      <div className="mb-6">
        <FormFieldWithTooltip
          label={`Investment Return: ${investmentReturn}%`}
          tooltipText="Average Yearly Return on your Investments"
        >
          <input
            type="range"
            min="3"
            max="9"
            step="1"
            value={investmentReturn}
            onChange={(e) => setInvestmentReturn(Number(e.target.value))}
            className="w-full max-w-[200px]"
          />
        </FormFieldWithTooltip>

      </div>
      <div className="flex flex-wrap gap-4 mb-8">
        <Button
          onClick={() => doCalculations(optimizeRothFirst, 'Roth First Strategy')}
          className="flex-1 min-w-[150px] basis-full sm:basis-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-102"
          disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}
        >
          Optimize Roth First
        </Button>
        <Button
          onClick={() => doCalculations(optimizeTraditionalFirst, 'Traditional First Strategy')}
          className="flex-1 min-w-[150px] basis-full sm:basis-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-102"
          disabled={(afterTax < 1 && beforeTax < 1) || spendingGoal < 1}
        >
          Optimize Trad First
        </Button>
        <Button
          onClick={() => doCalculations(optimizeProportionally, 'Proportional Strategy')}
          className="flex-1 min-w-[150px] basis-full sm:basis-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-102"
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
