const router = express.Router();
const controller = require('../controllers/ocrUpload');

// Route เดิม
router.post('/upload', controller.handleUpload);

// ✅ Route ใหม่ (เพิ่มบรรทัดนี้)
router.get('/result/:id', controller.getResult); 

module.exports = router;