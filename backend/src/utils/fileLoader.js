// backend/src/utils/fileLoader.js
const fs = require("fs");

module.exports = {
  load(path) {
    if (!fs.existsSync(path)) {
      throw new Error("File not found: " + path);
    }
    return fs.readFileSync(path);
  }
};
