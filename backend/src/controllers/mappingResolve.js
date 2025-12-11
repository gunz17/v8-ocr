// backend/src/controllers/mappingResolve.js
const mappingService = require("../services/mappingService");

module.exports = async (req, res) => {
  try {
    const { text } = req.body;
    const resolved = await mappingService.resolve(text);

    res.json(resolved);
  } catch (err) {
    res.status(500).json({ error: "Mapping resolve failed" });
  }
};
