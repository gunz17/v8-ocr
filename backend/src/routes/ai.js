// backend/src/routes/ai.js
const express = require("express");
const router = express.Router();

const aiMatch = require("../controllers/aiMatch");
const aiSuggest = require("../controllers/aiSuggest");
const vendorDetect = require("../controllers/vendorDetect");

// AI Matching รายการสินค้า (OCR → SKU)
router.post("/match", aiMatch);

// แนะนำสินค้าแบบ fuzzy / ML model
router.post("/suggest", aiSuggest);

// ตรวจชื่อ vendor โดย AI
router.post("/vendor-detect", vendorDetect);

module.exports = router;
