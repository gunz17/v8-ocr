const path = require('path');

module.exports = {
    PORT: process.env.PORT || 3001,
    DB_PATH: path.resolve(__dirname, '../../database.sqlite'),
    UPLOAD_DIR: path.resolve(__dirname, '../../uploads'), // ต้องแน่ใจว่าบรรทัดนี้พิมพ์ถูก
    GOOGLE_APPLICATION_CREDENTIALS: path.resolve(__dirname, 'google_ocr_key.json')
};