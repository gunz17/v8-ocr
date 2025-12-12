const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

exports.extractText = async (filePath) => {
    try {
        console.log(`🔍 [OCR Service] Processing file: ${filePath}`);

        // ตรวจสอบว่าไฟล์มีอยู่จริงไหม
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
        }

        // เริ่มกระบวนการ OCR (ภาษาไทย + อังกฤษ)
        const { data: { text } } = await Tesseract.recognize(
            filePath,
            'tha+eng', // รองรับไทยและอังกฤษ
            {
                logger: m => {
                    // Log ความคืบหน้า (ถ้าอยากเห็นก็ uncomment ได้)
                    // if (m.status === 'recognizing text') console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
                }
            }
        );

        const cleanText = text.trim();
        console.log(`✅ [OCR Service] Extracted ${cleanText.length} characters.`);
        
        return cleanText;

    } catch (error) {
        console.error('❌ [OCR Service Error]:', error);
        throw error; // ส่ง Error กลับไปให้ Controller จัดการ
    }
};