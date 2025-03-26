import { WeatherData } from '../../hooks/useWeather';
import { Temperature } from './Temperature';

export const Current = ({ weather }: { weather: WeatherData['current'] }) => {
  return (
    <div className="p-6 mx-auto my-12 space-y-2 text-center bg-blue-300 rounded-lg w-72">
      <p>
        <b>Now</b>
      </p>
      <p className="text-lg">
        Temperature: <Temperature c={weather.temp_c} f={weather.temp_f} />
      </p>
      <p className="text-md">{weather.condition.text}</p>
      <img
        src={weather.condition.icon}
        alt="Weather Icon"
        className="w-16 h-16 mx-auto"
      />
    </div>
  );
};
