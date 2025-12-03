const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function initializeDatabase() {
  const sql = `
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            application TEXT NOT NULL,
            action TEXT NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            message TEXT
        )
    `;

  db.run(sql, (err) => {
    if (err) {
      console.error("Error creating table:", err);
    } else {
      console.log("Logs table ready");
    }
  });
}

const dbPath = path.join(dataDir, "logs.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log("Failed to load database", err);
  } else {
    console.log("Connected with database");
    initializeDatabase();
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/api/logs", (req, res) => {
  const { user, application, action, message } = req.body;

  if (!user || !application || !action) {
    return res.status(400).json({
      error:
        "Missing required fields: user, application, and action are required",
    });
  }

  const sql = `
        INSERT INTO logs (user, application, action, message, date)
        VALUES (?, ?, ?, ?, datetime('now'))
    `;

  db.run(sql, [user, application, action, message || null], function (err) {
    if (err) {
      console.error("Error inserting log:", err);
      return res.status(500).json({ error: "Failed to create log" });
    }

    db.get("SELECT * FROM logs WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        console.error("Error retrieving created log:", err);
        return res.status(201).json({
          id: this.lastID,
          message: "Log created successfully",
        });
      }
      res.status(201).json({
        message: "Log created successfully",
        log: row,
      });
    });
  });
});

app.get("/api/logs", (req, res) => {
  const {
    application,
    limit = 100,
    offset = 0,
    user,
    action,
    startDate,
    endDate,
  } = req.query;

  let sql = "SELECT * FROM logs";
  const params = [];
  const conditions = [];

  if (application) {
    conditions.push("application = ?");
    params.push(application);
  }

  if (user) {
    conditions.push("user = ?");
    params.push(user);
  }

  if (action) {
    conditions.push("action = ?");
    params.push(action);
  }

  if (startDate) {
    conditions.push("date >= ?");
    params.push(startDate);
  }

  if (endDate) {
    conditions.push("date <= ?");
    params.push(endDate);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY date DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching logs:", err);
      return res.status(500).json({ error: "Failed to fetch logs" });
    }

    let countSql = "SELECT COUNT(*) as count FROM logs";
    const countParams = [];

    if (conditions.length > 0) {
      countSql += " WHERE " + conditions.join(" AND ");

      if (application) countParams.push(application);
      if (user) countParams.push(user);
      if (action) countParams.push(action);
      if (startDate) countParams.push(startDate);
      if (endDate) countParams.push(endDate);
    }

    db.get(countSql, countParams, (err, countRow) => {
      if (err) {
        console.error("Error counting logs:", err);
        return res.json({
          logs: rows,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
          },
        });
      }

      res.json({
        logs: rows,
        pagination: {
          total: countRow.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + rows.length < countRow.count,
        },
        filters: {
          application: application || null,
          user: user || null,
          action: action || null,
          startDate: startDate || null,
          endDate: endDate || null,
        },
      });
    });
  });
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
