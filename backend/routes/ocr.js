// backend/routes/ocr.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// OCR Engine
const parseOCR = require("../ocr/parser");

// Google OCR Client
let visionClient = null;
try {
    const vision = require("@google-cloud/vision");
    visionClient = new vision.ImageAnnotatorClient({
        keyFilename: path.join(__dirname, "..", "ocr", "google-key.json")
    });
} catch (err) {
    console.log("Google OCR not initialized:", err.message);
}

// upload folder
const upload = multer({ dest: "uploads/" });


// ---------------------------
// 1) Upload file only
// ---------------------------
router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "no-file" });

    return res.json({
        success: true,
        file_path: req.file.path,
        file_name: req.file.originalname
    });
});


// ---------------------------
// 2) Call Google OCR
// ---------------------------
router.post("/google", async (req, res) => {
    try {
        if (!visionClient) {
            return res.status(500).json({ error: "google-ocr-not-configured" });
        }

        const { file_path } = req.body;
        if (!file_path) return res.status(400).json({ error: "file-path-required" });

        const [result] = await visionClient.textDetection(file_path);
        const text = result.fullTextAnnotation ? result.fullTextAnnotation.text : "";

        return res.json({
            success: true,
            raw_text: text
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


// ---------------------------
// 3) Parse OCR text
// ---------------------------
router.post("/parse", async (req, res) => {
    try {
        const { raw_text } = req.body;
        if (!raw_text) return res.status(400).json({ error: "raw-text-required" });

        const result = parseOCR(raw_text);

        return res.json({
            success: true,
            parsed: result
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


// ---------------------------
// 4) Auto OCR: Upload → Google OCR → Parse
// ---------------------------
router.post("/auto", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "no-file" });
        if (!visionClient) return res.status(500).json({ error: "google-ocr-not-configured" });

        // 1) Google OCR
        const [result] = await visionClient.textDetection(req.file.path);
        const text = result.fullTextAnnotation ? result.fullTextAnnotation.text : "";

        // 2) Parse OCR
        const parsed = parseOCR(text);

        return res.json({
            success: true,
            raw_text: text,
            parsed
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
