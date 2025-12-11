// backend/src/controllers/stockSync.js
const stockService = require("../services/stockService");

module.exports = async (req, res) => {
  try {
    const sync = await stockService.syncAll();
    res.json(sync);
  } catch (err) {
    res.status(500).json({ error: "Stock sync failed" });
  }
};
