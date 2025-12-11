// backend/src/services/ocrService.js
const fs = require("fs");
const path = require("path");

module.exports = {
  readFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found: " + filePath);
    }
    return fs.readFileSync(filePath);
  }
};
