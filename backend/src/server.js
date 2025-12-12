const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/sqlite'); // เชื่อม Database
const ocrRoutes = require('./routes/ocr'); // ✅ เรียกใช้ Router ที่เราเพิ่งแก้

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // ให้ Frontend ดึงรูปได้

// ✅ เพิ่มหน้าแรก: ให้รู้ว่า Server ยังอยู่ดี
app.get('/', (req, res) => {
    res.send('<h1>🚀 Gracie V8 Backend is Running!</h1><p>Ready to process OCR.</p>');
});

// เชื่อมต่อ API Route
app.use('/api/ocr', ocrRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📂 Database connected.`);
});