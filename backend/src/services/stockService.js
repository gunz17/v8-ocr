// backend/src/services/stockService.js
module.exports = {
  async syncAll() {
    return {
      shopee: "synced",
      lazada: "synced",
      tiktok: "synced",
      time: new Date().toISOString()
    };
  },

  logs() {
    return Promise.resolve([
      { time: "2025-01-01", status: "synced" },
      { time: "2025-01-02", status: "synced" }
    ]);
  }
};
