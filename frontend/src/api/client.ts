import axios from 'axios';
import type { ApiResponse, FormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  // Start new chat session
  startNewSession: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/chat/start');
    return response.data;
  },

  // Upload PDF for analysis
  uploadPdf: async (sessionId: string, file: File): Promise<{ success: boolean; message: string; analysis: any }> => {
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('sessionId', sessionId);

    const response = await apiClient.post('/chat/upload', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Send message
  sendMessage: async (
    sessionId: string,
    message: string,
    formData: FormData
  ): Promise<ApiResponse> => {
    const response = await apiClient.post('/chat', {
      sessionId,
      message,
      formData,
    });
    return response.data;
  },

  // Generate PDF
  generatePdf: async (sessionId: string, formData: FormData): Promise<Blob> => {
    const response = await apiClient.post(
      '/pdf/generate',
      {
        sessionId,
        formData,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Generate Email
  generateEmail: async (sessionId: string, formData: FormData): Promise<{ emailDraft: string }> => {
    const response = await apiClient.post('/email/generate', {
      sessionId,
      formData,
    });
    return response.data;
  },
};

export default apiClient;
