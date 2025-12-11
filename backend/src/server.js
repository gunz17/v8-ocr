const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PORT, UPLOAD_DIR } = require('./config/env');
const db = require('./db/sqlite');

// Import Routes (เอา Comment ออกแล้ว)
const ocrRoutes = require('./routes/ocr');
// const posRoutes = require('./routes/pos'); // เดี๋ยวค่อยมาเปิดตอนทำ POS

const app = express();

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