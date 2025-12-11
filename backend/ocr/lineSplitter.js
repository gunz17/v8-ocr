// backend/ocr/lineSplitter.js

module.exports = function splitLines(ocrText) {
    if (!ocrText || typeof ocrText !== "string") {
        return [];
    }

    // 1) แยกตามช่องว่าง / newline
    let lines = ocrText
        .replace(/\r/g, "")
        .split("\n")
        .map(x => x.trim())
        .filter(x => x.length > 0);

    // 2) ลบเส้นขีด / header ที่ไม่สำคัญ
    const junkPatterns = [
        /^[-_=]{3,}$/i,
        /page \d+/i,
        /ใบเสร็จ/i,
        /สำเนา/i,
        /copy/i,
    ];

    lines = lines.filter(line => {
        return !junkPatterns.some(p => p.test(line));
    });

    // 3) บรรทัดที่ติดกัน เช่น: "CH-SH0300V1   แฮร์สเปรย์ 300มล   2โหล 1,740"
    return lines.map(line => line.replace(/\s\s+/g, " "));
};
