// backend/src/controllers/ocrGoogle.js
const vision = require("@google-cloud/vision");
const path = require("path");
const { GOOGLE_OCR_KEY_PATH } = require("../config/env");

module.exports = async (req, res) => {
  try {
    const { file_path } = req.body;
    if (!file_path) return res.status(400).json({ error: "file_path missing" });

    const client = new vision.ImageAnnotatorClient({
      keyFilename: path.resolve(GOOGLE_OCR_KEY_PATH)
    });

    const [result] = await client.textDetection(file_path);

    res.json({
      raw_text: result.fullTextAnnotation?.text || "",
      annotations: result.textAnnotations || []
    });
  } catch (err) {
    console.error("OCR Google Error:", err);
    res.status(500).json({ error: "Google OCR failed", details: err.message });
  }
};
