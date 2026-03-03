import "./UserGreeting.css";
import { useUser } from "../providers/UserContext";

function UserGreeting() {
  const { user } = useUser()
  return (
    <div className="user-greeting">
      <span className="user-greeting-label">Welcome back,</span>
      <span className="user-greeting-name">{user.name}</span>
    </div>
  );
}

export default UserGreeting