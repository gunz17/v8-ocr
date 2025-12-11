// backend/src/ocr/itemParser.js
const unitConverter = require("../utils/unitConverter");
const normalizer = require("../utils/normalizer");

module.exports = {
  extractItems(lines) {
    return lines.map((t, i) => {
      const qty = this.detectQty(t);
      const unitPrice = this.detectUnitPrice(t);
      const unit = this.detectUnit(t);

      return {
        line_no: i + 1,
        ocr_desc: t,
        qty,
        unit,
        unit_price: unitPrice,
        vat_rate: 7,
        item_sku: null,
        item_name: null,
        peak_item_code: null
      };
    });
  },

  detectQty(text) {
    const match = text.match(/(\d+)\s*(ตัว|ชิ้น|ขวด|ปุก|โหล)/i);
    if (!match) return null;
    return Number(match[1]);
  },

  detectUnit(text) {
    if (/2\s*โหล/.test(text)) return "2DOZEN";
    if (/โหล/.test(text)) return "DOZEN";
    if (/กล่อง\s*6/i.test(text)) return "BOX6";
    if (/ชิ้น|ตัว/.test(text)) return "PCS";
    return null;
  },

  detectUnitPrice(text) {
    const match = text.match(/(\d+[\,\.]?\d*)$/);
    if (!match) return null;
    return Number(normalizer.normalizeNumber(match[1]));
  }
};
