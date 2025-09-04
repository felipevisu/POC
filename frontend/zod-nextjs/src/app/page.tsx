"use client";

import React, { useState } from "react";
import CalculatorForm from "./components/CalculatorForm";
import ResultsDisplay from "./components/ResultsDisplay";
import { FormData, CalculationResult, ApiResponse } from "@/lib/types";

export default function HomePage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: FormData) => {
    setLoading(true);
    setApiError(null);
    setResult(null);

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data: ApiResponse = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setApiError(data.error);
      }
    } catch {
      setApiError("Failed to calculate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Compound Interest Calculator
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <CalculatorForm onSubmit={handleFormSubmit} loading={loading} />
          <ResultsDisplay result={result} />
        </div>
        {apiError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {apiError}
          </div>
        )}

        {/* Architecture Notes */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Problems Without Zod
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                <strong>Repetitive validation:</strong> Same validation logic
                needed on client and server
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                <strong>Type safety gaps:</strong> No automatic type inference
                from validation rules
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                <strong>Error-prone:</strong> Easy to miss edge cases in manual
                validation
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                <strong>Maintenance burden:</strong> Changes require updates in
                multiple places
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                <strong>Inconsistent error messages:</strong> Hard to maintain
                consistency across validations
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
