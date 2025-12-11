-- ตารางสมาชิกหลัก
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    tier TEXT DEFAULT 'Normal',
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ประวัติการได้แต้ม
CREATE TABLE IF NOT EXISTS member_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    points INTEGER NOT NULL,
    source TEXT, -- เช่น “ขายสินค้า”, “ปรับแต้ม”
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id)
);

-- Tier rule
CREATE TABLE IF NOT EXISTS member_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tier TEXT UNIQUE NOT NULL,
    min_points INTEGER NOT NULL
);

-- seed ค่า Tier เบื้องต้น
INSERT OR IGNORE INTO member_tiers (tier, min_points) VALUES
('Normal', 0),
('Silver', 2000),
('Gold', 5000),
('VIP', 10000);
