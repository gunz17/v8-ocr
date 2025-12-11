const path = require('path');

// ✅ ต้องใช้ module.exports = { ... } เท่านั้น
module.exports = {
    PORT: process.env.PORT || 3001,
    // ใช้ .. สองครั้งเพื่อถอยจาก config -> src -> backend
    DB_PATH: path.resolve(__dirname, '../../database.sqlite'),
    UPLOAD_DIR: path.resolve(__dirname, '../../uploads'),
    GOOGLE_APPLICATION_CREDENTIALS: path.resolve(__dirname, 'google_ocr_key.json')
};