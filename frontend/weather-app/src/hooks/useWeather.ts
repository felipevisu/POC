import { useCallback, useState } from 'react';
import axios from 'axios';
import { Geolocation } from './useGeoLocation';

const WEATHER_API = 'https://api.weatherapi.com/v1/forecast.json';

export type WeatherData = {
  location: { name: string; region: string; country: string };
  current: {
    temp_c: number;
    temp_f: number;
    condition: { text: string; icon: string };
  };
  forecast: {
    forecastday: [
      {
        date: string;
        day: {
          maxtemp_c: number;
          maxtemp_f: number;
          mintemp_c: number;
          mintemp_f: number;
          condition: { text: string; icon: string };
        };
      }
    ];
  };
};

interface UseWeatherReturn {
  fetchWeather: (geolocation: Geolocation) => Promise<void>;
  loading: boolean;
  error: string | null;
  weather: WeatherData | null;
}

const useWeather = (): UseWeatherReturn => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(
    async (geolocation: Geolocation): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const apiKey = import.meta.env.VITE_APP_WEATHER_API_KEY;

        if (!apiKey) {
          setError('API key is missing.');
          setLoading(false);
          return;
        }
        const response = await axios.get(WEATHER_API, {
          params: {
            key: apiKey,
            q: `${geolocation?.latitude},${geolocation?.longitude}`,
            days: 7,
          },
        });
        setWeather(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            'Failed to fetch weather data: ' +
              (err.response?.data?.error?.message || err.message)
          );
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchWeather, loading, error, weather };
};

export default useWeather;
