import { z } from "zod";

export const PrincipalSchema = z
  .string()
  .min(1, "Principal is required")
  .transform((val) => parseFloat(val))
  .pipe(z.number().min(0, "Must be positive"));

export const AnnualRateSchema = z
  .string()
  .min(1, "Rate is required")
  .transform((val) => parseFloat(val))
  .pipe(z.number().min(0, "Must be at least 0%").max(100, "Must be under 100%"))
  .transform((val) => val / 100);

export const CompoundingFrequencySchema = z
  .string()
  .transform((str) => parseInt(str))
  .pipe(z.number().int().min(1).max(365));

export const YearsSchema = z
  .string()
  .transform((str) => parseInt(str))
  .pipe(z.number().int().min(1, "Minimum 1 year").max(50, "Maximum 50 years"));

export const MonthlyContributionSchema = z
  .string()
  .transform((str) => parseFloat(str))
  .pipe(z.number().min(0, "Cannot be negative").max(100_000, "Too large"));

export const FormSchema = z
  .object({
    principal: PrincipalSchema,
    annualRate: AnnualRateSchema,
    compoundingFrequency: CompoundingFrequencySchema,
    years: YearsSchema,
    monthlyContribution: MonthlyContributionSchema,
  })
  .refine(
    (data) => {
      return data.annualRate > 0 || data.monthlyContribution > 0;
    },
    {
      message:
        "Either interest rate or monthly contribution must be greater than 0",
      path: ["general"],
    }
  );
