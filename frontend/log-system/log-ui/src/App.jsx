import React from "react";
import ReactDOM from "react-dom/client";
import LogComponent from "./Logs";

import "./index.css";

const App = () => {
  return (
    <div className="app-root">
      <h1>Log Component Demo</h1>
      <p>Simple, minimal log list component - filtered by application</p>

      <div className="card">
        <h3>Example 1: Web Application Logs</h3>
        <LogComponent application="app1" limit={20} />
      </div>

      <div className="card">
        <h3>Example 2: API Service Logs</h3>
        <LogComponent application="api-service" limit={15} />
      </div>
    </div>
  );
};

if (import.meta.env.DEV) {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
