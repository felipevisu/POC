import { useState, useEffect } from 'react';

export type Geolocation = { latitude: number; longitude: number };

interface UseGeolocationReturn {
  geolocation: Geolocation | null;
  loading: boolean;
  error: string | null;
}

const useGeolocation = (): UseGeolocationReturn => {
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeolocation({ latitude: latitude, longitude: longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return { geolocation, loading, error };
};

export default useGeolocation;
