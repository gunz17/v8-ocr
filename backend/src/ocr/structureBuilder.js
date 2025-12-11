// backend/src/ocr/structureBuilder.js

module.exports = {
  build(items, totals) {
    return {
      vendor: {
        name: null,
        tax_id: null
      },
      document: {
        doc_no: null,
        doc_date: null,
        type: "tax_invoice"
      },
      items,
      totals
    };
  }
};
