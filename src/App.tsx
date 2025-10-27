import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
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
  const [lastStrategy, setLastStrategy] = useState<any>(null);
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");
  const [currentAge, setCurrentAge] = useState<number>(55); // New state for current age
  const [spouseCurrentAge, setSpouseCurrentAge] = useState<number>(55); // New state for spouse's current age
  const [retirementAgePrimary, setRetirementAgePrimary] = useState<number>(65);
  const [retirementAgeSecondary, setRetirementAgeSecondary] = useState<number>(65);
  const [ssClaimAgePrimary, setSsClaimAgePrimary] = useState<number>(65);
  const [ssClaimAgeSpouse, setSsClaimAgeSpouse] = useState<number>(65);
  const [afterTax, setAfterTax] = useState(0);
  const [beforeTax, setBeforeTax] = useState(0);
  const [rothConversionAmount, setRothConversionAmount] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [inflationRate, setInflationRate] = useState<number>(2);
  const [investmentReturn, setInvestmentReturn] = useState<number>(5);
  const [spendingGoal, setSpendingGoal] = useState(0);
  const [results, setResults] = useState<ICalculations[]>([]);
  const [yearsLast, setYearsLast] = useState<number | string>(0);
  const [autoCalculate, setAutoCalculate] = useState<boolean>(false);

  // Calculate total assets when either value changes
  const handleTotalAssetsChange = (value: number) => {
    setTotalAssets(value);
    // Reset conversion amount when total changes
    if (rothConversionAmount > value) {
      setRothConversionAmount(0);
    }
  };

  const handleRothConversionChange = (value: number) => {
    setRothConversionAmount(value);
    setAfterTax(value);
    setBeforeTax(totalAssets - value);
  };

  // Auto-calculate when slider moves (if a strategy has been selected)
  useEffect(() => {
    if (autoCalculate && lastStrategy && afterTax >= 0 && beforeTax >= 0 && spendingGoal > 0) {
      const timer = setTimeout(() => {
        doCalculations(lastStrategy.fn, lastStrategy.name);
      }, 500); // Debounce by 500ms
      return () => clearTimeout(timer);
    }
  }, [afterTax, beforeTax, autoCalculate]);

  const getAges = (): IAges[] => {
    const ages: IAges[] = [{ currentAge, retirementAge: retirementAgePrimary, ssClaimingAge: ssClaimAgePrimary }];
    if (filingStatus === 'married') {
      ages.push({ currentAge: spouseCurrentAge, retirementAge: retirementAgeSecondary, ssClaimingAge: ssClaimAgeSpouse });
    }
    return ages;
  };

  const doCalculations = (fn: any, strategyTxt: string) => {
    setLastStrategy({ fn, name: strategyTxt });
    setAutoCalculate(true);
    let strategy = optimizeAndSimulateRetirement(fn, getAges(), afterTax, beforeTax, spendingGoal,
      filingStatus, investmentReturn / 100, inflationRate / 100);
    setResults(strategy.details);
    setYearsLast(strategy.moneyLastYears);
    setSelection(strategyTxt)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Retirement Tax Calculator</h2>
      
      {/* Personal Information Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">👤 Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormFieldWithTooltip
              label="Tax Filing Status"
              tooltipText="Select 'Single' if you're unmarried or legally separated. Select 'Married' if you're married and filing jointly."
            >
              <Select onValueChange={(value) => setFilingStatus(value as "single" | "married")}>
                <SelectTrigger className="w-full max-w-[250px]">
                  <SelectValue placeholder="Select your status" />
                </SelectTrigger>
                <SelectContent className="z-50 absolute bg-white shadow-lg">
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWithTooltip>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Current Age</label>
            <Input
              type="number"
              value={currentAge > 0 ? currentAge : ''}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className="w-full max-w-[250px]"
              placeholder="e.g., 55"
            />
          </div>

          {filingStatus === "married" && (
            <div>
              <label className="block text-sm font-medium mb-2">Spouse's Current Age</label>
              <Input
                type="number"
                value={spouseCurrentAge > 0 ? spouseCurrentAge : ''}
                onChange={(e) => setSpouseCurrentAge(Number(e.target.value))}
                className="w-full max-w-[250px]"
                placeholder="e.g., 55"
              />
            </div>
          )}
        </div>
      </div>

      {/* Retirement Planning Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">📅 Retirement Planning</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormFieldWithTooltip
              label="Your Retirement Age"
              tooltipText="The age at which you will start withdrawing from your savings."
            >
              <Select onValueChange={(value) => setRetirementAgePrimary(Number(value))}>
                <SelectTrigger className="w-full max-w-[250px]">
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

          <div>
            <FormFieldWithTooltip
              label="Your Social Security Claim Age"
              tooltipText="The age at which you will start claiming social security."
            >
              <Select onValueChange={(value) => setSsClaimAgePrimary(Number(value))}>
                <SelectTrigger className="w-full max-w-[250px]">
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

          {filingStatus === "married" && (
            <>
              <div>
                <FormFieldWithTooltip
                  label="Spouse's Retirement Age"
                  tooltipText="The age at which your spouse will start withdrawing from your combined savings."
                >
                  <Select onValueChange={(value) => setRetirementAgeSecondary(Number(value))}>
                    <SelectTrigger className="w-full max-w-[250px]">
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

              <div>
                <FormFieldWithTooltip
                  label="Spouse's Social Security Claim Age"
                  tooltipText="The age at which your spouse will start claiming social security."
                >
                  <Select onValueChange={(value) => setSsClaimAgeSpouse(Number(value))}>
                    <SelectTrigger className="w-full max-w-[250px]">
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
            </>
          )}
        </div>
      </div>

      {/* Financial Assumptions Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">💰 Financial Assumptions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormFieldWithTooltip
              label="Annual Spending Goal"
              tooltipText="How much do you think you'll need for retirement per year before taxes"
            >
              <Input
                type="text"
                value={spendingGoal > 0 ? `$${spendingGoal.toLocaleString()}` : ""}
                onChange={(e) => setSpendingGoal(Number(e.target.value.replace(/[^0-9]/g, "")))}
                className="w-full max-w-[250px]"
                placeholder="e.g., $100,000"
              />
            </FormFieldWithTooltip>
          </div>

          <div>
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
                className="w-full max-w-[250px]"
              />
            </FormFieldWithTooltip>
          </div>

          <div>
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
                className="w-full max-w-[250px]"
              />
            </FormFieldWithTooltip>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">💡 Roth Conversion Explorer</h3>
        <div className="mb-4">
          <FormFieldWithTooltip
            label="Total Retirement Assets"
            tooltipText="Your total combined retirement savings (Traditional IRA + Roth IRA)"
          >
            <Input
              type="text"
              value={totalAssets > 0 ? `$${totalAssets.toLocaleString()}` : ''}
              onChange={(e) => handleTotalAssetsChange(Number(e.target.value.replace(/[^0-9]/g, "")))}
              className="w-full max-w-[300px]"
              placeholder="e.g., $4,000,000"
            />
          </FormFieldWithTooltip>
        </div>
        
        {totalAssets > 0 && (
          <div className="mb-4">
            <FormFieldWithTooltip
              label={`Roth Conversion Amount: $${rothConversionAmount.toLocaleString()}`}
              tooltipText="Slide to explore different Roth conversion amounts. Results will auto-update!"
            >
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={totalAssets}
                  step={totalAssets / 100}
                  value={rothConversionAmount}
                  onChange={(e) => handleRothConversionChange(Number(e.target.value))}
                  className="w-full max-w-[500px]"
                />
                <div className="flex justify-between text-xs text-gray-600 max-w-[500px]">
                  <span>$0 (0%)</span>
                  <span>${(totalAssets / 4).toLocaleString()} (25%)</span>
                  <span>${(totalAssets / 2).toLocaleString()} (50%)</span>
                  <span>${(totalAssets * 3 / 4).toLocaleString()} (75%)</span>
                  <span>${totalAssets.toLocaleString()} (100%)</span>
                </div>
              </div>
            </FormFieldWithTooltip>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Roth IRA (Tax-Free)</div>
                <div className="text-lg font-semibold text-green-700">${afterTax.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{totalAssets > 0 ? ((afterTax / totalAssets) * 100).toFixed(1) : 0}%</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Traditional IRA (Taxable)</div>
                <div className="text-lg font-semibold text-orange-700">${beforeTax.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{totalAssets > 0 ? ((beforeTax / totalAssets) * 100).toFixed(1) : 0}%</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-3 text-sm text-gray-600 italic">
          💡 Tip: Move the slider to see real-time updates on how different Roth conversions affect your retirement!
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button
          onClick={() => doCalculations(optimizeRothFirst, 'Roth First Strategy')}
          className="flex-1 min-w-[150px] basis-full sm:basis-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-102"
          disabled={totalAssets < 1 || spendingGoal < 1}
        >
          Optimize Roth First
        </Button>
        <Button
          onClick={() => doCalculations(optimizeTraditionalFirst, 'Traditional First Strategy')}
          className="flex-1 min-w-[150px] basis-full sm:basis-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-102"
          disabled={totalAssets < 1 || spendingGoal < 1}
        >
          Optimize Trad First
        </Button>
        <Button
          onClick={() => doCalculations(optimizeProportionally, 'Proportional Strategy')}
          className="flex-1 min-w-[150px] basis-full sm:basis-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-102"
          disabled={totalAssets < 1 || spendingGoal < 1}
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
