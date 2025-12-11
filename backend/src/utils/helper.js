// backend/src/utils/helper.js

module.exports = {
  parseFloatSafe(val) {
    if (!val) return 0;
    return Number(val.toString().replace(/,/g, "").trim());
  },

  isNumber(val) {
    return !isNaN(Number(val));
  }
};
