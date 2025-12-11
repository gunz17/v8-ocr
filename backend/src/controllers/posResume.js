// backend/src/controllers/posResume.js
const posService = require("../services/posService");

module.exports = async (req, res) => {
  try {
    const bill = await posService.resumeBill(req.body.bill_id);
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: "POS resume failed" });
  }
};
