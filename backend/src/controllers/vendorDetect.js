// backend/src/controllers/vendorDetect.js
const vendorService = require("../services/vendorService");

module.exports = async (req, res) => {
  try {
    const { text } = req.body;
    const vendor = await vendorService.detectVendor(text);

    res.json({ vendor });
  } catch (err) {
    res.status(500).json({ error: "Vendor detect failed" });
  }
};
