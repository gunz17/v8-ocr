// backend/src/controllers/stockLogs.js
const stockService = require("../services/stockService");

module.exports = async (req, res) => {
  try {
    const logs = await stockService.logs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Stock logs failed" });
  }
};
