const db = require('../db/sqlite');
const ocrService = require('../services/ocrService');
const { parseOCRText } = require('../utils/parser');
const mappingEngine = require('../ai/mappingEngine'); // ✅ เรียกใช้สมอง AI ที่เราเพิ่งสร้าง

exports.handleUpload = (req, res) => {
    try {
        // 1. ตรวจสอบว่ามีไฟล์แนบมาไหม
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        console.log(`📂 File received: ${file.filename}`);

        // 2. บันทึกสถานะ "Processing" ลง Database ก่อน (User จะได้ไม่ต้องรอหน้าโหลดนาน)
        const sql = `INSERT INTO ocr_uploads (filename, original_name, file_path, status) VALUES (?, ?, ?, ?)`;
        const params = [file.filename, file.originalname, file.path, 'processing'];

        db.run(sql, params, async function(err) {
            if (err) {
                console.error('❌ Database Insert Error:', err);
                return res.status(500).json({ error: err.message });
            }
            
            const uploadId = this.lastID; // ได้เลข ID ของงานนี้มาถือไว้

            // 3. ตอบกลับ User ทันทีว่า "รับเรื่องแล้ว กำลังให้ AI ทำงาน"
            res.json({
                message: '✅ File uploaded. AI processing started...',
                uploadId: uploadId,
                filename: file.filename
            });

            // 4. --- เริ่มกระบวนการ AI (ทำงานเบื้องหลัง) ---
            try {
                // A. ให้ Google Vision อ่านภาพทั้งใบ
                console.log(`🤖 [ID:${uploadId}] Sending to Google OCR...`);
                const { fullText, rawResult } = await ocrService.processImage(file.path);
                
                // B. ให้ Parser แกะชื่อสินค้าและราคาออกมา (ยังเป็นชื่อดิบๆ จากบิล)
                console.log(`📜 [ID:${uploadId}] Parsing text lines...`);
                const rawItems = parseOCRText(fullText);
                
                // C. 🧠 ให้ AI Mapping ทำงาน! (ส่วนสำคัญที่สุด)
                console.log(`🧠 [ID:${uploadId}] AI Mapping Engine running...`);
                
                // C1. นักสืบร้านค้า: หาว่าบิลนี้มาจากร้านไหน (BigC, Makro, ฯลฯ)
                const vendor = await mappingEngine.detectVendor(fullText);
                if (vendor) console.log(`   -> Vendor Found: ${vendor.name}`);
                
                // C2. นักจับคู่สินค้า: วนลูปสินค้าทุกตัว เพื่อหาคู่ใน PEAK DB
                const mappedItems = await Promise.all(rawItems.map(async (item) => {
                    // ลองค้นหาในฐานข้อมูลสินค้า 4,900 รายการ
                    const match = await mappingEngine.matchProduct(item.name);
                    
                    if (match) {
                        return {
                            ...item,                // ข้อมูลเดิม (qty, price, total)
                            peak_code: match.code,  // รหัสสินค้า PEAK ที่เจอ (เช่น P001)
                            peak_name: match.name,  // ชื่อสินค้าใน PEAK
                            confidence: match.confidence, // ความมั่นใจ (0.0 - 1.0)
                            match_source: match.matchSource, // เจอจาก memory หรือเดาเอา?
                            is_mapped: true
                        };
                    } else {
                        return { 
                            ...item, 
                            is_mapped: false // หาไม่เจอ (เดี๋ยวให้ User ไปเลือกเองหน้าเว็บ)
                        };
                    }
                }));

                // 5. เตรียมผลลัพธ์สุดท้าย
                const finalResult = {
                    vendor: vendor,        // ข้อมูลร้านค้าที่เจอ
                    items: mappedItems,    // รายการสินค้าที่จับคู่รหัสแล้ว
                    raw_text: fullText     // ข้อความดิบ (เผื่อไว้ debug)
                };

                // 6. บันทึกผลลัพธ์ลงตาราง ocr_results
                // (ต้องแปลง JSON เป็น String ก่อนบันทึก)
                const insertResultSql = `INSERT INTO ocr_results (upload_id, raw_json, items_json) VALUES (?, ?, ?)`;
                db.run(insertResultSql, [uploadId, JSON.stringify(rawResult), JSON.stringify(finalResult)], (e) => {
                    if (e) console.error('❌ Failed to save OCR result:', e);
                    else console.log(`💾 [ID:${uploadId}] AI Analysis Saved Successfully.`);
                });

                // 7. เปลี่ยนสถานะงานเป็น "Processed" (เสร็จสมบูรณ์)
                db.run(`UPDATE ocr_uploads SET status = 'processed' WHERE id = ?`, [uploadId]);

            } catch (aiError) {
                console.error('❌ AI Processing Failed:', aiError);
                // ถ้าพังกลางทาง ให้เปลี่ยนสถานะเป็น error
                db.run(`UPDATE ocr_uploads SET status = 'error' WHERE id = ?`, [uploadId]);
            }
        });

    } catch (error) {
        console.error('❌ Controller Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};