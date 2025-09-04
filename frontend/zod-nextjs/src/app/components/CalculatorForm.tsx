"use client";

import React from "react";
import { FormData } from "@/lib/types";

interface CalculatorFormProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onSubmit: () => void;
  loading: boolean;
  errors: Record<string, string>;
}

export default function CalculatorForm({
  formData,
  onChange,
  onSubmit,
  loading,
  errors,
}: CalculatorFormProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Calculate Your Investment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="principal"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Initial Investment ($)
          </label>
          <input
            type="number"
            id="principal"
            name="principal"
            value={formData.principal}
            onChange={handleInputChange}
            className={`text-gray-500 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${
                errors.principal
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            step="0.01"
            disabled={loading}
          />
          {errors.principal && (
            <p className="mt-1 text-sm text-red-600">{errors.principal}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="annualRate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            id="annualRate"
            name="annualRate"
            value={formData.annualRate}
            onChange={handleInputChange}
            className={`text-gray-500 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${
                errors.annualRate
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            step="0.01"
            disabled={loading}
          />
          {errors.annualRate && (
            <p className="mt-1 text-sm text-red-600">{errors.annualRate}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="compoundingFrequency"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Compounding Frequency
          </label>
          <select
            id="compoundingFrequency"
            name="compoundingFrequency"
            value={formData.compoundingFrequency}
            onChange={handleInputChange}
            className={`text-gray-500 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${
                errors.compoundingFrequency
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            disabled={loading}
          >
            <option value="1">Annually</option>
            <option value="2">Semi-annually</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </select>
          {errors.compoundingFrequency && (
            <p className="mt-1 text-sm text-red-600">
              {errors.compoundingFrequency}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="years"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Investment Period (Years)
          </label>
          <input
            type="number"
            id="years"
            name="years"
            value={formData.years}
            onChange={handleInputChange}
            className={`text-gray-500 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${
                errors.years
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            min="1"
            max="50"
            disabled={loading}
          />
          {errors.years && (
            <p className="mt-1 text-sm text-red-600">{errors.years}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="monthlyContribution"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Monthly Contribution ($)
          </label>
          <input
            type="number"
            id="monthlyContribution"
            name="monthlyContribution"
            value={formData.monthlyContribution}
            onChange={handleInputChange}
            className={`text-gray-500 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${
                errors.monthlyContribution
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            step="0.01"
            min="0"
            disabled={loading}
          />
          {errors.monthlyContribution && (
            <p className="mt-1 text-sm text-red-600">
              {errors.monthlyContribution}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? "Calculating..." : "Calculate Returns"}
        </button>

        {errors.general && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}
      </form>
    </div>
  );
}
