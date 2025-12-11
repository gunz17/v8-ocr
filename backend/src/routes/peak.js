// backend/src/routes/peak.js
const express = require("express");
const router = express.Router();

const peakExport = require("../controllers/peakExport");

// สร้างไฟล์ Excel สำหรับ import เข้า PEAK
router.post("/export", peakExport);

module.exports = router;
