"use client";

import React from "react";
import { CalculationResult } from "@/lib/types";
import { formatCurrency } from "@/utils/format";

interface ResultsDisplayProps {
  result: CalculationResult | null;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Investment Results
        </h2>
        <div className="text-center py-12 text-gray-500">
          <svg
            className="w-24 h-24 mx-auto mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p>
            Enter your investment details and click Calculate to see your
            returns
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Investment Results
      </h2>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Final Amount</p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(result.finalAmount)}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
            <p className="text-xl font-semibold text-blue-700">
              {formatCurrency(result.totalContributions)}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Total Interest Earned</p>
            <p className="text-xl font-semibold text-purple-700">
              {formatCurrency(result.totalInterest)}
            </p>
          </div>
        </div>

        {/* Yearly Breakdown Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Yearly Breakdown
          </h3>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-600">Year</th>
                  <th className="px-3 py-2 text-right text-gray-600">
                    Balance
                  </th>
                  <th className="px-3 py-2 text-right text-gray-600">
                    Interest
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyBreakdown.map((year) => (
                  <tr key={year.year} className="border-b border-gray-100">
                    <td className="px-3 py-2">{year.year}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatCurrency(year.amount)}
                    </td>
                    <td className="px-3 py-2 text-right text-green-600">
                      {formatCurrency(year.interest)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
