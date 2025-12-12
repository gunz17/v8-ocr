const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { parseOCRText } = require('./utils/parser');
const db = require('./db/sqlite'); // ตรวจสอบว่าไฟล์นี้มีอยู่จริง
// const ocrRoutes = require('./routes/ocr'); // เดี๋ยวเรามาเปิดบรรทัดนี้ทีหลัง

const app = express();
const PORT = 3001;

// ✅ ไม้ตาย: กำหนด Path ตรงๆ ไม่ต้องรออ่านจาก env
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const GOOGLE_KEY_PATH = path.join(__dirname, 'config/google_ocr_key.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
if (!fs.existsSync(UPLOAD_DIR)) {
    console.log('📂 Creating upload folder at:', UPLOAD_DIR);
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// --- ส่วน Route Upload (เขียนสดตรงนี้เลย เพื่อความชัวร์) ---
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Route สำหรับ Upload และเรียก Google OCR
app.post('/api/ocr/upload', upload.single('billImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log(`✅ File received: ${req.file.filename}`);
        
        // --- เริ่มเรียก Google Vision ---
        const vision = require('@google-cloud/vision');
        
        // เช็คว่ามีไฟล์ Key จริงไหม
        if (!fs.existsSync(GOOGLE_KEY_PATH)) {
            console.error("❌ Key file not found at:", GOOGLE_KEY_PATH);
            return res.status(500).json({ error: 'Google Key missing' });
        }

        const client = new vision.ImageAnnotatorClient({
            keyFilename: GOOGLE_KEY_PATH
        });

        console.log("🤖 Sending to Google OCR...");
        const [result] = await client.textDetection(req.file.path);
        const detections = result.textAnnotations;
        
        const fullText = detections.length > 0 ? detections[0].description : "";
        const parsedItems = parseOCRText(fullText); 
        console.log(`✨ Parsed ${parsedItems.length} items from bill.`);
        console.log("✨ OCR Result Length:", fullText.length);

        // ส่งผลลัพธ์กลับไปหน้าเว็บ
        res.json({
            message: 'Success',
            uploadId: Date.now(),
            filename: req.file.filename,
            text: fullText
        });

    } catch (error) {
        console.error('❌ Error processing:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📂 Uploads will be saved to: ${UPLOAD_DIR}`);
});