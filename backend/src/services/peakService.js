// backend/src/services/peakService.js
module.exports = {
  export(data) {
    return Promise.resolve({
      file_name: "PEAK_Export.xlsx",
      rows: data?.rows || [],
      message: "Export ready"
    });
  }
};
