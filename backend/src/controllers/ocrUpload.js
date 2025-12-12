const db = require('../db/sqlite');
const ocrService = require('../services/ocrService');
const mappingEngine = require('../ai/mappingEngine'); 

exports.handleUpload = (req, res) => {
    // 1. Validation
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    console.log(`📂 [Upload] File received: ${file.filename}`);

    // 2. Database Insert (ใช้ db.run แบบ Callback ของ sqlite3)
    const sql = `INSERT INTO ocr_uploads (filename, original_name, file_path, status) VALUES (?, ?, ?, ?)`;
    const params = [file.filename, file.originalname, file.path, 'pending'];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('❌ Database Insert Error:', err);
            return res.status(500).json({ error: err.message });
        }

        // 'this.lastID' คือ ID ของ row ที่เพิ่ง insert (เฉพาะใน function callback แบบปกติ ไม่ใช่ arrow func)
        const uploadId = this.lastID;

        // 3. Response ทันที
        res.json({
            success: true,
            message: '✅ File uploaded. Processing started.',
            uploadId: uploadId
        });

        // 4. Background Task
        processOCRInBackground(uploadId, file.path);
    });
};

// ฟังก์ชัน Background Worker
async function processOCRInBackground(uploadId, filePath) {
    console.log(`⚡ [Background] Starting OCR for ID: ${uploadId}`);
    
    try {
        // Update Status -> Processing
        updateStatus(uploadId, 'processing');

        // Call OCR
        const rawText = await ocrService.extractText(filePath);
        
        // Call AI Mapping
        const resultData = await mappingEngine.process(rawText);
        const resultJson = JSON.stringify(resultData);

        // Update Status -> Completed & Save Data
        const updateSql = `UPDATE ocr_uploads SET status = 'completed', raw_text = ?, result_json = ? WHERE id = ?`;
        
        db.run(updateSql, [rawText, resultJson, uploadId], (err) => {
            if (err) console.error(`❌ Error saving result for ID ${uploadId}:`, err);
            else console.log(`✅ [Background] Job ID ${uploadId} Completed.`);
        });

    } catch (error) {
        console.error(`☠️ [Background Error] ID ${uploadId}:`, error.message);
        // Update Status -> Failed
        const failSql = `UPDATE ocr_uploads SET status = 'failed', error_message = ? WHERE id = ?`;
        db.run(failSql, [error.message, uploadId]);
    }
}

// Helper function to update status
function updateStatus(id, status) {
    db.run("UPDATE ocr_uploads SET status = ? WHERE id = ?", [status, id]);
    // ... โค้ดเดิมด้านบน ...

// ✅ ฟังก์ชันสำหรับดึงผลลัพธ์ (Polling)
exports.getResult = (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: 'Missing ID' });
    }

    const sql = "SELECT * FROM ocr_uploads WHERE id = ?";
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('❌ Database Fetch Error:', err);
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // แปลง JSON string ใน DB กลับมาเป็น Object เพื่อส่งให้หน้าบ้าน
        let resultData = null;
        if (row.result_json) {
            try {
                resultData = JSON.parse(row.result_json);
            } catch (e) {
                resultData = row.result_json; // กรณี parse ไม่ได้ ให้ส่งเป็น string เดิม
            }
        }

        res.json({
            id: row.id,
            status: row.status, // pending, processing, completed, failed
            data: resultData,   // ข้อมูล JSON ที่ AI ทำเสร็จแล้ว
            raw_text: row.raw_text,
            error: row.error_message
        });
    });
};
}