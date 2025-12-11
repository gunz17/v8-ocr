// backend/src/services/vendorService.js
const { getDB } = require("../db/sqlite");
const db = getDB();

module.exports = {
  detectVendor(text) {
    return new Promise((resolve) => {
      db.get(
        `SELECT * FROM vendors WHERE vendor_name LIKE ?`,
        [`%${text}%`],
        (err, row) => resolve(row || null)
      );
    });
  }
};
