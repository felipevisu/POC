const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDay(iso) {
  const d = new Date(iso + "T00:00:00");
  return WEEKDAY[d.getDay()];
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function WeatherCard({ data }) {
  if (data.ok === false) {
    return <div className="item error">Weather: {data.error}</div>;
  }

  const { location, current, daily, units } = data;
  const today = daily[0];
  const rest = daily.slice(1);
  const place = [location.name, location.admin, location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="item weather">
      <div className="weather-hero">
        <div className="weather-hero-left">
          <div className="weather-place">{place}</div>
          <div className="weather-time">
            {new Date(current.time).toLocaleString(undefined, {
              weekday: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="weather-label">{current.label}</div>
        </div>
        <div className="weather-hero-right">
          <div className="weather-icon-lg">{current.icon}</div>
          <div className="weather-temp-lg">
            {Math.round(current.temperature)}
            <span className="weather-unit">{units.temperature}</span>
          </div>
        </div>
      </div>

      <div className="weather-meta">
        <Meta label="Feels like" value={`${Math.round(current.apparent)}${units.temperature}`} />
        <Meta label="Humidity" value={`${current.humidity}${units.humidity}`} />
        <Meta label="Wind" value={`${Math.round(current.windSpeed)} ${units.wind}`} />
        {today && (
          <Meta
            label="High / Low"
            value={`${Math.round(today.max)}° / ${Math.round(today.min)}°`}
          />
        )}
        {today?.sunrise && (
          <Meta label="Sunrise" value={formatTime(today.sunrise)} />
        )}
        {today?.sunset && (
          <Meta label="Sunset" value={formatTime(today.sunset)} />
        )}
      </div>

      {rest.length > 0 && (
        <div className="weather-forecast">
          {rest.map((d) => (
            <div className="weather-day" key={d.date}>
              <div className="weather-day-name">{formatDay(d.date)}</div>
              <div className="weather-day-date">{formatDate(d.date)}</div>
              <div className="weather-day-icon">{d.icon}</div>
              <div className="weather-day-temps">
                <span className="weather-day-max">{Math.round(d.max)}°</span>
                <span className="weather-day-min">{Math.round(d.min)}°</span>
              </div>
              {d.precipitationProbability != null && (
                <div className="weather-day-pop">
                  💧 {d.precipitationProbability}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="weather-meta-item">
      <div className="weather-meta-label">{label}</div>
      <div className="weather-meta-value">{value}</div>
    </div>
  );
}
