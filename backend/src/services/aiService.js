// backend/src/services/aiService.js
const ai_matcher = require("../ai/ai_matcher");

module.exports = {
  async matchItem(text) {
    return ai_matcher.match(text);
  },

  async suggest(text) {
    return ai_matcher.suggest(text);
  }
};
