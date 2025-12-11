// backend/src/controllers/posHold.js
const posService = require("../services/posService");

module.exports = async (req, res) => {
  try {
    const id = await posService.holdBill(req.body);
    res.json({ status: "held", bill_id: id });
  } catch (err) {
    res.status(500).json({ error: "POS hold failed" });
  }
};
