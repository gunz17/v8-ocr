-- 1. ตารางเก็บประวัติการอัปโหลด (เหมือนเดิม)
CREATE TABLE IF NOT EXISTS ocr_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    file_path TEXT
);

-- 2. ตารางเก็บผลลัพธ์ OCR (เหมือนเดิม)
CREATE TABLE IF NOT EXISTS ocr_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_id INTEGER,
    raw_json TEXT,
    items_json TEXT, -- เก็บรายการสินค้าที่แกะได้ (JSON)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(upload_id) REFERENCES ocr_uploads(id)
);

-- ==========================================
-- 🟢 ส่วนใหม่: รองรับข้อมูลจาก PEAK (Master Data)
-- ==========================================

-- 3. ตารางสินค้า (Product Master)
CREATE TABLE IF NOT EXISTS peak_products (
    code TEXT PRIMARY KEY,       -- รหัสสินค้า (P001)
    name TEXT NOT NULL,          -- ชื่อสินค้า
    sell_price REAL DEFAULT 0,   -- ราคาขาย
    buy_price REAL DEFAULT 0,    -- ราคาซื้อ
    unit TEXT,                   -- หน่วยนับ (ชิ้น, แพ็ค)
    description TEXT             -- รายละเอียด
);

-- 4. ตารางผู้ติดต่อ (Vendor Master)
CREATE TABLE IF NOT EXISTS peak_contacts (
    contact_code TEXT PRIMARY KEY, -- รหัสผู้ติดต่อ (V001)
    name TEXT NOT NULL,            -- ชื่อร้านค้า
    tax_id TEXT,                   -- เลขผู้เสียภาษี (ใช้จับคู่กับ OCR)
    address TEXT,
    branch_code TEXT DEFAULT '00000'
);

-- 5. ตารางผังบัญชี (Chart of Accounts) สำหรับค่าใช้จ่าย
CREATE TABLE IF NOT EXISTS peak_accounts (
    account_code TEXT PRIMARY KEY, -- รหัสบัญชี (53.04.00.00)
    name TEXT NOT NULL,            -- ชื่อบัญชี (ค่าไฟฟ้า)
    category TEXT                  -- หมวดบัญชี
);

-- ==========================================
-- 🧠 ส่วนสมอง: การเรียนรู้ของ AI (Mapping Memory)
-- ==========================================

-- 6. จำการจับคู่สินค้า (Product Mapping)
CREATE TABLE IF NOT EXISTS product_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ocr_name TEXT NOT NULL,         -- ชื่อที่อ่านได้จากบิล (เช่น "Nescafe 3in1")
    peak_code TEXT,                 -- รหัสสินค้าจริงใน PEAK
    confidence_score REAL,
    conversion_rate REAL DEFAULT 1, -- อัตราการแปลงหน่วย (เช่น 12)
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ocr_name)
);

-- 7. จำการตั้งค่าร้านค้า (Vendor Config)
CREATE TABLE IF NOT EXISTS vendor_configs (
    vendor_tax_id TEXT PRIMARY KEY, -- เลขผู้เสียภาษี
    peak_contact_code TEXT,         -- รหัสผู้ติดต่อ PEAK
    default_payment_account TEXT,   -- บัญชีที่จ่าย (adv001 / bsv001)
    default_vat_type TEXT DEFAULT '1' -- 1=รวม VAT, 3=ไม่มี VAT
);