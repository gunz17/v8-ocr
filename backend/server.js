import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import sqlite from "./db/sqlite.js";

// โหลด route ทั้งหมด
import aiRoutes from "./routes/ai.js";
import mappingRoutes from "./routes/mapping.js";
import ocrRoutes from "./routes/ocr.js";
import peakRoutes from "./routes/peak.js";
import posRoutes from "./routes/pos.js";
import stockRoutes from "./routes/stock.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// 📌 กำหนด PATH ที่ถูกต้อง
// -----------------------------
const BASE_DIR = path.resolve();
const UPLOAD_DIR = path.join(BASE_DIR, "uploads");
const OCR_TEMP_DIR = path.join(BASE_DIR, "ocr_temp");

console.log("BASE_DIR      =", BASE_DIR);
console.log("UPLOAD_DIR    =", UPLOAD_DIR);
console.log("OCR_TEMP_DIR  =", OCR_TEMP_DIR);

// -----------------------------
// 📌 ตรวจสอบโฟลเดอร์
// -----------------------------
function ensureDir(dir) {
    if (!dir || typeof dir !== "string") {
        console.error("❌ ERROR: Invalid directory path =", dir);
        return;
    }
    if (!fs.existsSync(dir)) {
        console.log("📁 Creating folder:", dir);
        fs.mkdirSync(dir, { recursive: true });
    }
}

ensureDir(UPLOAD_DIR);
ensureDir(OCR_TEMP_DIR);

// -----------------------------
// 📌 Database
// -----------------------------
sqlite.init();

// -----------------------------
// 📌 Register Routes
// -----------------------------
app.use("/api/ai", aiRoutes);
app.use("/api/mapping", mappingRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/peak", peakRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/stock", stockRoutes);

// -----------------------------
// 📌 Start Server
// -----------------------------
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
