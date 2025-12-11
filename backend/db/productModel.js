// backend/db/productModel.js

const sqlite = require("./sqlite");

module.exports = {
    getAllProducts() {
        return sqlite.all("SELECT * FROM products ORDER BY name ASC");
    },

    searchProduct(text) {
        return sqlite.all(`
            SELECT * FROM products
            WHERE name LIKE ? OR sku LIKE ?
        `, [`%${text}%`, `%${text}%`]);
    },

    getBySku(sku) {
        return sqlite.get(`
            SELECT * FROM products WHERE sku = ?
        `, [sku]);
    }
};
