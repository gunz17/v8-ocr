const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// const { PORT, UPLOAD_DIR } = require('./config/env'); // ❌ ลบบรรทัดนี้ทิ้ง หรือ Comment ไว้

// ✅ ใส่ค่าตรงๆ ตรงนี้เลย (แก้ปัญหาหาตัวแปรไม่เจอ)
const PORT = 3001;
const UPLOAD_DIR = path.join(__dirname, '../uploads'); 

const db = require('./db/sqlite');
const ocrRoutes = require('./routes/ocr');

const app = express();
// ... (โค้ดส่วนล่างเหมือนเดิม)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.get('/', (req, res) => {
    res.json({ message: '🚀 Gracie AI Backend v8 is Running!' });
});

// Register Routes (เปิดใช้งานเส้นทาง OCR)
app.use('/api/ocr', ocrRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});