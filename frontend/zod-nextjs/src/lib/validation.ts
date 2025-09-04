import { FormData, ParsedFormData, ValidationResult } from "./types";

export function validateFormData(data: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Parse principal
  const principal = parseFloat(data.principal);
  if (isNaN(principal)) {
    errors.principal = "Principal must be a number";
  } else if (principal < 0) {
    errors.principal = "Principal must be positive";
  } else if (principal > 10000000) {
    errors.principal = "Principal must be less than $10,000,000";
  }

  // Parse annual rate
  const annualRate = parseFloat(data.annualRate);
  if (isNaN(annualRate)) {
    errors.annualRate = "Annual rate must be a number";
  } else if (annualRate < 0) {
    errors.annualRate = "Annual rate must be positive";
  } else if (annualRate > 100) {
    errors.annualRate = "Annual rate must be less than 100%";
  }

  // Parse compounding frequency
  const compoundingFrequency = parseInt(data.compoundingFrequency);
  if (isNaN(compoundingFrequency)) {
    errors.compoundingFrequency = "Invalid compounding frequency";
  } else if (compoundingFrequency < 1 || compoundingFrequency > 365) {
    errors.compoundingFrequency =
      "Compounding frequency must be between 1 and 365";
  }

  // Parse years
  const years = parseInt(data.years);
  if (isNaN(years)) {
    errors.years = "Years must be a number";
  } else if (years < 1) {
    errors.years = "Years must be at least 1";
  } else if (years > 50) {
    errors.years = "Years must be 50 or less";
  }

  // Parse monthly contribution
  const monthlyContribution = parseFloat(data.monthlyContribution);
  if (isNaN(monthlyContribution)) {
    errors.monthlyContribution = "Monthly contribution must be a number";
  } else if (monthlyContribution < 0) {
    errors.monthlyContribution = "Monthly contribution cannot be negative";
  } else if (monthlyContribution > 100000) {
    errors.monthlyContribution =
      "Monthly contribution must be less than $100,000";
  }

  // Check if there are any errors
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  // Business logic validation
  if (annualRate === 0 && monthlyContribution === 0) {
    return {
      isValid: false,
      errors: {
        general:
          "Either interest rate or monthly contribution must be greater than 0",
      },
    };
  }

  return {
    isValid: true,
    data: {
      principal,
      annualRate: annualRate / 100, // Convert percentage to decimal
      compoundingFrequency,
      years,
      monthlyContribution,
    },
  };
}
