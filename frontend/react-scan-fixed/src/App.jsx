import Dashboard from "./components/Dashboard";
import TaskProvider from "./providers/TaskProvider";
import ClockProvider from "./providers/ClockProvider";
import NotificationProvider from "./providers/NotificationProvider";
import UserProvider from "./providers/UserProvider";

export default function App() {
  return (
    <ClockProvider>
      <NotificationProvider>
        <UserProvider>
          <TaskProvider>
            <Dashboard />
          </TaskProvider>
        </UserProvider>
      </NotificationProvider>
    </ClockProvider>
  );
}