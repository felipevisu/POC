import { useContext } from "react";
import { AppContext } from "../AppContext";
import "./UserGreeting.css";

function UserGreeting() {
  const { user } = useContext(AppContext);
  return (
    <div className="user-greeting">
      <span className="user-greeting-label">Welcome back,</span>
      <span className="user-greeting-name">{user.name}</span>
    </div>
  );
}

export default UserGreeting