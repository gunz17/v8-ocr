// backend/routes/exportPeak.js

const express = require("express");
const router = express.Router();

const vendorModel = require("../db/vendorModel");
const walletModel = require("../db/walletModel");
const buildPeakExcel = require("../utils/peakExcelBuilder");

router.post("/generate", async (req, res) => {
    const { vendor_code, wallet_code, lines } = req.body;

    if (!vendor_code || !wallet_code || !lines) {
        return res.status(400).json({ error: "invalid-input" });
    }

    const vendor = await vendorModel.getByCode(vendor_code);
    const wallet = await walletModel.getByCode(wallet_code);

    if (!vendor) {
        return res.status(400).json({ error: "vendor-not-found" });
    }

    if (!wallet) {
        return res.status(400).json({ error: "wallet-not-found" });
    }

    // พร้อมสร้าง Excel
    const excelBuffer = await buildPeakExcel({
        vendor,
        wallet,
        lines
    });

    res.setHeader(
        "Content-Disposition",
        'attachment; filename="peak_purchase_import.xlsx"'
    );
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(excelBuffer);
});

module.exports = router;
