import { useScale } from '../../ScaleContext';

export const Temperature = ({ c, f }: { c: number; f: number }) => {
  const { scale } = useScale();
  if (scale === 'Celcius') return <>{c} C</>;
  return <>{f} F</>;
};
