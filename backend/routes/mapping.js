// backend/routes/mapping.js

const express = require("express");
const router = express.Router();

const mapping = require("../db/mappingModel");
const products = require("../db/productModel");

// ---------------------------
// GET /api/mapping/all
// ---------------------------
router.get("/all", async (req, res) => {
    const rows = await mapping.getAll();
    res.json(rows);
});

// ---------------------------
// GET /api/mapping/search
// ---------------------------
router.get("/search", async (req, res) => {
    const { text } = req.query;

    if (!text) {
        return res.json([]);
    }

    const aliases = await mapping.search(text);
    const productMatches = await products.searchProduct(text);

    res.json({
        aliases,
        products: productMatches
    });
});

// ---------------------------
// POST /api/mapping/add-alias
// ---------------------------
router.post("/add-alias", async (req, res) => {
    const { alias, item_sku, item_name } = req.body;

    if (!alias) return res.status(400).json({ error: "alias-required" });

    await mapping.addAlias(alias, item_sku || null, item_name || null);

    res.json({ success: true });
});

// ---------------------------
// POST /api/mapping/bind
// ---------------------------
router.post("/bind", async (req, res) => {
    const { alias, item_sku } = req.body;

    if (!alias || !item_sku)
        return res.status(400).json({ error: "alias-and-sku-required" });

    const product = await products.getBySku(item_sku);

    if (!product) return res.status(400).json({ error: "invalid-sku" });

    await mapping.addAlias(alias, item_sku, product.name);

    res.json({ success: true });
});

// ---------------------------
// PUT /api/mapping/update
// ---------------------------
router.put("/update", async (req, res) => {
    const { id, alias, item_sku, item_name } = req.body;

    await mapping.updateMapping(id, alias, item_sku, item_name);

    res.json({ success: true });
});

// ---------------------------
// DELETE /api/mapping/delete/:id
// ---------------------------
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    await mapping.delete(id);

    res.json({ success: true });
});

module.exports = router;
