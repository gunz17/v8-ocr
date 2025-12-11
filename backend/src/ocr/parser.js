// backend/src/ocr/parser.js
const normalizer = require("../utils/normalizer");
const lineDetector = require("./lineDetector");
const itemParser = require("./itemParser");
const priceDetector = require("./priceDetector");
const structureBuilder = require("./structureBuilder");

module.exports = {
  parse(rawText) {
    if (!rawText) return [];

    const cleaned = rawText
      .split("\n")
      .map((t) => normalizer.clean(t))
      .filter((t) => t.trim() !== "");

    // Step 1: Detect useful lines
    const lines = lineDetector.detect(cleaned);

    // Step 2: Parse each line → extract qty, price, item name
    const parsedItems = itemParser.extractItems(lines);

    // Step 3: Extract totals (subtotal, VAT, grand total)
    const totals = priceDetector.detectTotals(cleaned);

    // Step 4: Build final structure
    return structureBuilder.build(parsedItems, totals);
  }
};
