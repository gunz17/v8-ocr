// backend/src/utils/normalizer.js

module.exports = {
  clean(text) {
    if (!text) return "";
    let t = text.toString().trim();

    t = t.replace(/\s+/g, " ");          // ลบ space เกิน
    t = t.replace(/[^\wก-๙\s\.\-\/]/g, ""); // ลบตัวอักษรพิเศษ OCR เพี้ยน
    t = t.replace(/[\u0E00-\u0E7F]/g, (c) => c); // รองรับภาษาไทย
    t = t.replace(/[~`¨´]/g, "");

    return t.trim();
  },

  normalizeNumber(text) {
    if (!text) return "";
    return text.replace(/,/g, "").trim();
  }
};
