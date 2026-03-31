"use client";

import { useState } from "react";
import {
  FiltersResponse,
  FilterValues,
  FilterDefinition,
  RangeFilterValue,
} from "@/types";

const FILTER_LABELS: Record<string, string> = {
  make: "Make",
  model: "Model",
  body_type: "Body Type",
  engine_type: "Engine Type",
  transmission: "Transmission",
  drive_wheels: "Drive Wheels",
  fuel_grade: "Fuel Grade",
  car_class: "Car Class",
  country_of_origin: "Country",
  number_of_seats: "Seats",
  cylinder_layout: "Cylinder Layout",
  boost_type: "Boost Type",
  engine_placement: "Engine Placement",
  injection_type: "Injection Type",
  front_brakes: "Front Brakes",
  rear_brakes: "Rear Brakes",
  emission_standards: "Emission Standards",
  safety_assessment: "Safety Rating",
  rating_name: "Rating Name",
  presence_of_intercooler: "Intercooler",
  year_from: "Year From",
  year_to: "Year To",
  engine_hp: "Horsepower",
  capacity_cm3: "Engine (cc)",
  number_of_cylinders: "Cylinders",
  acceleration_0_100_km_h_s: "0-100 km/h (s)",
  max_speed_km_per_h: "Top Speed (km/h)",
  mixed_fuel_consumption_per_100_km_l: "Fuel (L/100km)",
  curb_weight_kg: "Weight (kg)",
  length_mm: "Length (mm)",
  width_mm: "Width (mm)",
  height_mm: "Height (mm)",
  wheelbase_mm: "Wheelbase (mm)",
  number_of_doors: "Doors",
  fuel_tank_capacity_l: "Tank (L)",
  co2_emissions_g_per_km: "CO2 (g/km)",
  max_power_kw: "Power (kW)",
  number_of_gears: "Gears",
  turning_circle_m: "Turning Circle (m)",
  ground_clearance_mm: "Ground Clearance (mm)",
  compression_ratio: "Compression Ratio",
  trim: "Trim",
  generation: "Generation",
  series: "Series",
  wheel_size_r14: "Wheel Size",
  front_suspension: "Front Suspension",
  back_suspension: "Rear Suspension",
  maximum_torque_n_m: "Torque (Nm)",
  range_km: "Range (km)",
};

const FILTER_ORDER = [
  "make",
  "model",
  "body_type",
  "year_from",
  "year_to",
  "engine_type",
  "engine_hp",
  "transmission",
  "drive_wheels",
  "capacity_cm3",
  "acceleration_0_100_km_h_s",
  "max_speed_km_per_h",
  "mixed_fuel_consumption_per_100_km_l",
  "car_class",
  "country_of_origin",
  "number_of_seats",
  "number_of_doors",
  "curb_weight_kg",
  "fuel_tank_capacity_l",
  "co2_emissions_g_per_km",
];

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

  const filterKeys = FILTER_ORDER.filter((k) => k in filters);
  const remainingKeys = Object.keys(filters)
    .filter((k) => !FILTER_ORDER.includes(k))
    .sort();
  const allKeys = [...filterKeys, ...remainingKeys];
  const visibleKeys = showAll ? allKeys : filterKeys;

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
          const label = FILTER_LABELS[key] || key.replace(/_/g, " ");

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
