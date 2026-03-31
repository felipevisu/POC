# Vehicle Search Filters Documentation

API endpoint: `POST /vehicles/search`

Filters are sent in the request body under `"filters"`. Three filter types exist, each with its own input format.

---

## Filter Types

### Range (`min` / `max`)

For continuous numeric values. Provide an object with `min`, `max`, or both.

```json
{ "engine_hp": { "min": 150, "max": 400 } }
```

### Select (multi-value)

For categorical fields with a fixed set of options. Provide an array of values.

```json
{ "make": ["Toyota", "Honda"], "body_type": ["SUV", "Sedan"] }
```

### Search (text)

For free-text fields with many distinct values. Provide a string (case-insensitive partial match).

```json
{ "trim": "sport" }
```

---

## Range Filters

### Identification & Year

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `year_from` | Model year the trim was first produced. Use to find cars from a specific era. | 1904 | 2020 | `{"min": 2010, "max": 2020}` |
| `year_to` | Last model year the trim was produced. A value close to `year_from` means a short production run. | 0 | 2020 | `{"min": 2015}` |

### Exterior Dimensions

Measurements of the vehicle body. Useful for finding cars that fit a garage, parking space, or size preference.

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `length_mm` | Overall vehicle length in millimeters. A city car is ~3500 mm; a full-size SUV is ~5000 mm. | 1826 | 6720 | `{"min": 4000, "max": 4800}` |
| `width_mm` | Overall vehicle width (excluding mirrors) in millimeters. | 1194 | 4705 | `{"max": 1900}` |
| `height_mm` | Overall vehicle height in millimeters. Sedans are ~1400 mm; SUVs are ~1700 mm+. | 1005 | 3600 | `{"max": 1600}` |
| `wheelbase_mm` | Distance between front and rear axle centers in millimeters. Longer wheelbase means more cabin space and a smoother ride. | 1200 | 4821 | `{"min": 2700}` |
| `ground_clearance_mm` | Distance from the lowest point of the car to the ground. Higher values mean better off-road capability. | 67 | 460 | `{"min": 180}` |
| `load_height_mm` | Height of the cargo floor from the ground. Relevant for vans and commercial vehicles. | 155 | 3915 | `{"max": 800}` |

### Track Width

Distance between the left and right wheels on the same axle. Wider track improves cornering stability.

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `front_track_mm` | Front axle track width in millimeters. | 1015 | 1901 | `{"min": 1500}` |
| `rear_track_mm` | Rear axle track width in millimeters. | 1070 | 1975 | `{"min": 1500}` |

### Weight

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `curb_weight_kg` | Weight of the car with standard equipment and all fluids but no passengers or cargo. A compact car is ~1200 kg; a large SUV is ~2500 kg. | 399 | 3850 | `{"min": 1000, "max": 2000}` |
| `payload_kg` | Maximum weight of passengers and cargo the vehicle can carry. | 145 | 3334 | `{"min": 500}` |
| `full_weight_kg` | Gross vehicle weight (curb weight + max payload). Important for bridge/road weight limits. | 690 | 5352 | `{"max": 3500}` |

### Cargo & Trunk

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `max_trunk_capacity_l` | Maximum trunk volume in liters (e.g., with rear seats folded). | 11 | 5400 | `{"min": 400}` |
| `minimum_trunk_capacity_l` | Trunk volume with all seats in place. | 11 | 4440 | `{"min": 300}` |
| `cargo_volume_m3` | Cargo area volume in cubic meters. Mainly relevant for vans and commercial vehicles. | 0.33 | 8665 | `{"min": 2.0}` |

### Engine

Core engine specifications. Use these to find vehicles by power output, displacement, or engine configuration.

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `engine_hp` | Engine horsepower. A city car has ~70 HP; a sports car has 300+ HP. | 5 | 1914 | `{"min": 150, "max": 400}` |
| `capacity_cm3` | Engine displacement in cubic centimeters. Commonly referred to as "engine size" (e.g., 2.0L = 2000 cm3). | 217 | 8382 | `{"min": 1500, "max": 3000}` |
| `number_of_cylinders` | Number of engine cylinders. Common values: 3, 4, 6, 8. More cylinders generally means more power and a smoother engine. | 1 | 16 | `{"min": 4, "max": 6}` |
| `valves_per_cylinder` | Number of intake/exhaust valves per cylinder. Most modern engines use 4 valves per cylinder for better breathing. | 1 | 6 | `{"min": 4}` |
| `compression_ratio` | Ratio of cylinder volume at bottom vs. top of piston stroke. Higher ratios mean more efficiency. Diesel engines: 15-23; Gasoline: 9-13. | 6.6 | 23.0 | `{"min": 10, "max": 14}` |
| `cylinder_bore_mm` | Diameter of each cylinder in millimeters. | 9 | 110 | `{"min": 70, "max": 90}` |
| `stroke_cycle_mm` | Piston stroke length in millimeters. Short stroke = high-revving; long stroke = more torque. | 53 | 197 | `{"max": 100}` |
| `max_power_kw` | Maximum engine power in kilowatts (1 kW = 1.36 HP). | 10 | 588 | `{"min": 100}` |

### Transmission & Drivetrain

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `number_of_gears` | Number of forward gears. Modern automatics have 6-10; manuals typically have 5-6. | 1 | 10 | `{"min": 6}` |
| `turning_circle_m` | Diameter of the smallest circular turn the car can make, in meters. Smaller values mean better maneuverability in tight spaces. | 5.1 | 71.0 | `{"max": 11}` |

### Performance

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `acceleration_0_100_km_h_s` | Time to accelerate from 0 to 100 km/h in seconds. A sports car does it in ~4s; a family sedan in ~10s. | 1.97 | 50.0 | `{"max": 8.0}` |
| `max_speed_km_per_h` | Top speed in km/h. Many modern cars are electronically limited to 250 km/h. | 50 | 420 | `{"min": 200}` |

### Fuel Consumption & Emissions

Consumption values are in liters per 100 km. Lower is more economical.

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `mixed_fuel_consumption_per_100_km_l` | Combined (city + highway) fuel consumption. A hybrid might be ~4 L/100km; a large SUV ~12 L/100km. | 0.6 | 36.5 | `{"max": 8.0}` |
| `city_fuel_per_100km_l` | Fuel consumption in urban driving conditions (stop-and-go traffic). | 2.1 | 43.1 | `{"max": 10.0}` |
| `highway_fuel_per_100km_l` | Fuel consumption at highway cruising speed. | 2.1 | 28.0 | `{"max": 7.0}` |
| `fuel_tank_capacity_l` | Fuel tank volume in liters. Determines range between refueling stops. | 8.8 | 189.3 | `{"min": 50}` |
| `co2_emissions_g_per_km` | CO2 output in grams per kilometer. Used for emissions taxes in many countries. Below 120 g/km is considered efficient. | 13 | 547 | `{"max": 150}` |

### Body

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `number_of_doors` | Number of doors including the hatch/trunk if it counts as a door. Values: 1-5. | 1 | 5 | `{"min": 4}` |

### Electric / Hybrid

These fields are only populated for electric and plug-in hybrid vehicles (~0.02% of records).

| Filter | Description | Min | Max | Example |
|---|---|---|---|---|
| `battery_capacity_kw_per_h` | Battery capacity in kWh. Determines electric range. | 1.3 | 31.3 | `{"min": 10}` |
| `electric_range_km` | Maximum distance on electric power alone, in kilometers. | 30 | 106 | `{"min": 50}` |
| `charging_time_h` | Time to fully charge the battery in hours (standard charger). | 2.3 | 7.75 | `{"max": 5}` |

---

## Select Filters

Provide an array of one or more values. Use `GET /filters` to retrieve all available options with counts.

### Vehicle Identity

| Filter | Description | Example Values |
|---|---|---|
| `make` | Manufacturer / brand name. 255 brands available. | `["Toyota", "BMW", "Mercedes-Benz", "Ford", "Volkswagen", "Audi", "Chevrolet", "Nissan"]` |
| `model` | Vehicle model name. 2706 models available. Depends on the selected make. | `["Corolla", "Civic", "3 Series", "A4", "Golf", "Mustang"]` |
| `body_type` | Vehicle body style / shape. | `["Sedan", "Hatchback", "Wagon", "Crossover", "Minivan", "Coupe", "Pickup", "Cabriolet", "SUV", "Van", "Roadster", "Targa", "Limousine", "Liftback", "Fastback"]` |
| `number_of_seats` | Passenger seating capacity. Stored as text since some values are ranges (e.g., "4, 5"). | `["2", "4", "5", "7", "8", "9"]` |

### Engine Configuration

| Filter | Description | Example Values |
|---|---|---|
| `engine_type` | Fuel or power source of the engine. | `["Gasoline", "Diesel", "Hybrid", "Electric", "Gas"]` |
| `injection_type` | Fuel delivery method to the engine cylinders. | `["Multi-point fuel injection", "carburetor", "direct injection", "Common Rail", "Monoinjection"]` |
| `cylinder_layout` | Physical arrangement of cylinders in the engine block. | `["Inline", "V-type", "Opposed", "W-type", "Rotary-piston"]` |
| `boost_type` | Forced induction system, if any. Turbos compress intake air for more power. | `["Turbo", "none", "Biturbo", "compressor", "Twin-scroll", "Triple turbo"]` |
| `engine_placement` | Where the engine sits in the chassis. | `["front, cross-section", "front, longitudinal", "central", "rear"]` |
| `presence_of_intercooler` | Whether the vehicle has an intercooler (cools compressed air from turbo). Only value: `"Present"` or null. | `["Present"]` |

### Drivetrain

| Filter | Description | Example Values |
|---|---|---|
| `drive_wheels` | Which wheels receive engine power. | `["Front wheel drive", "Rear wheel drive", "All wheel drive (AWD)", "Four wheel drive (4WD)", "Constant all wheel drive"]` |
| `transmission` | Gearbox type. | `["Manual", "Automatic", "robot", "Continuously variable transmission (CVT)", "Electronic with 2 clutch", "Electronic with 1 clutch"]` |

### Brakes

| Filter | Description | Example Values |
|---|---|---|
| `front_brakes` | Front brake type. Ventilated discs dissipate heat better for high-performance use. | `["ventilated disc", "Disc", "drum", "Disc composite", "Disk ceramic"]` |
| `rear_brakes` | Rear brake type. Drums are cheaper; discs offer better stopping power. | `["Disc", "drum", "ventilated disc", "Disc composite", "Disk ceramic"]` |

### Regulatory & Classification

| Filter | Description | Example Values |
|---|---|---|
| `emission_standards` | Regulatory emissions standard the vehicle meets. Higher numbers = stricter / cleaner. | `["EURO II", "EURO III", "EURO IV", "EURO V", "EURO VI", "Euro 5", "Euro 6"]` |
| `fuel_grade` | Fuel octane rating or fuel type. Higher octane allows higher compression without knocking. | `["80", "92", "95", "98", "diesel", "Gasoline"]` |
| `car_class` | European vehicle size classification. | `["B (small)", "C (medium)", "D (large)", "E (executive)", "F (luxury)", "J (SUV)", "M (MPV)", "S (sports)"]` |
| `country_of_origin` | Country where the manufacturer is headquartered. | `["Japan", "Germany", "USA", "Great Britain", "South Korea", "France", "Italy", "Czech"]` |
| `safety_assessment` | Crash test safety rating (e.g., EuroNCAP stars). | `["5", "4", "3"]` |
| `rating_name` | Organization that issued the safety rating. | `["EuroNCAP", "ARCAP"]` |

---

## Search Filters

Free-text, case-insensitive partial match. Useful for fields with high cardinality.

| Filter | Description | Distinct Values | Example Query | Matches |
|---|---|---|---|---|
| `generation` | Production generation of the model (e.g., "3 generation", "2 generation [redesign]"). | 1743 | `"redesign"` | All redesigned generations |
| `series` | Sub-series or variant within a generation. | 1297 | `"Hatchback"` | All hatchback series |
| `trim` | Specific trim level, usually includes engine size and transmission (e.g., "2.0 AT", "1.6 MT"). | 10353 | `"2.0 AT"` | All 2.0L automatic trims |
| `wheel_size_r14` | Tire size specification in width/profile/rim format (e.g., "205/55/R16"). | 635 | `"R17"` | All trims with 17" wheels |
| `front_suspension` | Front suspension design description. | 273 | `"McPherson"` | All with McPherson strut front |
| `back_suspension` | Rear suspension design description. | 387 | `"Multi wishbone"` | All with multi-wishbone rear |
| `maximum_torque_n_m` | Maximum engine torque in Newton-meters (stored as text, may include RPM info). | 748 | `"400"` | Trims with 400 Nm torque |
| `range_km` | Driving range in kilometers, often as "city\|highway" format. | 4311 | `"1,000"` | Trims with 1000 km highway range |

---

## Pagination & Sorting

```json
{
  "filters": { ... },
  "page": 1,
  "page_size": 20,
  "sort_by": "engine_hp",
  "sort_order": "desc"
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number (1-indexed). |
| `page_size` | integer | `20` | Results per page (1-100). |
| `sort_by` | string | `"id_trim"` | Any filter column name or `"id_trim"`. |
| `sort_order` | string | `"asc"` | `"asc"` or `"desc"`. |

## Response Format

```json
{
  "total": 50,
  "page": 1,
  "page_size": 20,
  "total_pages": 3,
  "data": [ { ... }, { ... } ]
}
```
