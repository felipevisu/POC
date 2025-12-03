import React, { useState, useEffect } from "react";
import "./Logs.css";

const Logs = ({ application, limit = 50 }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = "http://localhost:3000";

  const fetchLogs = async () => {
    if (!application) {
      setError("Application name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        application,
        limit,
      });

      const response = await fetch(`${apiUrl}/api/logs?${params}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [application]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!application) {
    return (
      <div className="logs-container">
        <div className="logs-error">Application name is required</div>
      </div>
    );
  }

  if (loading && logs.length === 0) {
    return (
      <div className="logs-container">
        <div className="logs-loading">Loading logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="logs-container">
        <div className="logs-error">Error loading logs: {error}</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="logs-container">
        <div className="logs-empty">No logs found for {application}</div>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <table className="logs-table">
        <thead>
          <tr>
            <th className="log-date-header">Date</th>
            <th className="log-user-header">User</th>
            <th className="log-action-header">Action</th>
            <th className="log-message-header">Message</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="log-row">
              <td className="log-date">{formatDate(log.date)}</td>
              <td className="log-user">{log.user}</td>
              <td className="log-action">{log.action}</td>
              <td className="log-message">{log.message || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Logs;
