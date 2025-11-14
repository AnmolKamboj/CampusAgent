import axios from 'axios';
import type { ApiResponse, FormData, FormType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  // Get available forms
  getForms: async (): Promise<{ forms: any[] }> => {
    try {
      const response = await apiClient.get('/chat/forms');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch forms from API:', error);
      // Return empty array, App.tsx will use default forms
      return { forms: [] };
    }
  },

  // Start new chat session (supports both FormType and template ID string)
  startNewSession: async (formType?: FormType | string): Promise<{ sessionId: string; message: string; formType?: FormType | string }> => {
    const response = await apiClient.post('/chat/start', { formType });
    return response.data;
  },

  // Send message (supports both FormType and template ID string)
  sendMessage: async (
    sessionId: string,
    message: string,
    formData: FormData,
    formType?: FormType | string,
    useAutoFill?: boolean
  ): Promise<ApiResponse> => {
    const response = await apiClient.post('/chat', {
      sessionId,
      message,
      formData,
      formType,
      useAutoFill,
    });
    return response.data;
  },

  // Generate PDF (supports both FormType and template ID string)
  generatePdf: async (formData: FormData, formType: FormType | string): Promise<Blob> => {
    const response = await apiClient.post(
      '/pdf/generate',
      {
        formData,
        formType,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Generate Email (supports both FormType and template ID string)
  generateEmail: async (formData: FormData, formType: FormType | string): Promise<{ emailDraft: string }> => {
    const response = await apiClient.post('/email/generate', {
      formData,
      formType,
    });
    return response.data;
  },
};

export const adminApi = {
  // Get all form templates
  getForms: async (): Promise<{ templates: any[] }> => {
    const response = await apiClient.get('/admin/forms');
    return response.data;
  },

  // Get active form templates
  getActiveForms: async (): Promise<{ templates: any[] }> => {
    const response = await apiClient.get('/admin/forms/active');
    return response.data;
  },

  // Get single form template
  getForm: async (id: string): Promise<{ template: any }> => {
    const response = await apiClient.get(`/admin/forms/${id}`);
    return response.data;
  },

  // Upload new form template
  uploadForm: async (file: File, name: string, description?: string): Promise<{ template: any; message: string }> => {
    // Use browser's FormData (not the imported FormData type)
    const formDataObj = new FormData();
    formDataObj.append('pdf', file);
    formDataObj.append('name', name);
    if (description) {
      formDataObj.append('description', description);
    }

    const response = await apiClient.post('/admin/forms/upload', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update form template
  updateForm: async (id: string, updates: { name?: string; description?: string; isActive?: boolean }): Promise<{ template: any }> => {
    const response = await apiClient.patch(`/admin/forms/${id}`, updates);
    return response.data;
  },

  // Delete form template
  deleteForm: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/admin/forms/${id}`);
    return response.data;
  },

  // Toggle form active status
  toggleForm: async (id: string): Promise<{ template: any }> => {
    const response = await apiClient.patch(`/admin/forms/${id}/toggle`);
    return response.data;
  },
};

export default apiClient;
