// backend/src/utils/unitConverter.js

module.exports = {
  convert(qty, unitType) {
    qty = Number(qty || 0);

    switch (unitType) {
      case "DOZEN": // 1 โหล → 12 ชิ้น
        return qty * 12;

      case "2DOZEN": // 2 โหล → 24 ชิ้น
        return qty * 24;

      case "BOX6": // กล่อง 6 ชิ้น
        return qty * 6;

      case "PCS":
      default:
        return qty;
    }
  },

  convertPrice(price, unitType) {
    price = Number(price || 0);

    switch (unitType) {
      case "DOZEN":
        return price / 12;

      case "2DOZEN":
        return price / 24;

      case "BOX6":
        return price / 6;

      case "PCS":
      default:
        return price;
    }
  }
};
