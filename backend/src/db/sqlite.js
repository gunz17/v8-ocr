const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// กำหนด path ของไฟล์ database (แก้ชื่อไฟล์ได้ตามต้องการ)
const dbPath = path.resolve(__dirname, '../../database.db'); 

// สร้าง Connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database Connection Error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database at:', dbPath);
    }
});

// สร้างตารางถ้ายังไม่มี (Table Init)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ocr_uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        original_name TEXT,
        file_path TEXT,
        status TEXT DEFAULT 'pending',
        raw_text TEXT,
        result_json TEXT,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// สำคัญมาก: ต้อง export ตัว db ออกไปตรงๆ
module.exports = db;