PRAGMA foreign_keys = ON;

--------------------------------------------------------
-- TABLE: products  (ของเดิม)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    sku TEXT PRIMARY KEY,
    name TEXT,
    cost REAL DEFAULT 0,
    retail REAL DEFAULT 0,
    member REAL DEFAULT 0,
    wholesale REAL DEFAULT 0,
    salon REAL DEFAULT 0,
    barcode TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------
-- TABLE: pos_invoices (บิลขาย)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no TEXT,
    member_id INTEGER,
    subtotal REAL,
    discount REAL,
    total REAL,
    points_earned REAL,
    points_used REAL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id)
);

--------------------------------------------------------
-- TABLE: pos_invoice_items (สินค้าในบิล)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    sku TEXT,
    name TEXT,
    qty INTEGER,
    price REAL,
    discount REAL,
    total REAL,
    FOREIGN KEY(invoice_id) REFERENCES pos_invoices(id),
    FOREIGN KEY(sku) REFERENCES products(sku)
);

--------------------------------------------------------
-- TABLE: members (ข้อมูลสมาชิก)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_code TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    tier TEXT DEFAULT 'BRONZE',
    point REAL DEFAULT 0,
    total_spent REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------
-- TABLE: member_points_history (ประวัติแต้ม)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_points_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER,
    invoice_id INTEGER,
    point_change REAL,
    type TEXT,            -- earn / use
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id),
    FOREIGN KEY(invoice_id) REFERENCES pos_invoices(id)
);

--------------------------------------------------------
-- TABLE: membership_tiers (ค่า Tier)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tier_name TEXT UNIQUE,
    min_spent REAL,       -- ยอดซื้อสะสมขั้นต่ำ
    discount_rate REAL,   -- ส่วนลด %
    point_rate REAL       -- ได้แต้ม %
);

--------------------------------------------------------
-- SEED DEFAULT TIERS
--------------------------------------------------------
INSERT OR IGNORE INTO membership_tiers (tier_name, min_spent, discount_rate, point_rate) VALUES
('BRONZE',    0,     0, 1),   -- 1% point
('SILVER',  5000,   2, 1.5),
('GOLD',    20000,  3, 2),
('PLATINUM', 50000, 5, 3);

--------------------------------------------------------
-- INDEXES (เพิ่มความเร็ว)
--------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_invoice_member ON pos_invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_points_member ON member_points_history(member_id);
