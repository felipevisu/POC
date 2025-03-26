import React, { createContext, useContext, useState } from 'react';

export type Scale = 'Celcius' | 'Fahrenheit';

interface ScaleContextRespose {
  scale: Scale;
  setScale: (value: Scale) => void;
}

const ScaleContext = createContext<ScaleContextRespose>({
  scale: 'Celcius',
  setScale: () => {},
});

export const ScaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [scale, setScale] = useState<Scale>('Celcius');
  return (
    <ScaleContext.Provider value={{ scale, setScale }}>
      {children}
    </ScaleContext.Provider>
  );
};

export const useScale = () => {
  const { scale, setScale } = useContext(ScaleContext);
  return { scale, setScale };
};
