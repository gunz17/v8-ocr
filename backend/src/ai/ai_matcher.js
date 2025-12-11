// backend/src/ai/ai_matcher.js
const { getDB } = require("../db/sqlite");
const db = getDB();
const fuzzy = require("../utils/fuzzy");
const normalizer = require("../utils/normalizer");
const rules = require("./rules.json");
const dict = require("./dictionary.json");

module.exports = {
  async match(text) {
    const clean = normalizer.clean(text);

    // 1) RULE BASED (Exact pattern from rules.json)
    const ruleMatch = rules.alias[clean];
    if (ruleMatch) {
      const item = await this.findItemByName(ruleMatch);
      if (item) {
        return {
          type: "rule",
          confidence: 100,
          item
        };
      }
    }

    // 2) DICTIONARY MATCH (alias)
    if (dict.alias[clean]) {
      const item = await this.findItemByName(dict.alias[clean]);
      if (item) {
        return {
          type: "dictionary",
          confidence: 95,
          item
        };
      }
    }

    // 3) FUZZY MATCH (text → item.name)
    const fuzzyMatch = await this.fuzzyFind(clean);
    if (fuzzyMatch) return fuzzyMatch;

    // NO MATCH
    return { type: "none", confidence: 0, item: null };
  },

  async suggest(text) {
    const clean = normalizer.clean(text);

    return new Promise((resolve) => {
      db.all(`SELECT name FROM items`, [], (err, rows) => {
        if (!rows) return resolve([]);

        const results = rows
          .map((r) => ({
            name: r.name,
            score: fuzzy.similarity(clean, r.name)
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        resolve(results);
      });
    });
  },

  findItemByName(name) {
    return new Promise((resolve) => {
      db.get(`SELECT * FROM items WHERE name = ?`, [name], (err, row) => {
        resolve(row || null);
      });
    });
  },

  fuzzyFind(text) {
    return new Promise((resolve) => {
      db.all(`SELECT * FROM items`, [], (err, rows) => {
        if (!rows) return resolve(null);

        let best = null;

        rows.forEach((item) => {
          const score = fuzzy.similarity(text, item.name);
          if (!best || score > best.score) best = { item, score };
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
