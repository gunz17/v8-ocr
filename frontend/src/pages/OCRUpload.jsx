import React, { useState } from 'react';
import { useOcrStore } from '../store/ocrStore';

const OCRUpload = () => {
  const { uploadBill, isUploading, uploadStatus, ocrResult, error } = useOcrStore();
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // โชว์รูปตัวอย่าง
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
      await uploadBill(fileInput.files[0]);
    } else {
      alert("Please select a file first!");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📄 Upload Receipt (OCR)</h1>
      
      {/* Box อัปโหลด */}
      <div style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
        <input 
          id="fileInput" 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ marginBottom: '10px' }}
        />
        {preview && (
          <div>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }} />
          </div>
        )}
      </div>

      {/* ปุ่มกด */}
      <button 
        onClick={handleUpload} 
        disabled={isUploading}
        style={{ 
          width: '100%', 
          padding: '10px', 
          backgroundColor: isUploading ? '#ccc' : '#007bff', 
          color: '#fff', 
          border: 'none', 
          cursor: isUploading ? 'not-allowed' : 'pointer' 
        }}
      >
        {isUploading ? '⏳ Analyzing with AI...' : '🚀 Upload & Scan'}
      </button>

      {/* แสดงผลลัพธ์ */}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>❌ Error: {error}</p>}
      
      {uploadStatus === 'success' && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', color: '#155724' }}>
          <h3>✅ Success!</h3>
          <p>File uploaded ID: {ocrResult?.uploadId}</p>
          <p>Filename: {ocrResult?.filename}</p>
          <p><i>(Check backend logs for OCR text result)</i></p>
        </div>
      )}
    </div>
  );
};

export default OCRUpload;