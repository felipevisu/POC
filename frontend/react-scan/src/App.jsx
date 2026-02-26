import Dashboard from "./components/Dashboard";
import AppProvider from "./AppProvider";

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}