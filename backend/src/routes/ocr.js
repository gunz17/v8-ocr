const express = require('express');
const router = express.Router();
const ocrUploadController = require('../controllers/ocrUpload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ตั้งค่าที่เก็บไฟล์
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// กำหนดเส้นทาง
router.post('/upload', upload.single('billImage'), ocrUploadController.handleUpload);

module.exports = router;