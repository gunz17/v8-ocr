// backend/ocr/amountExtractor.js

module.exports = function extractAmount(text) {
    if (!text) return null;

    // แปลง O → 0
    let cleaned = text.replace(/O/g, "0");

    // ตัวเลขแบบ 1,560.00 หรือ 1560 หรือ 1 560
    const pattern = /(\d[\d,\. ]+\d)/g;
    const matches = cleaned.match(pattern);

    if (!matches || matches.length === 0) return null;

    const raw = matches[matches.length - 1]; // เอาตัวสุดท้ายมักเป็นยอดเงิน
    const numeric = parseFloat(raw.replace(/[, ]/g, ""));

    return isNaN(numeric) ? null : numeric;
};
