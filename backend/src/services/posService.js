// backend/src/services/posService.js
const { getDB } = require("../db/sqlite");
const db = getDB();

module.exports = {
  scan(barcode) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM items WHERE sku = ?`, [barcode], (err, row) => {
        if (err) reject(err);
        else resolve(row || { error: "Item not found" });
      });
    });
  },

  sell(data) {
    return Promise.resolve({
      status: "sold",
      items: data.items || [],
      total: data.total || 0,
      time: new Date().toISOString()
    });
  },

  holdBill(data) {
    return Promise.resolve("HOLD-" + Date.now());
  },

  resumeBill(billId) {
    return Promise.resolve({
      bill_id: billId,
      items: [],
      status: "resumed"
    });
  },

  getItems() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM items`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
