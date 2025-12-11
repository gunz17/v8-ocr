// backend/db/vendorModel.js

const sqlite = require("./sqlite");

module.exports = {
    getAll() {
        return sqlite.all("SELECT * FROM vendors ORDER BY vendor_name ASC");
    },

    getByCode(code) {
        return sqlite.get(
            "SELECT * FROM vendors WHERE vendor_code = ?",
            [code]
        );
    }
};
