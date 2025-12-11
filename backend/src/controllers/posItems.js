// backend/src/controllers/posItems.js
const posService = require("../services/posService");

module.exports = async (req, res) => {
  try {
    const items = await posService.getItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "POS items load failed" });
  }
};
