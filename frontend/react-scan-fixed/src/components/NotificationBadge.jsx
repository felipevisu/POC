import "./NotificationBadge.css";
import { useNotification } from "../providers/NotificationContext";

function NotificationBadge() {
  const { notifications } = useNotification();
  return (
    <div className="notification-badge">
      {notifications > 99 ? "99+" : notifications}
    </div>
  );
}

export default NotificationBadge