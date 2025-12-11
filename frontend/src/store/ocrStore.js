import { create } from 'zustand';
import axios from 'axios';

// ใส่ export const ไว้ข้างหน้าเลย
export const useOcrStore = create((set, get) => ({
  isUploading: false,
  uploadStatus: null,
  ocrResult: null,
  error: null,

  uploadBill: async (file) => {
    // ... (โค้ดเดิมข้างในเหมือนเดิม) ...
    set({ isUploading: true, error: null, uploadStatus: null });
    const formData = new FormData();
    formData.append('billImage', file);

    try {
      const response = await axios.post('/api/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ 
        isUploading: false, 
        uploadStatus: 'success',
        ocrResult: response.data 
      });
    } catch (err) {
      set({ 
        isUploading: false, 
        uploadStatus: 'error', 
        error: err.response?.data?.error || 'Upload failed' 
      });
    }
  },

  resetStore: () => set({ isUploading: false, uploadStatus: null, ocrResult: null, error: null })
}));

// ลบบรรทัด export default useOcrStore; ทิ้งไปเลย