// backend/ai/confidenceScore.js

module.exports = function computeScore(fuzzyScore, ruleBoost) {
    let score = fuzzyScore;

    if (ruleBoost) {
        score += ruleBoost;
    }

    return Math.min(score, 1.0);
};
