import { ICalculations } from "@/tools/types"
import { totalTaxesPaid, finalBalance, sumRequiredDistributions } from "@/tools/utils";

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
  return (
    <div className="p-6 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4 text-center">{props.selection}</h3>
      <div className="space-y-2">
        <p className="text-sm">Money will last for: <strong>{props.yearsLast} years</strong></p>
        <p className="text-sm">Total Taxes Paid: <strong>{USDollar.format(totalTaxesPaid(props.results))}</strong></p>
        <p className="text-sm">Roth + IRA Balance at 40 years: <strong>{USDollar.format(finalBalance(props.results))}</strong></p>
        <p className="text-sm">Total Forced Required Distributions: <strong>{USDollar.format(sumRequiredDistributions(props.results))}</strong></p>
      </div>
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
            {props.results.map((row, index) => (
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
    </div>)
}

export default ResultsSection