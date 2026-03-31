"use client";

import { useEffect, useState, useCallback } from "react";
import AISearchBar from "@/components/AISearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import VehicleList from "@/components/VehicleList";
import {
  FiltersResponse,
  FilterValues,
  VehiclesSearchResponse,
  SearchRequest,
} from "@/types";

export default function Home() {
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [results, setResults] = useState<VehiclesSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [sortBy, setSortBy] = useState("make");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/filters")
      .then((res) => res.json())
      .then(setFilters);
  }, []);

  const searchVehicles = useCallback(
    async (p: number, sort: string, order: "asc" | "desc") => {
      setLoading(true);
      const body: SearchRequest = {
        filters: filterValues,
        page: p,
        page_size: 20,
        sort_by: sort,
        sort_order: order,
      };

      try {
        const res = await fetch("/api/vehicles/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setResults(data);
      } finally {
        setLoading(false);
      }
    },
    [filterValues],
  );

  useEffect(() => {
    searchVehicles(1, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    setPage(1);
    searchVehicles(1, sortBy, sortOrder);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    searchVehicles(newPage, sortBy, sortOrder);
  };

  const handleSort = (column: string) => {
    let newOrder: "asc" | "desc" = "asc";
    if (column === sortBy) {
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    setSortBy(column);
    setSortOrder(newOrder);
    setPage(1);
    searchVehicles(1, column, newOrder);
  };

  const handleAIResults = (data: {
    filters: Record<string, unknown>;
    sort_by: string;
    sort_order: "asc" | "desc";
    results: unknown;
  }) => {
    setFilterValues(data.filters as FilterValues);
    setSortBy(data.sort_by);
    setSortOrder(data.sort_order);
    setPage(1);
    setResults(data.results as VehiclesSearchResponse);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="shrink-0 bg-surface border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-lg font-bold tracking-tight">Vehicle Search</h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-accent border border-accent/20">
            AI-Powered
          </span>
        </div>
        <AISearchBar
          onResults={handleAIResults}
          loading={aiLoading}
          onLoadingChange={setAiLoading}
        />
      </header>
      <div className="flex flex-1 min-h-0">
        {filters && (
          <FilterSidebar
            filters={filters}
            values={filterValues}
            onChange={setFilterValues}
            onApply={handleApply}
          />
        )}
        <VehicleList
          data={results}
          loading={loading || aiLoading}
          onPageChange={handlePageChange}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}
