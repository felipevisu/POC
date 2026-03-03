import { useEffect, useState } from "react";
import { NotificationContext } from "./NotificationContext";

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((n) => n + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

