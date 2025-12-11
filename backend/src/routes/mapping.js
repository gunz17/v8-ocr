// backend/src/routes/mapping.js
const express = require("express");
const router = express.Router();

const mappingSave = require("../controllers/mappingSave");
const mappingList = require("../controllers/mappingList");
const mappingResolve = require("../controllers/mappingResolve");

// บันทึก mapping ใหม่
router.post("/save", mappingSave);

// ดึงรายการ mapping ทั้งหมด
router.get("/all", mappingList);

// Resolve SKU จาก OCR text
router.post("/resolve", mappingResolve);

module.exports = router;
