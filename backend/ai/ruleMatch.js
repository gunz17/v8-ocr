// backend/ai/ruleMatch.js

const rules = [
    {
        match: ["cb5", "สีผม"],
        sku: "FARGER-CB5",
        boost: 0.25
    },
    {
        match: ["แชมพู", "ม่วง"],
        sku: "FARGER-ANTI-YELLOW",
        boost: 0.30
    },
    {
        match: ["แฮร์", "สเปรย์"],
        sku: "HAIR-SPRAY-300",
        boost: 0.20
    }
];

module.exports = function ruleMatch(ocrText, allItems) {
    const lower = ocrText.toLowerCase();

    let best = null;

    for (const r of rules) {
        const ok = r.match.every(m => lower.includes(m));
        if (!ok) continue;

        // หา item ที่ตรง sku pattern
        const found = allItems.find(i => i.sku.startsWith(r.sku));
        if (found) {
            best = {
                item: found,
                ruleBoost: r.boost
            };
        }
    }

    return best; // null = ไม่เจอ rule
};
