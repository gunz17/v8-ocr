// backend/src/controllers/ocrUpload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage }).single("file");

module.exports = (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: "Upload error", details: err });

    res.json({
      status: "uploaded",
      file_path: req.file.path,
      file_name: req.file.filename
    });
  });
};
