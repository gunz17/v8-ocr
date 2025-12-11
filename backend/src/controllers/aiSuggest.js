// backend/src/controllers/aiSuggest.js
const ai_matcher = require("../ai/ai_matcher");

module.exports = async (req, res) => {
  try {
    const { text } = req.body;
    const suggestions = await ai_matcher.suggest(text);

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: "AI suggest failed", details: err.message });
  }
};
