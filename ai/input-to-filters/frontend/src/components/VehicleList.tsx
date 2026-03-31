"use client";

import { Vehicle, VehiclesSearchResponse } from "@/types";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/8 text-accent text-xs font-medium">
      {children}
    </span>
  );
}

function Pill({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-background">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function formatYear(v: Vehicle): string | null {
  if (!v.year_from) return null;
  if (v.year_to && v.year_to !== v.year_from) {
    return `${v.year_from}\u2013${v.year_to}`;
  }
  return String(v.year_from);
}

function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:border-accent/20 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-base tracking-tight truncate">
              {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.body_type && <Tag>{vehicle.body_type}</Tag>}
            {vehicle.car_class && <Tag>Class {vehicle.car_class}</Tag>}
          </div>
          <p className="text-sm text-muted truncate">
            {[vehicle.generation, vehicle.series, vehicle.trim]
              .filter(Boolean)
              .join(" \u00B7 ")}
          </p>
        </div>
        <div className="text-right shrink-0">
          {formatYear(vehicle) && (
            <span className="text-sm font-semibold tabular-nums">
              {formatYear(vehicle)}
            </span>
          )}
          {vehicle.country_of_origin && (
            <p className="text-xs text-muted mt-0.5">
              {vehicle.country_of_origin}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <Pill
          label="Power"
          value={vehicle.engine_hp ? `${vehicle.engine_hp} HP` : null}
        />
        <Pill
          label="Engine"
          value={
            vehicle.capacity_cm3
              ? `${vehicle.capacity_cm3} cc ${vehicle.engine_type || ""}`
              : vehicle.engine_type
          }
        />
        <Pill label="Trans" value={vehicle.transmission} />
        <Pill label="Drive" value={vehicle.drive_wheels} />
        <Pill
          label="0\u2013100"
          value={
            vehicle.acceleration_0_100_km_h_s
              ? `${vehicle.acceleration_0_100_km_h_s}s`
              : null
          }
        />
        <Pill
          label="Top"
          value={
            vehicle.max_speed_km_per_h
              ? `${vehicle.max_speed_km_per_h} km/h`
              : null
          }
        />
        <Pill
          label="Fuel"
          value={
            vehicle.mixed_fuel_consumption_per_100_km_l
              ? `${vehicle.mixed_fuel_consumption_per_100_km_l} L/100`
              : null
          }
        />
        <Pill
          label="CO2"
          value={
            vehicle.co2_emissions_g_per_km
              ? `${vehicle.co2_emissions_g_per_km} g/km`
              : null
          }
        />
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 pb-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3.5 py-2 text-sm font-medium border border-border rounded-lg disabled:opacity-30 hover:bg-surface hover:border-accent/30 transition-all"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1.5 text-muted select-none">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 text-sm font-medium rounded-lg transition-all ${
              p === page
                ? "bg-accent text-white shadow-sm"
                : "hover:bg-surface border border-border hover:border-accent/30"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3.5 py-2 text-sm font-medium border border-border rounded-lg disabled:opacity-30 hover:bg-surface hover:border-accent/30 transition-all"
      >
        Next
      </button>
    </div>
  );
}

interface VehicleListProps {
  data: VehiclesSearchResponse | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export default function VehicleList({
  data,
  loading,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
}: VehicleListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm text-muted">Loading vehicles...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted">Search for vehicles to get started</p>
      </div>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-1">No vehicles found</p>
          <p className="text-sm text-muted">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  const sortOptions = [
    { value: "make", label: "Make" },
    { value: "year_from", label: "Year" },
    { value: "engine_hp", label: "Horsepower" },
    { value: "acceleration_0_100_km_h_s", label: "0-100 km/h" },
    { value: "max_speed_km_per_h", label: "Top Speed" },
    { value: "mixed_fuel_consumption_per_100_km_l", label: "Fuel Consumption" },
    { value: "curb_weight_kg", label: "Weight" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="shrink-0 px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">
            {data.total.toLocaleString()}
          </span>{" "}
          vehicles found
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted text-xs uppercase tracking-wider font-medium">
            Sort
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSort(e.target.value)}
            className="border border-border rounded-lg px-2.5 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSort(sortBy)}
            className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-background hover:border-accent/30 transition-all text-muted"
            title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
          >
            {sortOrder === "asc" ? "\u2191" : "\u2193"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3 max-w-4xl mx-auto">
          {data.data.map((vehicle) => (
            <VehicleRow key={vehicle.id_trim} vehicle={vehicle} />
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}
