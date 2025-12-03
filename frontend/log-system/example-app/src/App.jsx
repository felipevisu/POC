import React, { useState } from "react";
import LogComponent from "logUI/LogComponent";
import "./App.css";

const APPLICATION_NAME = "demo-app";
const API_URL = "http://localhost:3000";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const createLog = async (action, message) => {
    try {
      const response = await fetch(`${API_URL}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: "demo-user",
          application: APPLICATION_NAME,
          action: action,
          message: message,
        }),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="app-container">
      <div className="left-column">
        <div className="app-header">
          <h1 className="app-title">Log System Demo</h1>
          <p className="app-subtitle">Click buttons to create log entries</p>
        </div>

        <div className="action-section">
          <h2 className="section-title">User Actions</h2>
          <div className="button-group">
            <button
              className="action-button button-primary"
              onClick={() =>
                createLog("user_login", "User logged in successfully")
              }
            >
              User Login
            </button>
            <button
              className="action-button button-primary"
              onClick={() => createLog("user_logout", "User logged out")}
            >
              User Logout
            </button>
            <button
              className="action-button button-primary"
              onClick={() =>
                createLog("profile_update", "User updated profile information")
              }
            >
              Update Profile
            </button>
            <button
              className="action-button button-primary"
              onClick={() =>
                createLog("password_change", "User changed password")
              }
            >
              Change Password
            </button>
          </div>
        </div>

        <div className="action-section">
          <h2 className="section-title">Data Operations</h2>
          <div className="button-group">
            <button
              className="action-button button-success"
              onClick={() =>
                createLog("data_create", "New record created in database")
              }
            >
              Create Record
            </button>
            <button
              className="action-button button-info"
              onClick={() =>
                createLog("data_read", "Data retrieved from database")
              }
            >
              Read Data
            </button>
            <button
              className="action-button button-warning"
              onClick={() =>
                createLog("data_update", "Record updated successfully")
              }
            >
              Update Record
            </button>
            <button
              className="action-button button-danger"
              onClick={() =>
                createLog("data_delete", "Record deleted from database")
              }
            >
              Delete Record
            </button>
          </div>
        </div>

        <div className="action-section">
          <h2 className="section-title">System Events</h2>
          <div className="button-group">
            <button
              className="action-button button-info"
              onClick={() =>
                createLog("backup_start", "System backup initiated")
              }
            >
              Start Backup
            </button>
            <button
              className="action-button button-success"
              onClick={() =>
                createLog(
                  "backup_complete",
                  "System backup completed successfully"
                )
              }
            >
              Complete Backup
            </button>
            <button
              className="action-button button-warning"
              onClick={() =>
                createLog("maintenance_mode", "System entered maintenance mode")
              }
            >
              Maintenance Mode
            </button>
            <button
              className="action-button button-danger"
              onClick={() =>
                createLog("error_occurred", "System error detected and logged")
              }
            >
              System Error
            </button>
          </div>
        </div>
      </div>

      <div className="right-column">
        <div className="log-header">
          <h2 className="log-title">
            Live Activity Log
            <span className="app-badge">{APPLICATION_NAME}</span>
          </h2>
          <p className="log-subtitle">
            Real-time logs from the demo application
          </p>
        </div>

        <LogComponent
          key={refreshKey}
          application={APPLICATION_NAME}
          limit={30}
        />
      </div>
    </div>
  );
}

export default App;
