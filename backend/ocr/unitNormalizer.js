// backend/ocr/unitNormalizer.js

module.exports = function normalizeUnit(rawQtyText) {
    if (!rawQtyText) return { qty: 1, note: "no-unit-found" };

    const text = rawQtyText.toLowerCase();

    // 1) โหล → ×12
    if (text.includes("โหล")) {
        const n = parseInt(text) || 1;
        return { qty: n * 12, note: "dozen" };
    }

    // 2) แพ็ค เช่น “แพ็ค 6 ชิ้น”
    const packMatch = text.match(/แพ็ค\s*(\d+)/);
    if (packMatch) {
        const perPack = parseInt(packMatch[1]);
        const n = parseInt(text) || 1;
        return { qty: n * perPack, note: "pack" };
    }

    // 3) ลัง เช่น “ลัง 12 ขวด”
    const boxMatch = text.match(/ลัง\s*(\d+)/);
    if (boxMatch) {
        const perBox = parseInt(boxMatch[1]);
        const n = parseInt(text) || 1;
        return { qty: n * perBox, note: "box" };
    }

    // 4) x6, x12
    const xMatch = text.match(/x\s*(\d+)/i);
    if (xMatch) {
        const perSet = parseInt(xMatch[1]);
        const n = parseInt(text) || 1;
        return { qty: n * perSet, note: "x-multiplier" };
    }

    // 5) default = ตัวเลขโดด
    const n = parseInt(text);
    if (!isNaN(n)) return { qty: n, note: "plain-number" };

    return { qty: 1, note: "unknown" };
};
