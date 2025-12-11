// backend/src/ocr/priceDetector.js
const normalizer = require("../utils/normalizer");

module.exports = {
  detectTotals(lines) {
    const totals = {
      subtotal: null,
      vat: null,
      grand_total: null
    };

    lines.forEach((t) => {
      const clean = t.replace(/,/g, "");

      if (/รวมมูลค่าสินค้า/i.test(t)) {
        totals.subtotal = this.extractNumber(clean);
      }
      if (/ภาษีมูลค่าเพิ่ม/i.test(t)) {
        totals.vat = this.extractNumber(clean);
      }
      if (/รวมทั้งสิ้น|จำนวนเงินรวมทั้งสิ้น/i.test(t)) {
        totals.grand_total = this.extractNumber(clean);
      }
    });

    return totals;
  },

  extractNumber(text) {
    const match = text.match(/(\d+\.?\d*)$/);
    return match ? Number(match[1]) : null;
  }
};
