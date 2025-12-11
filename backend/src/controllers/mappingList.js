// backend/src/controllers/mappingList.js
const mappingService = require("../services/mappingService");

module.exports = async (req, res) => {
  try {
    const list = await mappingService.listMappings();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load mappings" });
  }
};
