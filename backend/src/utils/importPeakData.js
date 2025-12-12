const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // เรียก sqlite3 โดยตรง
const XLSX = require('xlsx');

// 📂 กำหนดตำแหน่งไฟล์ Database และ Excel ให้แม่นยำ
const DB_PATH = path.resolve(__dirname, '../../database.sqlite');
const IMPORT_DIR = path.resolve(__dirname, '../../imports');

const FILES = {
    PRODUCTS: path.join(IMPORT_DIR, 'products.xlsx'),
    CONTACTS: path.join(IMPORT_DIR, 'contacts.xlsx'),
    ACCOUNTS: path.join(IMPORT_DIR, 'accounts.xlsx')
};

// ✅ สร้างการเชื่อมต่อ Database เฉพาะกิจสำหรับสคริปต์นี้
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('❌ DB Connection Error:', err.message);
    else console.log('✅ Connected to Database at:', DB_PATH);
});

// ฟังก์ชันรัน SQL ทีละคำสั่ง
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error('❌ SQL Error:', err.message);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// ฟังก์ชันหา Header อัตโนมัติ
const findHeaderRow = (sheet) => {
    if (!sheet['!ref']) return 0;
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let R = range.s.r; R <= Math.min(range.e.r, 20); R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
            if (!cell) continue;
            const text = String(cell.v).trim();
            if (['รหัสสินค้า', 'Product Code', 'รหัสผู้ติดต่อ', 'Contact Code', 'รหัสบัญชี', 'Account Code'].includes(text)) {
                return R;
            }
        }
    }
    return 0;
};

// 🏗️ สร้างตาราง (Init Schema)
const initTables = async () => {
    console.log('🏗️ Creating Tables...');
    
    const tables = [
        `CREATE TABLE IF NOT EXISTS peak_products (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sell_price REAL DEFAULT 0,
            buy_price REAL DEFAULT 0,
            unit TEXT,
            description TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS peak_contacts (
            contact_code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            tax_id TEXT,
            address TEXT,
            branch_code TEXT DEFAULT '00000'
        )`,
        `CREATE TABLE IF NOT EXISTS peak_accounts (
            account_code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS product_mappings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ocr_name TEXT NOT NULL UNIQUE,
            peak_code TEXT,
            confidence_score REAL,
            conversion_rate REAL DEFAULT 1,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(peak_code) REFERENCES peak_products(code)
        )`,
        `CREATE TABLE IF NOT EXISTS vendor_configs (
            vendor_tax_id TEXT PRIMARY KEY,
            peak_contact_code TEXT,
            default_payment_account TEXT,
            default_vat_type TEXT DEFAULT '1'
        )`
    ];

    for (const sql of tables) {
        await runQuery(sql);
    }
    console.log('✅ Tables Created.');
};

const importData = async () => {
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
    } else {
        console.log('⚠️ Product file not found:', FILES.PRODUCTS);
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
    
    console.log('🎉 ALL DATA IMPORTED SUCCESSFULLY!');
};

// เริ่มทำงาน
const run = async () => {
    try {
        await initTables(); 
        await importData(); 
    } catch (error) {
        console.error('🔥 Fatal Error:', error);
    } finally {
        db.close(); // ปิดการเชื่อมต่อเมื่อเสร็จ
    }
};

run();