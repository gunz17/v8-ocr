// backend/utils/peakExcelBuilder.js

const ExcelJS = require("exceljs");

module.exports = async function buildPeakExcel({ vendor, wallet, lines }) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PEAK Import");

    // PEAK required columns
    sheet.addRow([
        "วันที่เอกสาร",
        "เลขที่เอกสาร",
        "รหัสผู้ขาย",
        "ชื่อผู้ขาย",
        "รหัสสินค้า",
        "ชื่อสินค้า",
        "จำนวน",
        "หน่วย",
        "ราคาต่อหน่วย",
        "จำนวนเงิน",
        "อัตราภาษี",
        "กระเป๋าเงิน",
        "หมายเหตุ"
    ]);

    lines.forEach((line) => {
        sheet.addRow([
            line.doc_date,
            line.doc_no,
            vendor.vendor_code,
            vendor.vendor_name,
            line.item_sku,
            line.item_name,
            line.qty,
            line.unit || "ชิ้น",
            line.unit_price,
            line.amount,
            line.vat_rate || 7,
            wallet.wallet_code,
            line.note || ""
        ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};
