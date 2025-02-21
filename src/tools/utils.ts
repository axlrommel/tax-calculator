import { ICalculations } from "./types";

export const totalTaxesPaid = (results: ICalculations[]): number => {
  let total = 0
  results.forEach(r => {
    total = total + r.taxesPaid;
  })
  return total;
}

export const finalBalance = (results: ICalculations[]): number => {
  const numResults = results.length;
  return results[numResults - 1].tradBalance + results[numResults - 1].rothBalance;
}

export const sumRequiredDistributions = (results: ICalculations[]): number => {
  let total = 0
  results.forEach(r => {
    total = total + r.extraFromRMD;
  })
  return total;
}