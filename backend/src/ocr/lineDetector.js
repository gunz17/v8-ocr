// backend/src/ocr/lineDetector.js

module.exports = {
  detect(lines) {
    return lines.filter((t) => {
      // ตัดส่วนที่ไม่ใช่รายการสินค้า เช่น
      if (/วันที่|เลขที่|เงื่อนไข|ผู้รับ|ติดต่อ/i.test(t)) return false;
      if (/รวม|รวมเงิน|ยอด/i.test(t)) return false;
      if (/บาท$/.test(t)) return false;
      return true;
    });
  }
};
