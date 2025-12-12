const fs = require('fs');
const path = require('path');
const db = require('../db/sqlite');
const XLSX = require('xlsx');

// 📂 ระบุตำแหน่งไฟล์ Excel
const IMPORT_DIR = path.resolve(__dirname, '../../imports');
const FILES = {
    PRODUCTS: path.join(IMPORT_DIR, 'products.xlsx'),
    CONTACTS: path.join(IMPORT_DIR, 'contacts.xlsx'),
    ACCOUNTS: path.join(IMPORT_DIR, 'accounts.xlsx')
};

// ฟังก์ชันหาบรรทัด Header อัตโนมัติ
const findHeaderRow = (sheet) => {
    if (!sheet['!ref']) return 0;
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let R = range.s.r; R <= Math.min(range.e.r, 20); R++) { // หาแค่ 20 บรรทัดแรกพอ
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
            if (!cell) continue;
            const text = String(cell.v).trim();
            // คำค้นหาหัวตาราง (ไทย/อังกฤษ)
            if (['รหัสสินค้า', 'Product Code', 'รหัสผู้ติดต่อ', 'Contact Code', 'รหัสบัญชี', 'Account Code'].includes(text)) {
                return R;
            }
        }
    }
    return 0;
};

const runQuery = (sql, params) => new Promise((resolve, reject) => {
    db.run(sql, params, (err) => err ? reject(err) : resolve());
});

const importData = async () => {
    console.log('🚀 Starting PEAK Data Import...');

    // 1. Import Products
    if (fs.existsSync(FILES.PRODUCTS)) {
        console.log('📦 Importing Products...');
        const wb = XLSX.readFile(FILES.PRODUCTS);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const headerRow = findHeaderRow(sheet);
        const data = XLSX.utils.sheet_to_json(sheet, { range: headerRow });

        for (const row of data) {
            const code = row['รหัสสินค้า'] || row['Product Code'];
            const name = row['ชื่อสินค้า'] || row['Product Name (Eng)'] || row['Product Name (Thai)'];
            const price = row['ราคาขาย'] || row['Sell Price'] || 0;
            const cost = row['ราคาซื้อ'] || row['Buy Price'] || 0;
            const unit = row['หน่วยขาย'] || row['Unit'] || 'ชิ้น';

            if (code && name) {
                await runQuery(
                    `INSERT OR REPLACE INTO peak_products (code, name, sell_price, buy_price, unit) VALUES (?, ?, ?, ?, ?)`,
                    [String(code).trim(), String(name).trim(), parseFloat(price), parseFloat(cost), String(unit).trim()]
                );
            }
        }
        console.log(`✅ Imported ${data.length} products.`);
    }

    // 2. Import Contacts
    if (fs.existsSync(FILES.CONTACTS)) {
        console.log('🤝 Importing Contacts...');
        const wb = XLSX.readFile(FILES.CONTACTS);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const headerRow = findHeaderRow(sheet);
        const data = XLSX.utils.sheet_to_json(sheet, { range: headerRow });

        for (const row of data) {
            const code = row['รหัสผู้ติดต่อ'] || row['Contact Code'];
            const name = row['ชื่อผู้ติดต่อ'] || row['Display Name'];
            const taxId = row['เลขประจำตัวผู้เสียภาษี'] || row['Tax ID'];
            const address = row['ที่อยู่'] || row['Address'];

            if (code && name) {
                await runQuery(
                    `INSERT OR REPLACE INTO peak_contacts (contact_code, name, tax_id, address) VALUES (?, ?, ?, ?)`,
                    [String(code).trim(), String(name).trim(), taxId ? String(taxId).trim() : null, address]
                );
            }
        }
        console.log(`✅ Imported ${data.length} contacts.`);
    }

    // 3. Import Accounts
    if (fs.existsSync(FILES.ACCOUNTS)) {
        console.log('📚 Importing Accounts...');
        const wb = XLSX.readFile(FILES.ACCOUNTS);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const headerRow = findHeaderRow(sheet);
        const data = XLSX.utils.sheet_to_json(sheet, { range: headerRow });

        for (const row of data) {
            const code = row['รหัสบัญชี'] || row['Account Code'];
            const name = row['ชื่อบัญชี'] || row['Account Name (Eng)'] || row['Account Name (Thai)'];
            const category = row['หมวดบัญชี'] || row['Account Category'];

            if (code && name) {
                await runQuery(
                    `INSERT OR REPLACE INTO peak_accounts (account_code, name, category) VALUES (?, ?, ?)`,
                    [String(code).trim(), String(name).trim(), category]
                );
            }
        }
        console.log(`✅ Imported ${data.length} accounts.`);
    }
    
    console.log('🎉 All Imports Completed!');
};

// Re-create Schema & Run
const schemaPath = path.join(__dirname, '../db/schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql, (err) => {
    if (err) console.error('Schema Error:', err);
    else importData();
});