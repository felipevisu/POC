export interface FormData {
  principal: string;
  annualRate: string;
  compoundingFrequency: string;
  years: string;
  monthlyContribution: string;
}

export interface ParsedFormData {
  principal: number;
  annualRate: number;
  compoundingFrequency: number;
  years: number;
  monthlyContribution: number;
}

export interface YearlyBreakdown {
  year: number;
  amount: number;
  contributions: number;
  interest: number;
}

export interface CalculationResult {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export interface ApiSuccessResponse {
  success: true;
  data: CalculationResult;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export interface ValidationResult {
  isValid: boolean;
  data?: ParsedFormData;
  errors?: Record<string, string>;
}
