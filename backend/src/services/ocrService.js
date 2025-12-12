// backend/src/services/ocrService.js
const vision = require('@google-cloud/vision');
const path = require('path');

// ชี้ไปที่ไฟล์ JSON ที่เราเพิ่งสร้าง (keyFilename)
const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, '../../google-credentials.json') 
});

exports.extractText = async (filePath) => {
    try {
        console.log(`☁️ [Google Vision] Processing file: ${filePath}`);

        // สั่งให้ Google อ่านข้อความจากรูปภาพ (TEXT_DETECTION)
        const [result] = await client.textDetection(filePath);
        
        const detections = result.textAnnotations;
        
        if (!detections || detections.length === 0) {
            console.warn("⚠️ No text found in the image.");
            return "";
        }

        // detections[0] คือข้อความทั้งหมดที่อ่านได้แบบรวดเดียว
        const fullText = detections[0].description;
        
        console.log(`✅ [Google Vision] Success! Extracted ${fullText.length} characters.`);
        
        return fullText;

    } catch (error) {
        console.error('❌ [Google Vision Error]:', error.message);
        throw error;
    }
};