// backend/ocr/vendorDetector.js

const vendorPatterns = [
    {
        vendor_code: "PORN",
        vendor_name: "PornSri Cosmetic",
        keywords: ["พอร์นศรี", "Pornsri", "Cosmetic Co.", "502/366"]
    },
    {
        vendor_code: "FARG",
        vendor_name: "Farger Thailand",
        keywords: ["Farger", "แฟเกอร", "CB5", "คัลเลอร์", "สีผม"]
    },
    {
        vendor_code: "MEKO",
        vendor_name: "Thai-Meko",
        keywords: ["THAI-MEKO", "ไทย-มีโก้", "Meko"]
    },
    {
        vendor_code: "DIAR",
        vendor_name: "Diary Group",
        keywords: ["Diary Group", "ไดอารี่", "OE68", "477"]
    },
    {
        vendor_code: "INDD",
        vendor_name: "Indeed Beauty",
        keywords: ["Indeed", "ไอเอ็นดีดี", "BEAUTY SALON"]
    },
    {
        vendor_code: "PHAN",
        vendor_name: "Phanvara",
        keywords: ["Phanvara", "แฟนวรา", "Original", "546,548"]
    }
];

module.exports = function detectVendor(text) {
    const lower = text.toLowerCase();

    for (const v of vendorPatterns) {
        for (const key of v.keywords) {
            if (lower.includes(key.toLowerCase())) {
                return { vendor_code: v.vendor_code, vendor_name: v.vendor_name };
            }
        }
    }
    return { vendor_code: "UNK", vendor_name: "Unknown Vendor" };
};
