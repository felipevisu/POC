import { WeatherData } from '../../hooks/useWeather';
import { ScaleSelector } from '../ScaleSelector';
import { Current } from './Current';
import { Forecast } from './Forecast';

interface WeatherProps {
  weather: WeatherData;
}

export const Weather = ({ weather }: WeatherProps) => {
  return (
    <div className="min-h-screen p-8 bg-blue-100 rounded">
      <h1 className="text-2xl font-bold text-center">
        Weather in {weather.location.name}, {weather.location.region} (
        {weather.location.country})
      </h1>
      <ScaleSelector />
      <Current weather={weather.current} />
      <Forecast days={weather.forecast.forecastday} />
    </div>
  );
};

export default Weather;
