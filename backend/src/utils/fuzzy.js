// backend/src/utils/fuzzy.js

function levenshtein(a, b) {
  if (!a || !b) return 0;
  const m = [];

  for (let i = 0; i <= b.length; i++) {
    m[i] = [i];
    if (i === 0) continue;
    for (let j = 1; j <= a.length; j++) {
      m[0][j] = j;
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      m[i][j] = Math.min(
        m[i - 1][j] + 1,
        m[i][j - 1] + 1,
        m[i - 1][j - 1] + cost
      );
    }
  }
  return m[b.length][a.length];
}

function similarity(a, b) {
  a = (a || "").toLowerCase();
  b = (b || "").toLowerCase();

  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  return (1 - dist / maxLen) * 100;
}

module.exports = { levenshtein, similarity };
