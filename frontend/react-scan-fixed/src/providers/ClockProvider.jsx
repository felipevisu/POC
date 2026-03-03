import { useEffect, useState } from "react";
import { ClockContext } from "./ClockContext";

const ClockProvider = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <ClockContext.Provider value={{ lastUpdated }}>
      {children}
    </ClockContext.Provider>
  );
};

export default ClockProvider;

