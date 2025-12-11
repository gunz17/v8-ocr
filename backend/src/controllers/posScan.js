// backend/src/controllers/posScan.js
const posService = require("../services/posService");

module.exports = async (req, res) => {
  try {
    const { barcode } = req.body;
    const item = await posService.scan(barcode);

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "POS scan failed" });
  }
};
