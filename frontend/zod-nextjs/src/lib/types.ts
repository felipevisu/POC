import z from "zod";
import {
  ApiResponseSchema,
  CalculationResultSchema,
  FormSchema,
} from "./schemas";

export type FormData = z.input<typeof FormSchema>;

export type ParsedFormData = z.output<typeof FormSchema>;

export type CalculationResult = z.infer<typeof CalculationResultSchema>;

export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type ApiSuccessResponse = Extract<ApiResponse, { success: true }>;
export type ApiErrorResponse = Extract<ApiResponse, { success: false }>;

export interface ValidationResult {
  isValid: boolean;
  data?: ParsedFormData;
  errors?: Record<string, string>;
}
