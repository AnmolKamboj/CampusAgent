import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';

interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  uploadedAt: string;
  isActive: boolean;
  fields: any[];
  requiredFields: string[];
  optionalFields: string[];
}

export default function AdminPanel() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getForms();
      setTemplates(response.templates || []);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      setError('Failed to load forms. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formName.trim()) {
      setError('Please select a PDF file and enter a form name');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminApi.uploadForm(selectedFile, formName.trim(), formDescription.trim() || undefined);
      setSuccess(`Form uploaded successfully! ${response.template.fields.length} fields detected.`);
      setFormName('');
      setFormDescription('');
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await loadTemplates();
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      await adminApi.deleteForm(id);
      setSuccess('Form deleted successfully');
      await loadTemplates();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete form');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminApi.toggleForm(id);
      await loadTemplates();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to toggle form status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel - Form Management</h1>
          <p className="text-gray-600">Upload and manage PDF form templates</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
            <button
              onClick={() => setSuccess(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload New Form</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Change of Major Form"
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Brief description of this form"
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File <span className="text-red-500">*</span>
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !formName.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading & Analyzing...' : 'Upload & Analyze Form'}
            </button>
            {uploading && (
              <p className="text-sm text-gray-600">
                This may take a moment. The AI is analyzing your PDF to extract form fields...
              </p>
            )}
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Uploaded Forms</h2>
            <button
              onClick={loadTemplates}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {loading ? (
            <p className="text-gray-600">Loading forms...</p>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No forms uploaded yet</p>
              <p className="text-sm text-gray-400">Upload a PDF form to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>
                          📄 {template.fileName}
                        </span>
                        <span>
                          📅 {new Date(template.uploadedAt).toLocaleDateString()}
                        </span>
                        <span>
                          📋 {template.fields.length} fields
                        </span>
                        <span>
                          ✓ {template.requiredFields.length} required
                        </span>
                        <span>
                          ○ {template.optionalFields.length} optional
                        </span>
                      </div>
                      {template.fields.length > 0 && (
                        <details className="mt-3">
                          <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                            View fields
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              {template.fields.map((field, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className={field.isRequired ? 'text-red-500' : 'text-gray-400'}>
                                    {field.isRequired ? '●' : '○'}
                                  </span>
                                  <span className="font-medium">{field.label}</span>
                                  <span className="text-gray-400">({field.type})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggle(template.id)}
                        className={`px-3 py-1 text-sm rounded ${
                          template.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {template.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(template.id, template.name)}
                        className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

