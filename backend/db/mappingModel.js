// backend/db/mappingModel.js

const sqlite = require("./sqlite");

module.exports = {
    getAll() {
        return sqlite.all(`SELECT * FROM mapping_alias`);
    },

    search(text) {
        return sqlite.all(`
            SELECT * FROM mapping_alias
            WHERE alias LIKE ? OR item_name LIKE ?
        `, [`%${text}%`, `%${text}%`]);
    },

    addAlias(alias, itemSku, itemName) {
        return sqlite.run(`
            INSERT INTO mapping_alias (alias, item_sku, item_name)
            VALUES (?, ?, ?)
        `, [alias, itemSku, itemName]);
    },

    updateMapping(id, alias, itemSku, itemName) {
        return sqlite.run(`
            UPDATE mapping_alias
            SET alias=?, item_sku=?, item_name=?
            WHERE id=?
        `, [alias, itemSku, itemName, id]);
    },

    delete(id) {
        return sqlite.run(`DELETE FROM mapping_alias WHERE id=?`, [id]);
    }
};
