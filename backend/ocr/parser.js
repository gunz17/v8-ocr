// backend/ocr/parser.js

const splitLines = require("./lineSplitter");
const detectVendor = require("./vendorDetector");
const normalizeUnit = require("./unitNormalizer");
const extractAmount = require("./amountExtractor");

module.exports = function parseOCR(ocrText) {
    const lines = splitLines(ocrText);

    const vendor = detectVendor(ocrText);

    const items = [];

    // regex จับ pattern เช่น  
    // CH-SH0300V1 แฮร์ สเปรย์ 300 มล. 2 โหล 1,740.00 3,132.00
    const linePattern =
        /([A-Za-z0-9\-\/]+)\s+(.+?)\s+(\d+[^ ]*)\s+([\d,\.O]+)$/;

    for (const raw of lines) {
        const m = raw.match(linePattern);
        if (!m) continue;

        const sku = m[1];
        const name = m[2].trim();
        const qtyText = m[3];
        const amountText = m[4];

        const qty = normalizeUnit(qtyText);
        const amount = extractAmount(amountText);

        items.push({
            raw_line: raw,
            sku: sku,
            product_name: name,
            qty: qty.qty,
            unit_note: qty.note,
            amount: amount
        });
    }

    return {
        vendor,
        items
    };
};
