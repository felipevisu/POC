import { Scale, useScale } from '../ScaleContext';

export const ScaleSelector = () => {
  const { setScale } = useScale();

  const handleChange = (e: { target: { value: string } }) => {
    setScale(e.target.value as Scale);
  };

  return (
    <div className="w-40 mx-auto mt-8">
      <select onChange={handleChange} className="w-full">
        <option value="Celcius">Celcius</option>
        <option value="Fahrenheit">Fahrenheit</option>
      </select>
    </div>
  );
};
