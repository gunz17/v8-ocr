// ฟังก์ชันแยกแยะรายการสินค้าจากข้อความ OCR
exports.parseOCRText = (fullText) => {
    const lines = fullText.split('\n');
    const items = [];

    // วนลูปดูทีละบรรทัด
    lines.forEach((line) => {
        line = line.trim();
        if (!line) return;

        // สูตร Regex: หาบรรทัดที่มี "ตัวเลข" อยู่ด้านหลัง (มักจะเป็นราคา)
        // ตัวอย่าง: "Lays Classic 20.00"
        // (กลุ่ม 1 = ชื่อ) (กลุ่ม 2 = ราคา)
        const match = line.match(/^(.*?)\s+(\d+(\.\d{2})?)$/);

        if (match) {
            const name = match[1].trim();
            const price = parseFloat(match[2]);

            // กรองขยะ: ชื่อต้องยาวเกิน 2 ตัวอักษร และราคาต้องสมเหตุสมผล
            if (name.length > 2 && price > 0) {
                items.push({
                    name: name,
                    qty: 1,      // ค่าเริ่มต้น
                    price: price,
                    total: price
                });
            }
        }
    });

    return items;
};