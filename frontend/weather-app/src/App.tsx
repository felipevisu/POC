import { useEffect } from 'react';
import useGeolocation from './hooks/useGeoLocation';
import useWeather from './hooks/useWeather';
import { Weather } from './components/Weather';

function App() {
  const {
    geolocation,
    loading: geolocationLoading,
    error: geolocationError,
  } = useGeolocation();
  const {
    fetchWeather,
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather();

  useEffect(() => {
    if (geolocation) {
      fetchWeather(geolocation);
    }
  }, [geolocation, fetchWeather]);

  if (geolocationLoading || weatherLoading) return <>Loading...</>;

  if (geolocationError) {
    return <p>Error getting location: {geolocationError}</p>;
  }

  if (weatherError || !weather) {
    return <p>Error fetching weather: {weatherError}</p>;
  }

  return <Weather weather={weather} />;
}

export default App;
