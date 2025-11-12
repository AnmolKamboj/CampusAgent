import axios from 'axios';
import { ApiResponse, FormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  sendMessage: async (sessionId: string, message: string, formData: FormData): Promise<ApiResponse> => {
    const response = await apiClient.post('/chat', {
      sessionId,
      message,
      formData,
    });
    return response.data;
  },

  startNewSession: async (): Promise<{ sessionId: string; message: string }> => {
    const response = await apiClient.post('/chat/start');
    return response.data;
  },

  generatePdf: async (sessionId: string, formData: FormData): Promise<Blob> => {
    const response = await apiClient.post('/pdf/generate', {
      sessionId,
      formData,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateEmail: async (sessionId: string, formData: FormData): Promise<{ emailDraft: string }> => {
    const response = await apiClient.post('/email/generate', {
      sessionId,
      formData,
    });
    return response.data;
  },
};

export default apiClient;

