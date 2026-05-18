const WMO_CODES = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌦️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Freezing drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️" },
  67: { label: "Freezing rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "🌨️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Violent rain showers", icon: "⛈️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { label: "Thunderstorm w/ hail", icon: "⛈️" },
};

function describeCode(code) {
  return WMO_CODES[code] ?? { label: "Unknown", icon: "❓" };
}

export const getWeatherTool = {
  name: "get_weather",
  description:
    "Get current weather and multi-day forecast for a city. Use whenever the user asks about weather, temperature, rain, snow, or conditions for a place. Returns current conditions plus daily forecast (max/min temp, precipitation probability, conditions).",
  input_schema: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "City name, e.g. 'Lisbon', 'Porto, Portugal', 'Tokyo'",
      },
      days: {
        type: "integer",
        minimum: 1,
        maximum: 16,
        description: "Number of forecast days to return. Defaults to 7.",
      },
    },
    required: ["city"],
  },
  async execute({ city, days = 7 }) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city,
    )}&count=1&language=en&format=json`;

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      return {
        ok: false,
        error: `Geocoding error: ${geoRes.status} ${geoRes.statusText}`,
      };
    }
    const geoData = await geoRes.json();
    const place = geoData.results?.[0];
    if (!place) {
      return { ok: false, error: `City not found: ${city}` };
    }

    const fcUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,weathercode,wind_speed_10m,apparent_temperature` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,sunrise,sunset` +
      `&timezone=auto&forecast_days=${days}`;

    const fcRes = await fetch(fcUrl);
    if (!fcRes.ok) {
      return {
        ok: false,
        error: `Forecast error: ${fcRes.status} ${fcRes.statusText}`,
      };
    }
    const fc = await fcRes.json();

    const currentMeta = describeCode(fc.current.weathercode);
    const daily = fc.daily.time.map((date, i) => {
      const code = fc.daily.weathercode[i];
      const meta = describeCode(code);
      return {
        date,
        max: fc.daily.temperature_2m_max[i],
        min: fc.daily.temperature_2m_min[i],
        precipitationProbability:
          fc.daily.precipitation_probability_max[i] ?? null,
        weathercode: code,
        label: meta.label,
        icon: meta.icon,
        sunrise: fc.daily.sunrise[i],
        sunset: fc.daily.sunset[i],
      };
    });

    return {
      ok: true,
      kind: "weather",
      location: {
        name: place.name,
        admin: place.admin1 ?? null,
        country: place.country ?? null,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: fc.timezone,
      },
      current: {
        temperature: fc.current.temperature_2m,
        apparent: fc.current.apparent_temperature,
        humidity: fc.current.relative_humidity_2m,
        windSpeed: fc.current.wind_speed_10m,
        weathercode: fc.current.weathercode,
        label: currentMeta.label,
        icon: currentMeta.icon,
        time: fc.current.time,
      },
      units: {
        temperature: fc.current_units?.temperature_2m ?? "°C",
        wind: fc.current_units?.wind_speed_10m ?? "km/h",
        humidity: fc.current_units?.relative_humidity_2m ?? "%",
      },
      daily,
    };
  },
};

export const tools = [getWeatherTool];

export const toolsByName = Object.fromEntries(
  tools.map((t) => [t.name, t]),
);

export function toolSchemas() {
  return tools.map(({ name, description, input_schema }) => ({
    name,
    description,
    input_schema,
  }));
}
