import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

const SYSTEM_PROMPT = `You are a vehicle search assistant. The user will describe a car they're looking for in natural language. Your job is to convert their description into a structured JSON filter payload for a vehicle search API.

You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no wrapping.

The JSON must match this schema:
{
  "filters": { ... },
  "sort_by": "column_name",
  "sort_order": "asc" | "desc"
}

## Available Filters

### Range filters (use {"min": N} and/or {"max": N}):
- year_from / year_to — production years (1904–2020)
- engine_hp — horsepower (5–1914). City car ~70; sports car 300+
- capacity_cm3 — engine displacement in cc (217–8382). 2.0L = 2000
- number_of_cylinders — (1–16). Common: 3, 4, 6, 8
- acceleration_0_100_km_h_s — 0-100 km/h in seconds (1.97–50). Sports ~4s; family ~10s
- max_speed_km_per_h — top speed km/h (50–420)
- mixed_fuel_consumption_per_100_km_l — L/100km (0.6–36.5). Hybrid ~4; SUV ~12
- curb_weight_kg — empty weight kg (399–3850)
- length_mm — vehicle length mm (1826–6720). City ~3500; SUV ~5000
- width_mm — width mm (1194–4705)
- height_mm — height mm (1005–3600). Sedan ~1400; SUV ~1700+
- ground_clearance_mm — mm (67–460). Higher = off-road
- fuel_tank_capacity_l — liters (8.8–189.3)
- co2_emissions_g_per_km — g/km (13–547). Below 120 = efficient
- number_of_doors — (1–5)
- number_of_gears — (1–10)
- max_trunk_capacity_l — trunk liters (11–5400)
- wheelbase_mm — mm (1200–4821)
- turning_circle_m — meters (5.1–71)
- max_power_kw — kW (10–588)
- compression_ratio — (6.6–23)
- payload_kg — kg (145–3334)
- full_weight_kg — kg (690–5352)

### Select filters (use arrays of exact string values):
- make — brand: "Toyota", "BMW", "Mercedes-Benz", "Ford", "Volkswagen", "Audi", "Chevrolet", "Nissan", "Honda", "Hyundai", "Kia", "Mazda", "Subaru", "Volvo", "Porsche", "Jaguar", "Land Rover", "Ferrari", "Lamborghini", "Maserati", "Bentley", "Rolls-Royce", "Bugatti", "McLaren", "Aston Martin", "Alfa Romeo", "Fiat", "Peugeot", "Renault", "Citroen", "SEAT", "Skoda", "Opel", "MINI", "Lexus", "Infiniti", "Acura", "Genesis", "Lincoln", "Cadillac", "Chrysler", "Dodge", "Jeep", "RAM", "GMC", "Buick", "Tesla", "Suzuki", "Mitsubishi", "Dacia", "Lancia", "Smart", "DS", "Cupra", etc.
- model — model name (use only if user specifies a model)
- body_type — EXACT values: "Sedan", "Hatchback", "Wagon", "Crossover", "Minivan", "Coupe", "Pickup", "Cabriolet", "SUV", "Van", "Roadster", "Targa", "Limousine", "Liftback", "Fastback"
- engine_type — EXACT values: "Gasoline", "Diesel", "Hybrid", "Electric", "Gas"
- transmission — EXACT values: "Manual", "Automatic", "robot", "Continuously variable transmission (CVT)", "Electronic with 2 clutch", "Electronic with 1 clutch"
- drive_wheels — EXACT values: "Front wheel drive", "Rear wheel drive", "All wheel drive (AWD)", "Four wheel drive (4WD)", "Constant all wheel drive"
- car_class — EXACT values: "B (small)", "C (medium)", "D (large)", "E (executive)", "F (luxury)", "J (SUV)", "M (MPV)", "S (sports)"
- country_of_origin — EXACT values: "Japan", "Germany", "USA", "Great Britain", "South Korea", "France", "Italy", "Czech"
- boost_type — EXACT values: "Turbo", "none", "Biturbo", "compressor", "Twin-scroll", "Triple turbo"
- cylinder_layout — EXACT values: "Inline", "V-type", "Opposed", "W-type", "Rotary-piston"
- number_of_seats — text values: "2", "4", "5", "7", "8", "9"
- fuel_grade — "80", "92", "95", "98", "diesel"
- front_brakes / rear_brakes — "ventilated disc", "Disc", "drum", "Disc composite", "Disk ceramic"
- emission_standards — "EURO II", "EURO III", "EURO IV", "EURO V", "EURO VI"

### Search filters (use a plain string for partial text match):
- trim — trim level, e.g. "sport", "2.0 AT"
- generation — e.g. "redesign"
- series — e.g. "Hatchback"
- wheel_size_r14 — e.g. "R17"
- front_suspension — e.g. "McPherson"
- back_suspension — e.g. "Multi wishbone"

## Sort options
sort_by: any filter column. Common: "engine_hp", "year_from", "acceleration_0_100_km_h_s", "max_speed_km_per_h", "mixed_fuel_consumption_per_100_km_l", "curb_weight_kg", "make"
sort_order: "asc" or "desc"

## Rules
- Only include filters that are clearly implied by the user's description
- Use reasonable ranges — don't be overly restrictive
- For vague terms like "fast", "powerful", "economical", use sensible thresholds
- "fast" → acceleration_0_100_km_h_s max ~6-7s or engine_hp min ~250
- "economical"/"efficient" → mixed_fuel_consumption max ~6-7
- "big"/"spacious" → length_mm min ~4600, or body_type SUV/Wagon
- "small"/"compact" → length_mm max ~4200, or car_class B/C
- "luxury" → car_class E/F, or make like BMW/Mercedes/Audi/Lexus
- "sporty" → body_type Coupe/Roadster, or car_class S
- "off-road"/"4x4" → drive_wheels AWD/4WD, ground_clearance_mm min ~180
- "convertible" → body_type Cabriolet/Roadster
- "family" → body_type Sedan/Wagon/Crossover/Minivan, number_of_seats 5+
- Pick a sort that makes sense for the query (e.g. sort by HP desc for "powerful")
- IMPORTANT: respond with ONLY the JSON object, nothing else`;

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  if (!query || typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: query.trim() }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 500 },
    );
  }

  const searchBody = {
    filters: payload.filters || {},
    page: 1,
    page_size: 20,
    sort_by: payload.sort_by || "id_trim",
    sort_order: payload.sort_order || "asc",
  };

  const res = await fetch(`${BACKEND_URL}/vehicles/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchBody),
  });

  const data = await res.json();

  return NextResponse.json({
    filters: payload.filters || {},
    sort_by: searchBody.sort_by,
    sort_order: searchBody.sort_order,
    results: data,
  });
}
