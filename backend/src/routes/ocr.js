const express = require('express');
const router = express.Router();
const ocrUploadController = require('../controllers/ocrUpload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===========================================
// 1. ตั้งค่าที่เก็บไฟล์ (Multer Config) - *ส่วนนี้สำคัญมาก ห้ามหาย*
// ===========================================
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// ===========================================
// 2. กำหนดเส้นทาง (Routes)
// ===========================================

// Route A: Upload รูป (POST)
// ต้องมี upload.single('billImage') เพื่อรับไฟล์จากหน้าบ้าน
router.post('/upload', upload.single('billImage'), ocrUploadController.handleUpload);

// Route B: ดูผลลัพธ์ (GET) ✅ เพิ่มส่วนนี้เข้ามาครับ
// เอาไว้ให้หน้าบ้านยิงมาถามว่า AI ทำงานเสร็จหรือยัง
router.get('/result/:id', ocrUploadController.getResult);

module.exports = router;