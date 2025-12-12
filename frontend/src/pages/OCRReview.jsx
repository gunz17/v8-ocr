import React, { useEffect, useState } from 'react';
import { useOcrStore } from '../store/ocrStore';
import { useNavigate } from 'react-router-dom';

const OCRReview = () => {
  const { ocrResult } = useOcrStore();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // ถ้ามีข้อมูลจากหน้า Upload ให้เอามาใส่ตาราง
    if (ocrResult && ocrResult.items) {
      setItems(ocrResult.items);
    }
  }, [ocrResult]);

  // ถ้ายังไม่ได้ Upload ให้เด้งกลับไปหน้าแรก
  if (!ocrResult) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>🚫 No Data</h2>
        <p>Please upload a receipt first.</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧐 Review Receipt Items</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* รูปใบเสร็จ (ซ้าย) */}
        <div style={{ flex: 1 }}>
           <h3>Original Image</h3>
           <img 
             src={`http://localhost:3001/uploads/${ocrResult.filename}`} 
             alt="Receipt" 
             style={{ width: '100%', border: '1px solid #ddd', borderRadius: '8px' }}
           />
        </div>

        {/* ตารางรายการ (ขวา) */}
        <div style={{ flex: 2 }}>
          <h3>Detected Items ({items.length})</h3>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th>Item Name (OCR)</th>
                <th>Price</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].name = e.target.value;
                        setItems(newItems);
                      }}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </td>
                  <td>{item.price}</td>
                  <td>{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button style={{ marginTop: '20px', width: '100%', padding: '15px', background: '#28a745', color: 'white', border: 'none', fontSize: '16px', cursor: 'pointer' }}>
            ✅ Confirm & Save to Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default OCRReview;