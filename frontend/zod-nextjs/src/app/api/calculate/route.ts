import { NextRequest, NextResponse } from "next/server";
import { validateFormData } from "@/lib/validation";
import { calculateCompoundInterest } from "@/lib/calculations";
import { FormData, ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const formData: FormData = {
      principal: body.principal || "",
      annualRate: body.annualRate || "",
      compoundingFrequency: body.compoundingFrequency || "",
      years: body.years || "",
      monthlyContribution: body.monthlyContribution || "",
    };

    // Validate input data
    const validation = validateFormData(formData);

    if (!validation.isValid) {
      const response: ApiResponse = {
        success: false,
        error: "Validation failed",
        fieldErrors: validation.errors
          ? Object.entries(validation.errors).reduce((acc, [key, value]) => {
              acc[key] = [value];
              return acc;
            }, {} as Record<string, string[]>)
          : undefined,
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Perform calculation
    const result = calculateCompoundInterest(validation.data!);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);

    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
