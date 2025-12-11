// backend/src/routes/stock.js
const express = require("express");
const router = express.Router();

const stockSync = require("../controllers/stockSync");
const stockLogs = require("../controllers/stockLogs");

// ดึงข้อมูล order จาก Shopee/Lazada/TikTok
router.post("/sync", stockSync);

// log ของระบบ stock syncing
router.get("/logs", stockLogs);

module.exports = router;
