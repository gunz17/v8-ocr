const db = require('../db/sqlite'); // ใช้ตัวที่เรา wrapper ไว้แล้ว
const stringSimilarity = require('string-similarity');

// ฟังก์ชันช่วย Query (Promisify)
const queryDB = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const ai = {
    // 1. 🕵️‍♂️ นักสืบร้านค้า: หาว่าบิลนี้มาจากร้านไหน
    detectVendor: async (ocrText) => {
        console.log("🔍 AI Detecting Vendor...");
        
        // กวาดหาเลขผู้เสียภาษี 13 หลักในบิล
        const taxIdMatch = ocrText.match(/\d{13}/);
        if (taxIdMatch) {
            const taxId = taxIdMatch[0];
            // ค้นในตาราง Contacts
            const vendors = await queryDB("SELECT * FROM peak_contacts WHERE tax_id = ?", [taxId]);
            if (vendors.length > 0) {
                console.log(`✅ Match Vendor by TaxID: ${vendors[0].name}`);
                return { ...vendors[0], matchType: 'tax_id' };
            }
        }

        // ถ้าไม่เจอ Tax ID ให้ลองหาจากชื่อร้าน (Fuzzy Search)
        // ดึงชื่อร้านทั้งหมดมาเทียบ (เฉพาะ 307 ร้าน ไม่ช้า)
        const allVendors = await queryDB("SELECT name, contact_code FROM peak_contacts");
        if (allVendors.length > 0) {
            const vendorNames = allVendors.map(v => v.name);
            // ตัด Text 5 บรรทัดแรกมาหาชื่อร้าน
            const headerText = ocrText.split('\n').slice(0, 5).join(' '); 
            
            const match = stringSimilarity.findBestMatch(headerText, vendorNames);
            if (match.bestMatch.rating > 0.6) { // มั่นใจเกิน 60%
                const found = allVendors[match.bestMatchIndex];
                console.log(`✅ Match Vendor by Name: ${found.name} (${match.bestMatch.rating.toFixed(2)})`);
                return { ...found, matchType: 'name_fuzzy' };
            }
        }

        return null; // หาไม่เจอ
    },

    // 2. 📦 นักจับคู่สินค้า: แปลงชื่อ OCR เป็นรหัส PEAK
    matchProduct: async (ocrItemName) => {
        if (!ocrItemName || ocrItemName.length < 2) return null;
        
        // A. เช็คความจำก่อน (เคยสอนมันไหม?)
        const memory = await queryDB("SELECT * FROM product_mappings WHERE ocr_name = ?", [ocrItemName]);
        if (memory.length > 0) {
            // ดึงข้อมูลสินค้าจริงจาก PEAK มาด้วย
            const product = await queryDB("SELECT * FROM peak_products WHERE code = ?", [memory[0].peak_code]);
            if (product.length > 0) {
                return { 
                    ...product[0], 
                    matchSource: 'memory', 
                    confidence: 1.0,
                    conversion_rate: memory[0].conversion_rate 
                };
            }
        }

        // B. ถ้าไม่เคยจำ -> ค้นหาใน 4,915 สินค้า (ใช้ SQL LIKE + Fuzzy)
        // ขั้นแรก: กรองหยาบๆ ด้วย SQL เพื่อความเร็ว (หาคำที่ขึ้นต้นเหมือนกัน หรือมีคำบางคำเหมือนกัน)
        // เช่น "Lay" -> หาที่มีคำว่า "Lay%"
        const firstWord = ocrItemName.split(' ')[0]; 
        let candidates = await queryDB(`SELECT * FROM peak_products WHERE name LIKE ? LIMIT 50`, [`%${firstWord}%`]);
        
        // ถ้าหาแบบหยาบไม่เจอเลย ให้เอามาทั้งหมด (อาจจะช้าหน่อยแต่แม่น) -> แต่ 5000 records ยังไหว
        if (candidates.length === 0) {
             candidates = await queryDB("SELECT code, name, sell_price, unit FROM peak_products"); 
        }

        // ขั้นสอง: ใช้ Fuzzy Logic เทียบความเหมือนละเอียด
        const candidateNames = candidates.map(c => c.name);
        const match = stringSimilarity.findBestMatch(ocrItemName, candidateNames);
        
        if (match.bestMatch.rating > 0.4) { // มั่นใจเกิน 40% ให้เดามาเลย (เดี๋ยวคนตรวจเอง)
            const found = candidates[match.bestMatchIndex];
            return { 
                ...found, 
                matchSource: 'ai_guess', 
                confidence: match.bestMatch.rating 
            };
        }

        return null; // ยอมแพ้ เป็นสินค้าใหม่
    },

    // 3. 📚 นักบัญชี: เดาผังบัญชี (สำหรับ Expense)
    matchAccount: async (text) => {
        // ดึงหมวดค่าใช้จ่าย (5xxxx) มาเทียบ
        const expenses = await queryDB("SELECT * FROM peak_accounts WHERE account_code LIKE '5%'");
        const expenseNames = expenses.map(e => e.name);
        
        const match = stringSimilarity.findBestMatch(text, expenseNames);
        if (match.bestMatch.rating > 0.5) {
            return { 
                ...expenses[match.bestMatchIndex], 
                confidence: match.bestMatch.rating 
            };
        }
        return null;
    }
};

module.exports = ai;