import { FormData, ValidationResult } from "./types";
import { FormSchema } from "./schemas";
import z from "zod";

export function validateFormData(data: FormData): ValidationResult {
  try {
    const validated = FormSchema.parse(data);
    return {
      isValid: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) {
          errors[field.toString()] = issue.message;
        }
      });
      return { isValid: false, errors };
    }
    return {
      isValid: false,
      errors: {
        general: "An unexpected validation error occurred",
      },
    };
  }
}
