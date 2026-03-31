export interface SelectFilterOption {
  value: string;
  count: number;
}

export interface SelectFilter {
  type: "select";
  options: SelectFilterOption[];
  label: string;
  order: number | null;
}

export interface RangeFilter {
  type: "range";
  min: number;
  max: number;
  label: string;
  order: number | null;
}

export interface SearchFilter {
  type: "search";
  label: string;
  order: number | null;
}

export type FilterDefinition = SelectFilter | RangeFilter | SearchFilter;

export type FiltersResponse = Record<string, FilterDefinition>;

export interface RangeFilterValue {
  min?: number;
  max?: number;
}

export type FilterValues = Record<string, string[] | RangeFilterValue | string>;

export interface Vehicle {
  id_trim: number;
  make: string | null;
  model: string | null;
  generation: string | null;
  year_from: number | null;
  year_to: number | null;
  series: string | null;
  trim: string | null;
  body_type: string | null;
  number_of_seats: string | null;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  wheelbase_mm: number | null;
  curb_weight_kg: number | null;
  engine_type: string | null;
  engine_hp: number | null;
  capacity_cm3: number | null;
  number_of_cylinders: number | null;
  transmission: string | null;
  drive_wheels: string | null;
  acceleration_0_100_km_h_s: number | null;
  max_speed_km_per_h: number | null;
  mixed_fuel_consumption_per_100_km_l: number | null;
  fuel_tank_capacity_l: number | null;
  co2_emissions_g_per_km: number | null;
  number_of_doors: number | null;
  country_of_origin: string | null;
  car_class: string | null;
  [key: string]: string | number | null | undefined;
}

export interface VehiclesSearchResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: Vehicle[];
}

export interface SearchRequest {
  filters?: FilterValues;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
