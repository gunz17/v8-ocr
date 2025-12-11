import { create } from 'zustand';
import axios from 'axios';

// ✅ ต้องมีคำว่า export const นำหน้า
export const useOcrStore = create((set, get) => ({
  isUploading: false,
  uploadStatus: null,
  ocrResult: null,
  error: null,

  uploadBill: async (file) => {
    set({ isUploading: true, error: null, uploadStatus: null });
    const formData = new FormData();
    formData.append('billImage', file);

    try {
      // ยิงไปที่ Path นี้
      const response = await axios.post('/api/ocr/upload', formData, {
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

// ❌ อย่ามี export default useOcrStore; ตรงนี้ (ลบทิ้งไปเลย)