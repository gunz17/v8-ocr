// backend/ai/fuzzyMatch.js

function levenshtein(a, b) {
    const matrix = [];

    let i, j;
    if (!a || !b) return 0;

    for (i = 0; i <= b.length; i++) matrix[i] = [i];
    for (j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitute
                    matrix[i][j - 1] + 1,     // insert
                    matrix[i - 1][j] + 1      // remove
                );
            }
        }
    }

    const raw = matrix[b.length][a.length];
    const maxLen = Math.max(a.length, b.length);

    return 1 - raw / maxLen; // คะแนน 0 → 1
}

module.exports = function fuzzyMatch(ocrText, itemName) {
    if (!ocrText || !itemName) return 0;

    const score = levenshtein(
        ocrText.toLowerCase(),
        itemName.toLowerCase()
    );

    // word overlap
    const oWords = ocrText.toLowerCase().split(" ");
    const iWords = itemName.toLowerCase().split(" ");
    const intersect = oWords.filter(w => iWords.includes(w));

    const bonus = intersect.length * 0.05;

    return Math.min(1, score + bonus);
};
