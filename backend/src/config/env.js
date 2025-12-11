const path = require('path');

module.exports = {
    PORT: process.env.PORT || 3001,
    // ระวังเครื่องหมาย .. (จุดจุด) ต้องมี 2 ครั้ง เพราะไฟล์นี้อยู่ใน src/config
    DB_PATH: path.resolve(__dirname, '../../database.sqlite'),
    UPLOAD_DIR: path.resolve(__dirname, '../../uploads'), 
    GOOGLE_APPLICATION_CREDENTIALS: path.resolve(__dirname, 'google_ocr_key.json')
};