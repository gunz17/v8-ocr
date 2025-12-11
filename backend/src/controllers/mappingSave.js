// backend/src/controllers/mappingSave.js
const mappingService = require("../services/mappingService");

module.exports = async (req, res) => {
  try {
    const { ocr_text, item_id, confidence } = req.body;

    const result = await mappingService.saveMapping(ocr_text, item_id, confidence);

    res.json({ status: "saved", result });
  } catch (err) {
    res.status(500).json({ error: "Mapping save failed", details: err.message });
  }
};
