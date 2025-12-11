// backend/src/controllers/ocrParse.js
const normalizer = require("../utils/normalizer");

module.exports = (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text) return res.status(400).json({ error: "raw_text missing" });

    const lines = raw_text
      .split("\n")
      .map((t) => normalizer.clean(t))
      .filter((t) => t.trim() !== "")
      .map((t, i) => ({
        line_no: i + 1,
        ocr_desc: t,
        qty: null,
        unit: null,
        unit_price: null,
        vat_rate: 7,
        item_sku: null,
        peak_item_code: null,
        item_name: null
      }));

    res.json({ parsed_lines: lines });
  } catch (err) {
    res.status(500).json({ error: "OCR parse failed", details: err.message });
  }
};
