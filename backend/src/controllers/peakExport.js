// backend/src/controllers/peakExport.js
const peakService = require("../services/peakService");

module.exports = async (req, res) => {
  try {
    const excel = await peakService.export(req.body);

    res.json({
      status: "ok",
      message: "PEAK Excel generated",
      excel
    });
  } catch (err) {
    res.status(500).json({ error: "PEAK export failed", details: err.message });
  }
};
