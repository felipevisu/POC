"use client";

import { useState } from "react";
import {
  FiltersResponse,
  FilterValues,
  FilterDefinition,
  RangeFilterValue,
} from "@/types";

function SelectFilterInput({
  name,
  filter,
  value,
  onChange,
}: {
  name: string;
  filter: FilterDefinition & { type: "select" };
  value: string[];
  onChange: (name: string, value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = filter.options.filter((o) =>
    o.value.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 bg-white border border-border rounded-lg text-sm transition-all hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20 flex justify-between items-center"
      >
        <span className="truncate text-foreground">
          {value.length > 0 ? (
            <span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-medium mr-1.5">
                {value.length}
              </span>
              selected
            </span>
          ) : (
            <span className="text-muted">Any</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-border rounded-lg shadow-xl max-h-60 overflow-auto">
          {filter.options.length > 8 && (
            <div className="p-2 border-b border-border sticky top-0 bg-white">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
              />
            </div>
          )}
          {filtered.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-accent/5 cursor-pointer text-sm transition-colors"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => {
                  const next = value.includes(option.value)
                    ? value.filter((v) => v !== option.value)
                    : [...value, option.value];
                  onChange(name, next);
                }}
                className="mr-2.5 rounded accent-accent"
              />
              <span className="truncate flex-1">{option.value}</span>
              <span className="text-muted text-xs ml-1 tabular-nums">
                {option.count.toLocaleString()}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeFilterInput({
  name,
  filter,
  value,
  onChange,
}: {
  name: string;
  filter: FilterDefinition & { type: "range" };
  value: RangeFilterValue;
  onChange: (name: string, value: RangeFilterValue) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="number"
        placeholder={String(filter.min)}
        value={value.min ?? ""}
        onChange={(e) =>
          onChange(name, {
            ...value,
            min: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="w-1/2 px-2.5 py-2 bg-white border border-border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
      />
      <span className="self-center text-muted text-xs">to</span>
      <input
        type="number"
        placeholder={String(filter.max)}
        value={value.max ?? ""}
        onChange={(e) =>
          onChange(name, {
            ...value,
            max: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="w-1/2 px-2.5 py-2 bg-white border border-border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
      />
    </div>
  );
}

function SearchFilterInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full pl-8 pr-3 py-2 bg-white border border-border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
      />
    </div>
  );
}

interface FilterSidebarProps {
  filters: FiltersResponse;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: () => void;
}

export default function FilterSidebar({
  filters,
  values,
  onChange,
  onApply,
}: FilterSidebarProps) {
  const [showAll, setShowAll] = useState(false);

  const ordered = Object.keys(filters)
    .filter((k) => filters[k].order !== null)
    .sort((a, b) => filters[a].order! - filters[b].order!);
  const remainingKeys = Object.keys(filters)
    .filter((k) => filters[k].order === null)
    .sort();
  const allKeys = [...ordered, ...remainingKeys];
  const visibleKeys = showAll ? allKeys : ordered;

  const handleSelectChange = (name: string, val: string[]) => {
    const next = { ...values };
    if (val.length === 0) {
      delete next[name];
    } else {
      next[name] = val;
    }
    onChange(next);
  };

  const handleRangeChange = (name: string, val: RangeFilterValue) => {
    const next = { ...values };
    if (val.min === undefined && val.max === undefined) {
      delete next[name];
    } else {
      next[name] = val;
    }
    onChange(next);
  };

  const handleSearchChange = (name: string, val: string) => {
    const next = { ...values };
    if (!val) {
      delete next[name];
    } else {
      next[name] = val;
    }
    onChange(next);
  };

  const handleClear = () => {
    onChange({});
    setTimeout(onApply, 0);
  };

  const activeCount = Object.keys(values).length;

  return (
    <aside className="w-[280px] shrink-0 bg-surface border-r border-border flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base tracking-tight">Filters</h2>
          {activeCount > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-accent hover:text-accent-hover transition-colors font-medium"
            >
              Clear all ({activeCount})
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {visibleKeys.map((key) => {
          const filter = filters[key];
          const label = filters[key].label;

          return (
            <div key={key}>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                {label}
              </label>
              {filter.type === "select" && (
                <SelectFilterInput
                  name={key}
                  filter={filter}
                  value={(values[key] as string[]) || []}
                  onChange={handleSelectChange}
                />
              )}
              {filter.type === "range" && (
                <RangeFilterInput
                  name={key}
                  filter={filter}
                  value={(values[key] as RangeFilterValue) || {}}
                  onChange={handleRangeChange}
                />
              )}
              {filter.type === "search" && (
                <SearchFilterInput
                  name={key}
                  value={(values[key] as string) || ""}
                  onChange={handleSearchChange}
                />
              )}
            </div>
          );
        })}

        {remainingKeys.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-xs text-accent hover:text-accent-hover font-medium py-2 transition-colors"
          >
            {showAll
              ? "Show fewer filters"
              : `+ ${remainingKeys.length} more filters`}
          </button>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={onApply}
          className="w-full bg-accent text-white py-2.5 px-4 rounded-lg hover:bg-accent-hover font-medium text-sm transition-colors shadow-sm"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}
