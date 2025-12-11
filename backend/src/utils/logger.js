// backend/src/utils/logger.js

module.exports = {
  log(...msg) {
    console.log("📘 LOG:", ...msg);
  },
  error(...msg) {
    console.error("❌ ERROR:", ...msg);
  }
};
