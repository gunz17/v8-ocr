// backend/src/utils/skuResolver.js

const { getDB } = require("../db/sqlite");
const db = getDB();
const fuzzy = require("./fuzzy");
const normalizer = require("./normalizer");
const ai_matcher = require("../ai/ai_matcher");

module.exports = {
  async resolve(text) {
    const clean = normalizer.clean(text);

    // 1) Exact match first
    const exact = await this.findExact(clean);
    if (exact) {
      return {
        type: "exact",
        confidence: 100,
        item: exact
      };
    }

    // 2) AI matching
    const ai = await ai_matcher.match(clean);
    if (ai?.confidence >= 85 && ai.item) {
      return {
        type: "ai",
        confidence: ai.confidence,
        item: ai.item
      };
    }

    // 3) Fuzzy Match (fallback)
    const fuzzyMatch = await this.fuzzyMatch(clean);

    return fuzzyMatch || {
      type: "none",
      confidence: 0,
      item: null
    };
  },

  findExact(text) {
    return new Promise((resolve) => {
      db.get(
        `SELECT * FROM mappings 
         JOIN items ON items.id = mappings.item_id
         WHERE mappings.ocr_text = ?`,
        [text],
        (err, row) => resolve(row || null)
      );
    });
  },

  fuzzyMatch(text) {
    return new Promise((resolve) => {
      db.all(`SELECT * FROM items`, [], (err, rows) => {
        if (err || !rows) return resolve(null);

        let best = null;

        rows.forEach((item) => {
          const score = fuzzy.similarity(text, item.name);
          if (!best || score > best.score) {
            best = { item, score };
          }
        });

        if (best.score >= 75) {
          resolve({
            type: "fuzzy",
            confidence: best.score,
            item: best.item
          });
        } else {
          resolve(null);
        }
      });
    });
  }
};
