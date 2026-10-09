const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  use: { baseURL: "http://localhost:5173" },
  webServer: { command: "npm --prefix ../form run dev", url: "http://localhost:5173", reuseExistingServer: true },
});
