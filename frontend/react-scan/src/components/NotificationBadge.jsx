import { useContext } from "react";
import { AppContext } from "../AppContext";
import "./NotificationBadge.css";

function NotificationBadge() {
  const { notifications } = useContext(AppContext);
  return (
    <div className="notification-badge">
      {notifications > 99 ? "99+" : notifications}
    </div>
  );
}

export default NotificationBadge