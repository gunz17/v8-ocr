// backend/src/routes/ocr.js
const express = require("express");
const router = express.Router();

const ocrUpload = require("../controllers/ocrUpload");
const ocrGoogle = require("../controllers/ocrGoogle");
const ocrParse = require("../controllers/ocrParse");

// Upload ไฟล์รูป/ PDF
router.post("/upload", ocrUpload);

// ส่งให้ Google OCR ทำการอ่าน
router.post("/google", ocrGoogle);

// แปลงผล OCR → JSON โครงสร้างสินค้า
router.post("/parse", ocrParse);

module.exports = router;
