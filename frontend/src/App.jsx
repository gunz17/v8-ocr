import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import หน้าจอต่างๆ
import OCRUpload from './pages/OCRUpload';
import OCRReview from './pages/OCRReview';
// import POS from './pages/POS'; // (ไว้เปิดทีหลัง)
// import StockSync from './pages/StockSync'; // (ไว้เปิดทีหลัง)
// import PeakExport from './pages/PeakExport'; // (ไว้เปิดทีหลัง)

function App() {
  return (
    <div className="app-container">
      {/* 🟢 เมนูนำทางด้านบน */}
      <nav style={{ padding: '15px', background: '#333', color: 'white', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, display: 'inline-block', marginRight: '20px' }}>Gracie OCR Console V8</h2>
        <Link to="/" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>OCR Upload</Link>
        <Link to="/review" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>OCR Review</Link>
        {/* <Link to="/pos" style={{ color: '#aaa', marginRight: '15px' }}>POS (Coming Soon)</Link> */}
      </nav>

      {/* 🟢 ส่วนแสดงผลหน้าจอ (เปลี่ยนไปตาม URL) */}
      <Routes>
        <Route path="/" element={<OCRUpload />} />
        <Route path="/review" element={<OCRReview />} />
      </Routes>
    </div>
  );
}

export default App;