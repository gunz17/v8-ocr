// backend/src/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { initDB } = require("./db/sqlite");

// โหลด ENV
require("./config/env");

const app = express();
const PORT = process.env.BACKEND_PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// สร้าง DB หากยังไม่มี
initDB();

// โหลด routes อัตโนมัติ
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith(".js")) {
    const routeModule = require(path.join(routesPath, file));
    app.use(`/api/${file.replace(".js", "")}`, routeModule);
    console.log(`✔ Loaded route: /api/${file.replace(".js", "")}`);
  }
});

// Default route
app.get("/", (req, res) => {
  res.json({ status: "Gracie V8 Backend Running", version: "8.0" });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({ error: err.message || "Server Error" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
