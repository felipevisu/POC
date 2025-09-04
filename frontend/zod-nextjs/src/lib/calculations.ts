import { ParsedFormData, CalculationResult } from "./types";

export function calculateCompoundInterest(
  data: ParsedFormData
): CalculationResult {
  const {
    principal,
    annualRate,
    compoundingFrequency,
    years,
    monthlyContribution,
  } = data;

  const yearlyBreakdown = [];
  let currentAmount = principal;
  let totalContributions = principal;

  for (let year = 1; year <= years; year++) {
    // Calculate monthly growth with contributions
    for (let month = 1; month <= 12; month++) {
      // Add monthly contribution at the beginning of each month
      if (month > 1 || year > 1) {
        currentAmount += monthlyContribution;
        totalContributions += monthlyContribution;
      }

      // Apply compound interest based on frequency
      const compoundingPeriods = 12 / compoundingFrequency;
      if (month % compoundingPeriods === 0) {
        currentAmount *= 1 + annualRate / compoundingFrequency;
      }
    }

    const yearInterest = currentAmount - totalContributions;

    yearlyBreakdown.push({
      year,
      amount: currentAmount,
      contributions: totalContributions,
      interest: yearInterest,
    });
  }

  return {
    finalAmount: currentAmount,
    totalContributions,
    totalInterest: currentAmount - totalContributions,
    yearlyBreakdown,
  };
}
