// backend/src/routes/pos.js
const express = require("express");
const router = express.Router();

const posSell = require("../controllers/posSell");
const posHold = require("../controllers/posHold");
const posResume = require("../controllers/posResume");
const posScan = require("../controllers/posScan");
const posItems = require("../controllers/posItems");

// ยิงบาร์โค้ด → เพิ่มรายการขาย
router.post("/scan", posScan);

// ขายสินค้า
router.post("/sell", posSell);

// พักบิล
router.post("/hold", posHold);

// นำบิลกลับมาขายต่อ
router.post("/resume", posResume);

// ดึงข้อมูลสินค้าในระบบ POS
router.get("/items", posItems);

module.exports = router;
