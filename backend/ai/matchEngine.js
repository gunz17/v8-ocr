// backend/ai/matchEngine.js

const fuzzyMatch = require("./fuzzyMatch");
const ruleMatch = require("./ruleMatch");
const computeScore = require("./confidenceScore");

module.exports = async function matchItem(ocrItem, allItems) {
    const text = ocrItem.product_name || ocrItem.raw_line;

    let best = { item: null, score: 0, source: "none" };

    // 1) RULE MATCH
    const ruleResult = ruleMatch(text, allItems);
    if (ruleResult) {
        const score = computeScore(0.5, ruleResult.ruleBoost);
        if (score > best.score) {
            best = {
                item: ruleResult.item,
                score,
                source: "rule"
            };
        }
    }

    // 2) FUZZY MATCH ทุก item
    for (const i of allItems) {
        const fz = fuzzyMatch(text, i.name);
        const score = computeScore(fz, 0);

        if (score > best.score) {
            best = {
                item: i,
                score,
                source: "fuzzy"
            };
        }
    }

    return {
        matched_item: best.item,
        confidence: best.score,
        source: best.source
    };
};
