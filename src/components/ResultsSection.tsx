import { ICalculations } from "@/tools/types"
import { totalTaxesPaid, finalBalance, sumRequiredDistributions } from "@/tools/utils";
import { useState } from "react";

let USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 7
});

interface IProps {
  results: ICalculations[]
  yearsLast: number | string;
  selection: string;
}

function ResultsSection(props: IProps) {
  const [showTable, setShowTable] = useState<boolean>(false);
  const [showMedicare, setShowMedicare] = useState<boolean>(false);
  const [showRMD, setShowRMD] = useState<boolean>(false);
  const [showForcedRMD, setShowForcedRMD] = useState<boolean>(false);
  const [showWithdrawals, setShowWithdrawals] = useState<boolean>(false);

  const getColumnLabels = (): string[] => {
    let labels = ["Year", "Your Age", "Ending Roth Balance", "Ending IRA Balance", "Spending Goal After Tax", "Total Withdrawn", "SS Income", "Taxes Paid"];
    if (showMedicare) {
      labels.push("Medicare Costs")
    }
    if(showRMD) {
      labels.push("Required Minimum Distributions")
    }
    if(showWithdrawals) {
      labels.push("Withdrawals from Roth");
      labels.push("Withdrawals from Traditional")
    }
    if(showForcedRMD) {
      labels.push("Forced Required Distributions");
    }
    return labels;
  }

  return (
    <div className="p-8 border rounded-xl bg-gray-50 shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-center">{props.selection}</h3>

      <div className="space-y-4">
        <p className="text-base">
          💰 <strong>Money will last for:</strong> {props.yearsLast} years
        </p>
        <p className="text-base">
          💸 <strong>Total Taxes Paid:</strong> {USDollar.format(totalTaxesPaid(props.results))}
        </p>
        <p className="text-base">
          📈 <strong>Roth + IRA Balance at 40 years:</strong> {USDollar.format(finalBalance(props.results))}
        </p>
        <p className="text-base">
          🔄 <strong>Total Forced Required Distributions:</strong> {USDollar.format(sumRequiredDistributions(props.results))}
        </p>

        <div className="flex flex-col space-y-3 mt-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={showTable}
              onChange={() => setShowTable(!showTable)}
              className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring focus:ring-blue-300"
            />
            <span className="text-base font-semibold">Show Detailed Table</span>
          </label>

          {showTable && (
            <div className="ml-8 flex flex-col space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={showMedicare}
                  onChange={() => setShowMedicare(!showMedicare)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring focus:ring-blue-300"
                />
                <span className="text-sm">Show Medicare Costs</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={showRMD}
                  onChange={() => setShowRMD(!showRMD)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring focus:ring-blue-300"
                />
                <span className="text-sm">Show Required Minimum Distributions</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={showWithdrawals}
                  onChange={() => setShowWithdrawals(!showWithdrawals)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring focus:ring-blue-300"
                />
                <span className="text-sm">Show Withdrawals</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={showForcedRMD}
                  onChange={() => setShowForcedRMD(!showForcedRMD)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring focus:ring-blue-300"
                />
                <span className="text-sm">Show Forced Required Minimum Distributions</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {showTable && (
        <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse border text-base">
          <thead>
            <tr className="bg-gray-200 text-lg">
              {getColumnLabels().map(header => (
                <th key={header} className="border p-4 text-center">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.results.map((row, index) => (
              <tr key={index} className="border">
                <td className="border p-4 text-center">{row.year}</td>
                <td className="border p-4 text-center">{row.age}</td>
                <td className="border p-4 text-center">{USDollar.format(row.rothBalance)}</td>
                <td className="border p-4 text-center">{USDollar.format(row.tradBalance)}</td>
                <td className="border p-4 text-center">{USDollar.format(row.currentSpendingGoal)}</td>
                <td className="border p-4 text-center">{USDollar.format(row.totalAmountWithdrawn)}</td>
                <td className="border p-4 text-center">{USDollar.format(row.ssIncome)}</td>
                <td className="border p-4 text-center">{USDollar.format(row.taxesPaid)}</td>
                {showMedicare && <td className="border p-4 text-center">{USDollar.format(row.medicareCosts)}</td>}
                {showRMD && <td className="border p-4 text-center">{USDollar.format(row.requiredMinimumDistributions)}</td>}
                {showWithdrawals && <td className="border p-4 text-center">{USDollar.format(row.withdrawalsFromRoth)}</td>}
                {showWithdrawals && <td className="border p-4 text-center">{USDollar.format(row.withdrawalsFromTrad)}</td>}
                {showForcedRMD && <td className="border p-4 text-center">{USDollar.format(row.extraFromRMD)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>)
}

export default ResultsSection