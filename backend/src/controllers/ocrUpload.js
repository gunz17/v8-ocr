const db = require('../db/sqlite');
const ocrService = require('../services/ocrService');
const { parseOCRText } = require('../utils/parser');
const mappingEngine = require('../ai/mappingEngine');

exports.handleUpload = (req, res) => {
    try {
        // 1. ตรวจสอบว่ามีไฟล์ส่งมาไหม
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        console.log(`📂 File received: ${file.filename}`);

        // 2. บันทึกสถานะ "Processing" ลง Database ก่อน (เพื่อให้ User ไม่ต้องรอนาน)
        const sql = `INSERT INTO ocr_uploads (filename, original_name, file_path, status) VALUES (?, ?, ?, ?)`;
        const params = [file.filename, file.originalname, file.path, 'processing'];

        db.run(sql, params, async function(err) {
            if (err) {
                console.error('Database Insert Error:', err);
                return res.status(500).json({ error: err.message });
            }
            
            const uploadId = this.lastID; // ได้ ID ของการอัปโหลดนี้มา

            // 3. ตอบกลับ User ทันทีว่า "ได้รับไฟล์แล้ว" (Async Processing)
            res.json({
                message: '✅ File uploaded. AI processing started...',
                uploadId: uploadId,
                filename: file.filename
            });

            // 4. --- เริ่มกระบวนการ AI เบื้องหลัง ---
            try {
                // A. ให้ Google อ่านภาพ
                console.log(`🤖 [ID:${uploadId}] Sending to Google OCR...`);
                const { fullText, rawResult } = await ocrService.processImage(file.path);
                
                // B. แกะรายการสินค้าดิบๆ (Parser)
                console.log(`📜 [ID:${uploadId}] Parsing text...`);
                const rawItems = parseOCRText(fullText);
                
                // C. 🧠 ให้สมอง AI ทำงาน (Mapping Engine)
                console.log(`🧠 [ID:${uploadId}] AI Mapping Engine running...`);
                
                // C1. สืบหาร้านค้า (Vendor Detection)
                const vendor = await mappingEngine.detectVendor(fullText);
                
                // C2. จับคู่สินค้า (Product Matching)
                const mappedItems = await Promise.all(rawItems.map(async (item) => {
                    // ลองให้ AI หาคู่ให้
                    const match = await mappingEngine.matchProduct(item.name);
                    
                    if (match) {
                        return {
                            ...item,                // ข้อมูลเดิม (name, qty, price)
                            peak_code: match.code,  // รหัสสินค้า PEAK
                            peak_name: match.name,  // ชื่อสินค้าใน PEAK
                            confidence: match.confidence, // ความมั่นใจ
                            match_source: match.matchSource,
                            is_mapped: true
                        };
                    } else {
                        return { 
                            ...item, 
                            is_mapped: false // ไม่เจอ (เดี๋ยว User ต้องเลือกเอง)
                        };
                    }
                }));

                // 5. เตรียมผลลัพธ์สุดท้าย
                const finalResult = {
                    vendor: vendor,        // ร้านค้าที่เจอ
                    items: mappedItems,    // รายการสินค้าพร้อมรหัส PEAK
                    raw_text: fullText     // ข้อความดิบ (เผื่อใช้ debug)
                };

                // 6. บันทึกลงตาราง ocr_results
                const insertResultSql = `INSERT INTO ocr_results (upload_id, raw_json, items_json) VALUES (?, ?, ?)`;
                db.run(insertResultSql, [uploadId, JSON.stringify(rawResult), JSON.stringify(finalResult)], (e) => {
                    if (e) console.error('❌ Failed to save OCR result:', e);
                    else console.log(`💾 [ID:${uploadId}] Result saved successfully.`);
                });

                // 7. อัปเดตสถานะเป็น "Processed" (เสร็จสมบูรณ์)
                db.run(`UPDATE ocr_uploads SET status = 'processed' WHERE id = ?`, [uploadId]);

            } catch (aiError) {
                console.error('❌ AI Processing Failed:', aiError);
                // ถ้าพัง ให้เปลี่ยนสถานะเป็น error
                db.run(`UPDATE ocr_uploads SET status = 'error' WHERE id = ?`, [uploadId]);
            }
        });

    } catch (error) {
        console.error('❌ Upload Controller Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};