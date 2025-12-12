import { create } from 'zustand';
import axios from 'axios';

// 1. สร้าง Store เก็บไว้ในตัวแปร
const useOcrStore = create((set, get) => ({
  isUploading: false,
  uploadStatus: null,
  ocrResult: null,
  error: null,

  uploadBill: async (file) => {
    set({ isUploading: true, error: null, uploadStatus: null });
    const formData = new FormData();
    formData.append('billImage', file);

    try {
      // Hardcode URL ไปก่อน เพื่อความชัวร์ว่ายิงถูกที่
      const response = await axios.post('http://localhost:3001/api/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Upload Success:', response.data);
      set({ 
        isUploading: false, 
        uploadStatus: 'success',
        ocrResult: response.data 
      });
    } catch (err) {
      console.error('❌ Upload Failed:', err);
      set({ 
        isUploading: false, 
        uploadStatus: 'error', 
        error: err.response?.data?.error || 'Upload failed' 
      });
    }
  },

  resetStore: () => set({ isUploading: false, uploadStatus: null, ocrResult: null, error: null })
}));

// ✅ ไม้ตาย: ส่งออกทั้ง 2 แบบ (ใครเรียกแบบไหนก็เจอหมด)
export { useOcrStore }; // สำหรับคนใช้ { }
export default useOcrStore; // สำหรับคนไม่ใช้ { }