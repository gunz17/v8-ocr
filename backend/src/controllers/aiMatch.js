// backend/src/controllers/aiMatch.js
const ai_matcher = require("../ai/ai_matcher");

module.exports = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text missing" });

    const result = await ai_matcher.match(text);

    res.json(result);
  } catch (err) {
    console.error("AI Match Error:", err);
    res.status(500).json({ error: "AI match failed" });
  }
};
